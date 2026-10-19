import { Check, MapPin, Package, Truck, XCircle } from "lucide-react";




export const ORDER_FLOW = [
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
];

export const statusMeta = {
    pending: {
        en: "Pending",
        ar: "قيد الانتظار",
        className: "bg-amber-500/10 text-amber-600",
    },
    confirmed: {
        en: "Confirmed",
        ar: "تم التأكيد",
        className: "bg-secondary text-secondary-foreground",
    },
    out_for_delivery: {
        en: "On the way",
        ar: "قيد التوصيل",
        className: "bg-amber-500/10 text-amber-600",
    },
    delivered: {
        en: "Delivered",
        ar: "تم التوصيل",
        className: "bg-primary/10 text-primary",
    },
    cancelled: {
        en: "Cancelled",
        ar: "ملغي",
        className: "bg-destructive/10 text-destructive",
    },
};

export const getStatusLabel = (status, language = "en") =>
    statusMeta[status]?.[language] ?? statusMeta.pending[language] ?? status;

export const getStatusClass = (status) =>
    statusMeta[status]?.className ?? statusMeta.pending.className;

const stepMeta = {
    pending: {
        en: { title: "Order placed", description: "Your order has been received." },
        ar: { title: "تم استلام الطلب", description: "تم استلام طلبك." },
        icon: Check,
    },
    confirmed: {
        en: { title: "Order confirmed", description: "Your order has been confirmed." },
        ar: { title: "تم تأكيد الطلب", description: "تم تأكيد طلبك." },
        icon: Package,
    },
    out_for_delivery: {
        en: { title: "Out for delivery", description: "Your order is on its way." },
        ar: { title: "قيد التوصيل", description: "طلبك في الطريق إليك." },
        icon: Truck,
    },
    delivered: {
        en: { title: "Delivered", description: "Your order has been delivered." },
        ar: { title: "تم التوصيل", description: "تم توصيل طلبك." },
        icon: MapPin,
    },
    cancelled: {
        en: { title: "Cancelled", description: "This order was cancelled." },
        ar: { title: "ملغي", description: "تم إلغاء هذا الطلب." },
        icon: XCircle,
    },
};

export const formatDate = (value, language = "en") => {
    if (!value) return "";

    return new Date(value).toLocaleDateString(
        language === "ar" ? "ar-KW" : "en-US",
        { year: "numeric", month: "long", day: "numeric" },
    );
};

export const formatDateTime = (value, language = "en") => {
    if (!value) return "";

    return new Date(value).toLocaleString(
        language === "ar" ? "ar-KW" : "en-US",
        {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
        },
    );
};


export const buildTrackingSteps = (order, language = "en") => {
    if (!order) return [];

    const history = Array.isArray(order.statusHistory)
        ? order.statusHistory
        : [];

    const dateForStatus = (status) => {
        const entry = history.find((item) => item.status === status);
        return entry ? formatDateTime(entry.changedAt, language) : "";
    };

    if (order.orderStatus === "cancelled") {
        const cancelledEntry = history.find(
            (item) => item.status === "cancelled",
        );

        const meta = stepMeta.cancelled[language] ?? stepMeta.cancelled.en;

        return [
            {
                key: "cancelled",
                title: meta.title,
                description:
                    order.cancellationReason ||
                    cancelledEntry?.note ||
                    meta.description,
                date: cancelledEntry
                    ? formatDateTime(cancelledEntry.changedAt, language)
                    : formatDateTime(order.cancelledAt, language),
                completed: true,
                current: false,
                icon: stepMeta.cancelled.icon,
            },
        ];
    }

    const currentIndex = ORDER_FLOW.indexOf(order.orderStatus);

    return ORDER_FLOW.map((status, index) => {
        const meta = stepMeta[status][language] ?? stepMeta[status].en;
        const reached = index <= currentIndex;

        return {
            key: status,
            title: meta.title,
            description: meta.description,
            date: reached
                ? dateForStatus(status) ||
                  (status === order.orderStatus
                      ? formatDateTime(order.createdAt, language)
                      : "")
                : "",
            completed: index < currentIndex,
            current: index === currentIndex,
            icon: stepMeta[status].icon,
        };
    });
};
