import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";
import { paymentCallbackSchema } from "../validations/payment.validation.js";
import {
    createMyFatoorahPayment,
    getMyFatoorahPayment,
} from "../services/myfatoorah.service.js";
import {
    markPaymentAsPaid,
    releaseStockForExpiredPayment,
} from "../services/payment.service.js";
import { verifyMyFatoorahSignature } from "../utils/myfatoorahSignature.js";

export const createPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    const order = await Order.findOne({
        _id: orderId,
        user: req.user._id,
        paymentMethod: "online",
    });

    if (!order) {
        throw new ErrorHandler("Online order not found", 404);
    }

    if (order.paymentStatus !== "pending") {
        throw new ErrorHandler("This order is no longer awaiting payment", 400);
    }

    if (order.orderStatus !== "pending") {
        throw new ErrorHandler("This order can no longer be paid", 400);
    }

    // Idempotent lookup: a pending payment already exists with an invoice.
    // Return the SAME URL instead of creating a duplicate invoice.
    let payment = await Payment.findOne({
        order: order._id,
    });

    if (payment?.status === "paid") {
        throw new ErrorHandler("This order has already been paid", 400);
    }

    if (payment?.status === "expired") {
        throw new ErrorHandler("This order's payment period has expired", 400);
    }

    if (payment?.status === "pending" && payment.paymentUrl) {
        return res.status(200).json({
            success: true,
            message: "Payment already created",
            data: {
                invoiceId: payment.invoiceId,
                paymentUrl: payment.paymentUrl,
            },
        });
    }

    if (!payment) {
        payment = await Payment.create({
            order: order._id,
            user: req.user._id,
            provider: "myfatoorah",
            amount: order.totalPrice,
            currency: "KWD",
            status: "pending",
        });
    }

    if (payment.amount !== order.totalPrice) {
        throw new ErrorHandler(
            "Payment amount does not match order amount",
            409,
        );
    }

    try {
        const result = await createMyFatoorahPayment({
            amount: payment.amount,
            orderId: order._id.toString(),
            customer: {
                name: order.shippingAddress.fullName,
                email: req.user.email,
            },
        });

        if (!result?.PaymentURL) {
            logger.error(
                { orderId: order._id.toString(), result },
                "[createPayment] MyFatoorah returned no PaymentURL",
            );
            throw new ErrorHandler(
                "Payment provider did not return a payment link",
                502,
            );
        }

        payment.invoiceId = result.InvoiceId;
        payment.paymentUrl = result.PaymentURL;
        payment.status = "pending";

        await payment.save();

        return res.status(201).json({
            success: true,
            message: "Payment created successfully",
            data: {
                invoiceId: payment.invoiceId,
                paymentUrl: payment.paymentUrl,
            },
        });
    } catch (error) {
        logger.error(
            { err: error, orderId: order._id.toString() },
            "[createPayment] MyFatoorah failed",
        );

        if (error instanceof ErrorHandler) {
            throw error;
        }

        throw new ErrorHandler(
            `Unable to create payment: ${error?.message || "payment provider error"}`,
            502,
        );
    }
});
export const paymentCallback = asyncHandler(async (req, res) => {
    // Base failed URL (no orderId yet — the payment record is resolved below).
    const failedUrl = `${process.env.CLIENT_URL}/payment/failed`;

    const result = paymentCallbackSchema.safeParse(req.query);

    if (!result.success) {
        logger.warn(
            { issues: result.error.flatten() },
            "[paymentCallback] invalid query",
        );
        return res.redirect(failedUrl);
    }

    const { paymentId } = result.data;

    try {
        const paymentResult = await getMyFatoorahPayment(paymentId);

        const invoiceStatus = paymentResult?.Invoice?.Status;
        const transaction = paymentResult?.Transaction;

        const payment = await Payment.findOne({
            invoiceId: paymentResult?.Invoice?.Id?.toString(),
        });

        if (!payment) {
            logger.warn(
                { invoiceId: paymentResult?.Invoice?.Id },
                "[paymentCallback] payment not found for invoice",
            );
            return res.redirect(failedUrl);
        }

        if (invoiceStatus === "PAID" && transaction?.Status === "SUCCESS") {
            const markResult = await markPaymentAsPaid({
                paymentId: payment._id,
                transaction,
                amount: paymentResult?.Amount?.ValueInPayCurrency,
            });

            if (markResult === "paid") {
                return res.redirect(
                    `${process.env.CLIENT_URL}/payment/success?orderId=${payment.order}`,
                );
            }

            logger.warn(
                { markResult, orderId: payment.order },
                "[paymentCallback] payment not marked as paid",
            );

            return res.redirect(
                `${process.env.CLIENT_URL}/payment/failed?orderId=${payment.order}`,
            );
        }

        logger.warn(
            { invoiceStatus, transactionStatus: transaction?.Status },
            "[paymentCallback] payment not paid",
        );

        if (invoiceStatus === "EXPIRED" && payment.status === "pending") {
            await releaseStockForExpiredPayment({
                paymentId: payment._id,
                reason: "Invoice expired",
            });
        }

        return res.redirect(
            `${process.env.CLIENT_URL}/payment/failed?orderId=${payment.order}`,
        );
    } catch (error) {
        logger.error({ err: error }, "[paymentCallback] error");
        return res.redirect(failedUrl);
    }
});
export const myFatoorahWebhook = asyncHandler(async (req, res) => {
    // Verify the signature first. If invalid, do not trust the payload.
    if (!verifyMyFatoorahSignature(req)) {
        logger.warn("[webhook] invalid signature");
        return res.status(401).json({
            success: false,
            message: "Invalid webhook signature",
        });
    }

    const event = req.body;

    if (!event?.Event?.Name) {
        logger.warn("[webhook] missing Event.Name");
        return res.status(400).json({
            success: false,
            message: "Missing event name",
        });
    }

    // Only handle the payment status change event.
    if (event.Event.Name !== "PAYMENT_STATUS_CHANGED") {
        logger.info({ eventName: event.Event.Name }, "[webhook] event ignored");
        return res.status(200).json({
            success: true,
            message: "Event ignored",
        });
    }

    const invoice = event.Data?.Invoice;
    const transaction = event.Data?.Transaction;

    if (!invoice?.Id) {
        return res.status(400).json({
            success: false,
            message: "Invoice ID missing",
        });
    }

    // Idempotency guard: a payment for this invoice already exists and is
    // already paid -> do nothing, avoid double-confirmation.
    const existingPayment = await Payment.findOne({
        invoiceId: invoice.Id.toString(),
    });

    if (existingPayment?.status === "paid") {
        logger.info(
            { invoiceId: invoice.Id },
            "[webhook] payment already confirmed, ignoring duplicate",
        );
        return res.status(200).json({
            success: true,
            message: "Payment already confirmed",
        });
    }

    if (!transaction?.PaymentId) {
        return res.status(400).json({
            success: false,
            message: "Payment ID missing",
        });
    }

    const paymentResult = await getMyFatoorahPayment(transaction.PaymentId);

    const invoiceStatus = paymentResult?.Invoice?.Status;
    const latestTransaction = paymentResult?.Transaction;

    if (invoiceStatus === "PAID" && latestTransaction?.Status === "SUCCESS") {
        const roundTo3 = (value) =>
            Math.round((Number(value) + Number.EPSILON) * 1000) / 1000;

        const expectedAmount = roundTo3(existingPayment?.amount ?? 0);
        const actualAmount = Number(paymentResult?.Amount?.ValueInPayCurrency);

        if (
            !Number.isFinite(actualAmount) ||
            Math.abs(actualAmount - expectedAmount) > 0.001
        ) {
            logger.warn(
                {
                    invoiceId: invoice.Id,
                    expected: expectedAmount,
                    actual: actualAmount,
                },
                "[webhook] amount mismatch, skipping payment",
            );
            return res.status(200).json({
                success: true,
                message: "Amount mismatch, not processing payment",
            });
        }

        if (!existingPayment?._id) {
            logger.error(
                { invoiceId: invoice.Id },
                "[webhook] paid invoice has no local payment record",
            );
            return res.status(200).json({
                success: true,
                message: "Payment record not found, ignoring",
            });
        }

        await markPaymentAsPaid({
            paymentId: existingPayment._id,
            transaction: latestTransaction,
            amount: actualAmount,
        });
    } else if (
        invoiceStatus === "EXPIRED" &&
        existingPayment?.status === "pending"
    ) {
        if (!existingPayment?._id) {
            return res.status(200).json({
                success: true,
                message: "Payment record not found, ignoring",
            });
        }

        await releaseStockForExpiredPayment({
            paymentId: existingPayment._id,
            reason: "Invoice expired",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Payment webhook processed",
    });
});
