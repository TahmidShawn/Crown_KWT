

export const STATUS_LABELS = {
    pending: "Pending",
    confirmed: "Confirmed",
    out_for_delivery: "Out for delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

export const STATUS_ACTION_LABELS = {
    confirmed: "Mark as confirmed",
    out_for_delivery: "Mark as out for delivery",
    delivered: "Mark as delivered",
    cancelled: "Cancel order",
};

export const ORDER_FLOW = [
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
];

export const canCancelOrder = (order) =>
    order?.orderStatus === "pending" &&
    order?.paymentMethod === "cash_on_delivery";

export const getNextStatuses = (order) => {
    if (!order) return [];

    const currentIndex = ORDER_FLOW.indexOf(order.orderStatus);

    const isFinal =
        order.orderStatus === "cancelled" ||
        currentIndex === ORDER_FLOW.length - 1;

    if (isFinal) return [];

    const next =
        currentIndex >= 0
            ? ORDER_FLOW.slice(currentIndex + 1)
            : [...ORDER_FLOW];

    if (canCancelOrder(order)) {
        next.push("cancelled");
    }

    return next;
};

export const formatPrice = (value) => `${Number(value ?? 0).toFixed(3)} KWD`;

export const formatPaymentStatus = (status) => {
    if (status === "paid") return "Paid";
    if (status === "failed") return "Failed";
    return "Pending";
};