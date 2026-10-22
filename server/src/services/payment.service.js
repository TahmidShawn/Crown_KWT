import mongoose from "mongoose";
import Payment from "../models/payment.model.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Cake from "../models/cake.model.js";

const roundKwd = (value) => Math.round((value + Number.EPSILON) * 1000) / 1000;

/*
 * `amount` is the paid amount from the MyFatoorah response
 * (paymentResult.Amount.ValueInPayCurrency). In the v3 response it lives next
 * to `Transaction`, not inside it, so the controller passes it in.
 */
export const markPaymentAsPaid = async ({ paymentId, transaction, amount }) => {
    const session = await mongoose.startSession();

    let result = "ignored";

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findById(paymentId).session(session);

            if (!payment) {
                throw new Error("Payment not found");
            }

            if (payment.status === "paid") {
                result = "paid";
                return;
            }

            if (payment.status !== "pending") {
                result = "ignored";
                return;
            }

            if (transaction?.Status !== "SUCCESS") {
                result = "ignored";
                return;
            }

            const order = await Order.findById(payment.order).session(session);

            if (!order) {
                throw new Error("Order not found");
            }

            const transactionAmount = Number(
                amount ?? transaction.Amount?.ValueInPayCurrency,
            );

            if (!Number.isFinite(transactionAmount)) {
                throw new Error("Payment amount is missing");
            }

            const expectedAmount = roundKwd(Number(payment.amount));
            const actualAmount = roundKwd(transactionAmount);

            if (
                actualAmount !== expectedAmount ||
                roundKwd(Number(order.totalPrice)) !== expectedAmount
            ) {
                throw new Error("Payment amount does not match order amount");
            }

            if (transaction.PaymentId) {
                const existingTransactionIndex = payment.transactions.findIndex(
                    (item) => item.paymentId === transaction.PaymentId,
                );

                const transactionData = {
                    paymentId: transaction.PaymentId,
                    transactionId: transaction.Id,
                    referenceId: transaction.ReferenceId,
                    status: transaction.Status,
                    paymentMethod: transaction.PaymentMethod,
                    amount: transactionAmount,
                    errorCode: transaction.Error?.Code,
                    errorMessage: transaction.Error?.Message,
                    processedAt: transaction.TransactionDate
                        ? new Date(transaction.TransactionDate)
                        : new Date(),
                };

                if (existingTransactionIndex === -1) {
                    payment.transactions.push(transactionData);
                } else {
                    payment.transactions[existingTransactionIndex] =
                        transactionData;
                }
            }

            if (
                order.paymentStatus !== "pending" ||
                order.orderStatus !== "pending"
            ) {
                if (order.paymentStatus === "paid") {
                    payment.status = "paid";
                    payment.paidAt = payment.paidAt || new Date();

                    await payment.save({ session });

                    result = "paid";

                    return;
                }

                result = "ignored";
                return;
            }

            payment.status = "paid";
            payment.paidAt = payment.paidAt || new Date();

            order.paymentStatus = "paid";
            order.orderStatus = "confirmed";

            order.statusHistory.push({
                status: "confirmed",
                note: "Payment received, order confirmed",
            });

            await payment.save({ session });
            await order.save({ session });

            await Cart.updateOne(
                {
                    user: order.user,
                },
                {
                    $pull: {
                        items: {
                            cake: {
                                $in: order.items.map((item) => item.cake),
                            },
                        },
                        addOns: {
                            addOn: {
                                $in: order.addOns.map((item) => item.addOn),
                            },
                        },
                    },
                },
                { session },
            );

            result = "paid";
        });
    } finally {
        await session.endSession();
    }

    return result;
};

export const releaseStockForExpiredPayment = async ({ paymentId, reason }) => {
    const session = await mongoose.startSession();

    let result = "ignored";

    try {
        await session.withTransaction(async () => {
            const payment = await Payment.findById(paymentId).session(session);

            if (!payment) {
                throw new Error("Payment not found");
            }

            if (payment.status !== "pending") {
                result = "ignored";
                return;
            }

            const order = await Order.findById(payment.order).session(session);

            if (!order) {
                throw new Error("Order not found");
            }

            if (
                order.paymentStatus !== "pending" ||
                order.orderStatus !== "pending"
            ) {
                result = "ignored";
                return;
            }

            for (const item of order.items) {
                const stockUpdate = await Cake.updateOne(
                    {
                        _id: item.cake,
                    },
                    {
                        $inc: {
                            stock: item.quantity,
                        },
                    },
                    { session },
                );

                if (stockUpdate.modifiedCount !== 1) {
                    throw new Error(
                        `Failed to restore stock for cake ${item.cake}`,
                    );
                }
            }

            payment.status = "expired";

            order.paymentStatus = "failed";
            order.orderStatus = "cancelled";
            order.cancelledAt = new Date();
            order.cancellationReason = reason || "Payment expired";

            order.statusHistory.push({
                status: "cancelled",
                note: "Order cancelled because payment expired",
            });

            await payment.save({ session });
            await order.save({ session });

            result = "expired";
        });
    } finally {
        await session.endSession();
    }

    return result;
};
