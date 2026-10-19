import {
    ArrowLeft,
    Clock3,
    Loader2,
    MapPin,
    Package,
} from "lucide-react";
import { Link, useParams } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OrderTimeline from "@/components/shared/orderTimeline/OrderTimeline";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import usePatch from "@/hooks/usePatch";
import {
    buildTrackingSteps,
    formatDate,
    getStatusClass,
    getStatusLabel,
} from "@/utils/orderStatus";

const formatPrice = (value) => `${Number(value ?? 0).toFixed(3)} KWD`;

const CancelOrderButton = ({ orderId, onCancelled }) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const { mutate: cancelOrder, isPending } = usePatch({
        url: `/order/${orderId}`,
        onSuccess: () => {
            toast.success(
                isArabic ? "تم إلغاء الطلب" : "Order cancelled successfully",
            );
            onCancelled?.();
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                    (isArabic ? "تعذر إلغاء الطلب" : "Unable to cancel order"),
            );
        },
    });

    return (
        <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => cancelOrder({})}
            className="w-full rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending
                ? isArabic
                    ? "جاري الإلغاء..."
                    : "Cancelling..."
                : isArabic
                  ? "إلغاء الطلب"
                  : "Cancel order"}
        </Button>
    );
};


const OrderDetails = () => {
    const { orderId } = useParams();
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const {
        data: orderResponse,
        isLoading,
        isError,
        refetch,
    } = useGet({
        url: `/order/${orderId}`,
        queryKey: ["order", orderId],
        enabled: Boolean(orderId),
        retry: false,
    });

    const order = orderResponse?.data;

    if (isLoading) {
        return (
            <div className="flex min-h-60 items-center justify-center p-5 sm:p-7 lg:p-9">
                <Loader2 className="size-7 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="p-5 sm:p-7 lg:p-9">
                <Button
                    asChild
                    variant="ghost"
                    className="-ml-3 mb-4 rounded-xl text-muted-foreground"
                >
                    <Link to="/dashboard/orders">
                        <ArrowLeft className="mr-2 size-4" />
                        {isArabic ? "رجوع إلى الطلبات" : "Back to orders"}
                    </Link>
                </Button>

                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardContent className="p-10 text-center">
                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic ? "لم يتم العثور على الطلب" : "Order not found"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "قد يكون هذا الطلب غير موجود أو لا تملك صلاحية الوصول إليه."
                                : "This order may not exist or you may not have access to it."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const trackingSteps = buildTrackingSteps(order, language);
    const items = order.items ?? [];
    const addOns = order.addOns ?? [];
    const canCancel =
        order.orderStatus === "pending" &&
        order.paymentMethod === "cash_on_delivery";

    return (
        <div className="p-5 sm:p-7 lg:p-9">
            <div className="mb-7">
                <Button
                    asChild
                    variant="ghost"
                    className="-ml-3 mb-4 rounded-xl text-muted-foreground"
                >
                    <Link to="/dashboard/orders">
                        <ArrowLeft className="mr-2 size-4" />
                        {isArabic ? "رجوع إلى الطلبات" : "Back to orders"}
                    </Link>
                </Button>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="mb-2 text-sm font-semibold text-primary">
                            {isArabic ? "تفاصيل الطلب" : "Order details"}
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {isArabic ? "طلب" : "Order"} #{order.orderNumber}
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {isArabic ? "تم الطلب في" : "Placed on"}{" "}
                            {formatDate(order.createdAt, language)}
                        </p>
                    </div>

                    <Badge
                        variant="secondary"
                        className={`w-fit rounded-lg px-3 py-1.5 ${getStatusClass(
                            order.orderStatus,
                        )}`}
                    >
                        {getStatusLabel(order.orderStatus, language)}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
                
                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardHeader className="px-5 py-5 sm:px-6">
                        <CardTitle className="text-lg">
                            {isArabic ? "تتبع الطلب" : "Order tracking"}
                        </CardTitle>

                        <p className="text-sm text-muted-foreground">
                            {isArabic
                                ? "تابع تقدّم طلبك."
                                : "Follow the progress of your order."}
                        </p>
                    </CardHeader>

                    <CardContent className="px-5 pb-6 sm:px-6">
                        <div className="relative">
                            <OrderTimeline
                                steps={trackingSteps}
                                language={language}
                            />
                        </div>

                        <div className="mt-7 flex items-start gap-3 rounded-xl bg-muted/60 p-4">
                            <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />

                            <div>
                                <p className="text-sm font-semibold">
                                    {isArabic
                                        ? "التوصيل المتوقع"
                                        : "Estimated delivery"}
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    {order.orderStatus === "out_for_delivery"
                                        ? isArabic
                                            ? "طلبك في الطريق إليك."
                                            : "Your order is on the way."
                                        : isArabic
                                          ? "سيتم تحديثك عند خروج الطلب للتوصيل."
                                          : "We'll update you when it's out for delivery."}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <div className="space-y-6">
                    
                    <Card className="rounded-2xl border bg-background shadow-none">
                        <CardHeader className="px-5 py-5">
                            <CardTitle className="text-lg">
                                {isArabic ? "العناصر" : "Items"}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 px-5 pb-5">
                            {items.map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name?.[language] ?? ""}
                                            className="size-14 shrink-0 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Package className="size-5 text-muted-foreground" />
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {item.name?.[language]}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {isArabic ? "الكمية" : "Qty"}{" "}
                                            {item.quantity}
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-semibold">
                                        {formatPrice(item.totalPrice)}
                                    </p>
                                </div>
                            ))}

                            {addOns.map((item, index) => (
                                <div
                                    key={`addon-${index}`}
                                    className="flex items-center gap-3"
                                >
                                    {item.imageUrl ? (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name?.[language] ?? ""}
                                            className="size-14 shrink-0 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            <Package className="size-5 text-muted-foreground" />
                                        </div>
                                    )}

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">
                                            {item.name?.[language]}
                                        </p>

                                        <p className="text-xs text-muted-foreground">
                                            {isArabic ? "إضافة" : "Add-on"} ·{" "}
                                            {isArabic ? "الكمية" : "Qty"}{" "}
                                            {item.quantity}
                                        </p>
                                    </div>

                                    <p className="shrink-0 text-sm font-semibold">
                                        {formatPrice(item.totalPrice)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    
                    <Card className="rounded-2xl border bg-background shadow-none">
                        <CardHeader className="px-5 py-5">
                            <CardTitle className="text-lg">
                                {isArabic ? "ملخص الطلب" : "Order summary"}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-4 px-5 pb-5 text-sm">
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    {isArabic ? "المجموع الفرعي" : "Subtotal"}
                                </span>

                                <span className="font-medium">
                                    {formatPrice(order.subtotal)}
                                </span>
                            </div>

                            {Number(order.discount) > 0 && (
                                <div className="flex justify-between gap-4">
                                    <span className="text-muted-foreground">
                                        {isArabic ? "الخصم" : "Discount"}
                                    </span>

                                    <span className="font-medium text-primary">
                                        -{formatPrice(order.discount)}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    {isArabic ? "التوصيل" : "Delivery"}
                                </span>

                                <span className="font-medium">
                                    {formatPrice(order.deliveryFee)}
                                </span>
                            </div>

                            <Separator />

                            <div className="flex justify-between gap-4">
                                <span className="font-semibold">
                                    {isArabic ? "الإجمالي" : "Total"}
                                </span>

                                <span className="font-bold">
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </div>

                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">
                                    {isArabic ? "طريقة الدفع" : "Payment"}
                                </span>

                                <span className="font-medium">
                                    {order.paymentMethod === "online"
                                        ? isArabic
                                            ? "عبر الإنترنت"
                                            : "Online"
                                        : isArabic
                                          ? "الدفع عند الاستلام"
                                          : "Cash on delivery"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    
                    <Card className="rounded-2xl border bg-background shadow-none">
                        <CardHeader className="px-5 py-5">
                            <CardTitle className="text-lg">
                                {isArabic ? "عنوان التوصيل" : "Delivery address"}
                            </CardTitle>
                        </CardHeader>

                        <CardContent className="px-5 pb-5">
                            <div className="flex gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                    <MapPin className="size-4 text-muted-foreground" />
                                </div>

                                <div className="text-sm">
                                    <p className="font-medium">
                                        {order.shippingAddress?.fullName}
                                    </p>

                                    <p className="mt-1 leading-5 text-muted-foreground">
                                        {[
                                            order.shippingAddress?.building,
                                            order.shippingAddress?.street,
                                            order.shippingAddress?.block,
                                            order.shippingAddress?.area,
                                            order.shippingAddress?.governorate,
                                        ]
                                            .filter(Boolean)
                                            .join(", ")}
                                    </p>

                                    {order.shippingAddress?.phone && (
                                        <p
                                            dir="ltr"
                                            className="mt-1 text-muted-foreground"
                                        >
                                            {order.shippingAddress.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    
                    {canCancel && (
                        <CancelOrderButton
                            orderId={order._id}
                            onCancelled={refetch}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
