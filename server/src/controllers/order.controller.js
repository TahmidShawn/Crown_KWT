import mongoose from "mongoose";
import Order, { ORDER_STATUSES } from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Cake from "../models/cake.model.js";
import AddOn from "../models/addOn.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";

// KWD uses 3 decimal places
const round3 = (value) => Number(Number(value).toFixed(3));

// MyFatoorah rejects zero-amount invoices ("must be greater than 0").
// Smallest chargeable KWD unit: 0.100 (100 fils). Online orders below
// this are rejected at creation so the user picks COD or adds items.
const MIN_ONLINE_TOTAL = 0.1;

export const createOrder = asyncHandler(async (req, res) => {
    const { paymentMethod, cakeIds, addOns = [], shippingAddress } = req.body;

    const session = await mongoose.startSession();

    try {
        let createdOrder;

        await session.withTransaction(async () => {
            const cart = await Cart.findOne({
                user: req.user._id,
            }).session(session);

            if (!cart || !cart.items.length) {
                throw new ErrorHandler("Your cart is empty", 400);
            }

            // Get selected cart items
            const selectedCartItems = cart.items.filter((item) =>
                cakeIds.includes(item.cake.toString()),
            );

            if (!selectedCartItems.length) {
                throw new ErrorHandler(
                    "Please select at least one item to place an order",
                    400,
                );
            }

            // Check selected cakes are in cart
            if (selectedCartItems.length !== cakeIds.length) {
                throw new ErrorHandler(
                    "One or more selected items are not in your cart",
                    400,
                );
            }

            const selectedCakeIds = selectedCartItems.map((item) => item.cake);

            // Get latest cake data
            const cakes = await Cake.find({
                _id: { $in: selectedCakeIds },
                isActive: true,
            }).session(session);

            if (cakes.length !== selectedCakeIds.length) {
                throw new ErrorHandler(
                    "One or more selected cakes are no longer available",
                    400,
                );
            }

            const cakeMap = new Map(
                cakes.map((cake) => [cake._id.toString(), cake]),
            );

            const orderItems = [];

            // Price before discount (sum of original prices)
            let subtotal = 0;
            // Total savings from cake discounts
            let discount = 0;

            for (const cartItem of selectedCartItems) {
                const cake = cakeMap.get(cartItem.cake.toString());

                if (!cake) {
                    throw new ErrorHandler(
                        "One or more selected cakes are no longer available",
                        400,
                    );
                }

                if (cake.stock < cartItem.quantity) {
                    throw new ErrorHandler(
                        `Insufficient stock for "${cake.name.en}"`,
                        400,
                    );
                }

                if (cake.price == null || cake.price < 0) {
                    throw new ErrorHandler(
                        `Invalid price for "${cake.name.en}"`,
                        500,
                    );
                }

                // Price the customer actually pays (after cake discount)
                const unitPrice = round3(cake.discountedPrice ?? cake.price);

                const originalLineTotal = round3(
                    cake.price * cartItem.quantity,
                );
                const itemTotal = round3(unitPrice * cartItem.quantity);

                subtotal += originalLineTotal;
                discount += originalLineTotal - itemTotal;

                orderItems.push({
                    cake: cake._id,
                    name: {
                        en: cake.name.en,
                        ar: cake.name.ar,
                    },
                    imageUrl: cake.images?.[0]?.url,
                    price: unitPrice,
                    quantity: cartItem.quantity,
                    totalPrice: itemTotal,
                });
            }

            const orderAddOns = [];
            const selectedAddOnIds = [];

            // Get selected add-ons
            if (addOns.length) {
                const addOnIds = addOns.map((item) => item.addOnId);

                const uniqueAddOnIds = new Set(addOnIds);

                if (uniqueAddOnIds.size !== addOnIds.length) {
                    throw new ErrorHandler(
                        "Duplicate add-ons are not allowed",
                        400,
                    );
                }

                // Make sure selected add-ons actually exist in the user's cart
                const cartAddOnIds = new Set(
                    cart.addOns.map((item) => item.addOn.toString()),
                );

                for (const addOnId of addOnIds) {
                    if (!cartAddOnIds.has(addOnId.toString())) {
                        throw new ErrorHandler(
                            "One or more selected add-ons are not in your cart",
                            400,
                        );
                    }
                }

                const addOnDocuments = await AddOn.find({
                    _id: { $in: addOnIds },
                    isActive: true,
                }).session(session);

                if (addOnDocuments.length !== addOnIds.length) {
                    throw new ErrorHandler(
                        "One or more selected add-ons are no longer available",
                        400,
                    );
                }

                const addOnMap = new Map(
                    addOnDocuments.map((addOn) => [
                        addOn._id.toString(),
                        addOn,
                    ]),
                );

                for (const selectedAddOn of addOns) {
                    const addOn = addOnMap.get(
                        selectedAddOn.addOnId.toString(),
                    );

                    if (!addOn) {
                        throw new ErrorHandler(
                            "One or more selected add-ons are no longer available",
                            400,
                        );
                    }

                    if (
                        !Number.isInteger(selectedAddOn.quantity) ||
                        selectedAddOn.quantity < 1 ||
                        selectedAddOn.quantity > 50
                    ) {
                        throw new ErrorHandler(
                            "Add-on quantity must be between 1 and 50",
                            400,
                        );
                    }

                    const cartAddOn = cart.addOns.find(
                        (item) =>
                            item.addOn.toString() ===
                            selectedAddOn.addOnId.toString(),
                    );

                    if (!cartAddOn) {
                        throw new ErrorHandler(
                            "One or more selected add-ons are not in your cart",
                            400,
                        );
                    }

                    // Do not allow ordering more than the quantity stored in cart
                    if (selectedAddOn.quantity > cartAddOn.quantity) {
                        throw new ErrorHandler(
                            "Add-on quantity exceeds the quantity in your cart",
                            400,
                        );
                    }

                    // Add-ons have no discount
                    const addOnTotal = round3(
                        addOn.price * selectedAddOn.quantity,
                    );

                    subtotal += addOnTotal;

                    selectedAddOnIds.push(addOn._id);

                    orderAddOns.push({
                        addOn: addOn._id,
                        name: {
                            en: addOn.name.en,
                            ar: addOn.name.ar,
                        },
                        imageUrl: addOn.imageUrl,
                        price: addOn.price,
                        quantity: selectedAddOn.quantity,
                        totalPrice: addOnTotal,
                    });
                }
            }

            const deliveryFee = 0;

            subtotal = round3(subtotal);
            discount = round3(discount);

            // Same number the customer sees on the checkout page
            const totalPrice = round3(subtotal - discount + deliveryFee);

            // Online orders must be chargeable via MyFatoorah.
            // Free / near-free totals can only go through cash on delivery.
            if (paymentMethod === "online" && totalPrice < MIN_ONLINE_TOTAL) {
                throw new ErrorHandler(
                    "Online payment requires a minimum order total of 0.100 KWD. Please add items or choose cash on delivery.",
                    400,
                );
            }

            const [order] = await Order.create(
                [
                    {
                        user: req.user._id,
                        shippingAddress,
                        items: orderItems,
                        addOns: orderAddOns,
                        paymentMethod,
                        paymentStatus: "pending",
                        subtotal,
                        discount,
                        deliveryFee,
                        totalPrice,
                        orderStatus: "pending",
                        statusHistory: [
                            {
                                status: "pending",
                                note:
                                    paymentMethod === "online"
                                        ? "Order created and awaiting payment"
                                        : "Order placed",
                            },
                        ],
                    },
                ],
                { session },
            );

            // Reserve cake stock
            for (const cartItem of selectedCartItems) {
                const result = await Cake.updateOne(
                    {
                        _id: cartItem.cake,
                        isActive: true,
                        stock: { $gte: cartItem.quantity },
                    },
                    {
                        $inc: {
                            stock: -cartItem.quantity,
                        },
                    },
                    { session },
                );

                if (result.modifiedCount !== 1) {
                    throw new ErrorHandler(
                        "Stock changed while placing the order. Please try again",
                        409,
                    );
                }
            }

            /*
             * For COD:
             *
             * The order is already confirmed as a placed order, so remove
             * the ordered cakes and add-ons from the user's cart.
             *
             * For online payment:
             *
             * Keep the cart unchanged until payment is successfully completed.
             */
            if (paymentMethod === "cash_on_delivery") {
                await Cart.updateOne(
                    {
                        _id: cart._id,
                        user: req.user._id,
                    },
                    {
                        $pull: {
                            items: {
                                cake: {
                                    $in: selectedCakeIds,
                                },
                            },
                            addOns: {
                                addOn: {
                                    $in: selectedAddOnIds,
                                },
                            },
                        },
                    },
                    { session },
                );
            }

            createdOrder = order;
        });

        return res.status(201).json({
            success: true,
            message:
                paymentMethod === "online"
                    ? "Order created. Complete payment to continue."
                    : "Order created successfully",
            data: createdOrder,
        });
    } finally {
        await session.endSession();
    }
});

export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({
        user: req.user._id,
    }).sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
    });
});

export const getMyOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findOne({
        _id: id,
        user: req.user._id,
    });

    if (!order) {
        throw new ErrorHandler("Order not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        data: order,
    });
});

/*
 * Public order tracking by order number (no authentication).
 *
 * Guests can check delivery progress with just their order number. Only
 * non-sensitive fields are returned — never the buyer, contact details or
 * full address — so one customer cannot see another's information.
 */
export const trackOrder = asyncHandler(async (req, res) => {
    const { orderNumber } = req.params;

    const order = await Order.findOne({
        orderNumber: String(orderNumber).trim().toUpperCase(),
    }).select(
        "orderNumber orderStatus paymentStatus paymentMethod createdAt updatedAt deliveredAt cancelledAt cancellationReason statusHistory items addOns",
    );

    if (!order) {
        throw new ErrorHandler(
            "Order not found. Please check your order number",
            404,
        );
    }

    const itemCount =
        (order.items?.length ?? 0) + (order.addOns?.length ?? 0);

    const totalQuantity =
        (order.items ?? []).reduce(
            (sum, item) => sum + (item.quantity ?? 0),
            0,
        ) +
        (order.addOns ?? []).reduce(
            (sum, item) => sum + (item.quantity ?? 0),
            0,
        );

    res.status(200).json({
        success: true,
        message: "Order tracked successfully",
        data: {
            orderNumber: order.orderNumber,
            orderStatus: order.orderStatus,
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            deliveredAt: order.deliveredAt,
            cancelledAt: order.cancelledAt,
            cancellationReason: order.cancellationReason,
            statusHistory: order.statusHistory,
            itemCount,
            totalQuantity,
        },
    });
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const session = await mongoose.startSession();

    try {
        let cancelledOrder;

        await session.withTransaction(async () => {
            const order = await Order.findOne({
                _id: id,
                user: req.user._id,
            }).session(session);

            if (!order) {
                throw new ErrorHandler("Order not found", 404);
            }

            if (order.paymentMethod !== "cash_on_delivery") {
                throw new ErrorHandler(
                    "Online orders cannot be cancelled",
                    400,
                );
            }

            if (order.orderStatus !== "pending") {
                throw new ErrorHandler(
                    "Only pending COD orders can be cancelled",
                    400,
                );
            }

            for (const item of order.items) {
                await Cake.updateOne(
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
            }

            order.orderStatus = "cancelled";
            order.cancelledAt = new Date();
            order.cancellationReason = "Cancelled by customer";

            order.statusHistory.push({
                status: "cancelled",
                note: "Order cancelled by customer",
            });

            await order.save({ session });

            cancelledOrder = order;
        });

        return res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            data: cancelledOrder,
        });
    } finally {
        await session.endSession();
    }
});

export const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("user", "username email phone")
        .sort({
            createdAt: -1,
        });

    res.status(200).json({
        success: true,
        message: "Orders fetched successfully",
        data: orders,
    });
});

export const getOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const order = await Order.findById(id).populate(
        "user",
        "username email phone",
    );

    if (!order) {
        throw new ErrorHandler("Order not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Order fetched successfully",
        data: order,
    });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
        throw new ErrorHandler("Invalid order status", 400);
    }

    const session = await mongoose.startSession();

    try {
        let updatedOrder;

        await session.withTransaction(async () => {
            const order = await Order.findById(id).session(session);

            if (!order) {
                throw new ErrorHandler("Order not found", 404);
            }

            if (
                order.orderStatus === "delivered" ||
                order.orderStatus === "cancelled"
            ) {
                throw new ErrorHandler(
                    "Finalized orders cannot be updated",
                    400,
                );
            }

            if (status === "cancelled") {
                if (order.paymentMethod !== "cash_on_delivery") {
                    throw new ErrorHandler(
                        "Online orders cannot be cancelled",
                        400,
                    );
                }

                if (order.orderStatus !== "pending") {
                    throw new ErrorHandler(
                        "Only pending COD orders can be cancelled",
                        400,
                    );
                }

                for (const item of order.items) {
                    await Cake.updateOne(
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
                }

                order.cancelledAt = new Date();
                order.cancellationReason = "Cancelled by admin";

                order.statusHistory.push({
                    status: "cancelled",
                    note: "Order cancelled by admin",
                });

                order.orderStatus = "cancelled";

                await order.save({ session });

                updatedOrder = order;

                return;
            }

            // Option A: unpaid online orders are stuck at "pending".
            // They can never move to confirmed / out_for_delivery / delivered
            // until paymentStatus becomes "paid" (webhook or callback).
            // The order stays in the DB, visible on the dashboard with a
            // "Payment: Pending" badge; paying late unlocks the flow.
            if (
                order.paymentMethod === "online" &&
                order.paymentStatus !== "paid"
            ) {
                throw new ErrorHandler(
                    "Online order must be paid before it can be processed",
                    400,
                );
            }

            // Admins can move an order forward to any later status
            // (e.g. straight to "delivered"), but never backwards.
            const allowedTransitions = {
                pending: ["confirmed", "out_for_delivery", "delivered"],
                confirmed: ["out_for_delivery", "delivered"],
                out_for_delivery: ["delivered"],
            };

            const allowedNextStatuses =
                allowedTransitions[order.orderStatus] || [];

            if (!allowedNextStatuses.includes(status)) {
                throw new ErrorHandler(
                    `Cannot change order status from "${order.orderStatus}" to "${status}"`,
                    400,
                );
            }

            order.statusHistory.push({
                status,
                note: `Order status changed to ${status}`,
            });

            order.orderStatus = status;

            if (status === "delivered") {
                order.deliveredAt = new Date();

                // For Cash on Delivery (COD) orders, payment is collected
                // at the time of delivery. Once the admin marks the order as
                // delivered, the payment has been received and the payment
                // status should reflect that.
                if (order.paymentMethod === "cash_on_delivery") {
                    order.paymentStatus = "paid";
                }
            }

            await order.save({ session });

            updatedOrder = order;
        });

        return res.status(200).json({
            success: true,
            message: "Order status updated successfully",
            data: updatedOrder,
        });
    } finally {
        await session.endSession();
    }
});

export const updateOrderNotes = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const adminNotes =
        typeof req.body.adminNotes === "string" ? req.body.adminNotes.trim() : "";

    if (adminNotes.length > 1000) {
        throw new ErrorHandler(
            "Admin notes cannot exceed 1000 characters",
            400,
        );
    }

    const order = await Order.findById(id);

    if (!order) {
        throw new ErrorHandler("Order not found", 404);
    }

    order.adminNotes = adminNotes;

    await order.save();

    res.status(200).json({
        success: true,
        message: "Order notes updated successfully",
        data: order,
    });
});
