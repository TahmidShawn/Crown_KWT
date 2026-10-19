import { ArrowUpRight, Loader2, Package } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useGet from "@/hooks/useGet";
import { useLanguage } from "@/context/LanguageContext";
import {
    formatDate,
    getStatusClass,
    getStatusLabel,
} from "@/utils/orderStatus";

const Orders = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const {
        data: ordersResponse,
        isLoading,
        isError,
    } = useGet({
        url: "/orders",
        queryKey: ["orders"],
        retry: false,
    });

    const orders = ordersResponse?.data ?? [];

    const totalItems = (order) =>
        (order.items?.length ?? 0) + (order.addOns?.length ?? 0);

    return (
        <div className="p-5 sm:p-7 lg:p-9">
            <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-primary">
                    {isArabic ? "الحساب" : "Account"}
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    {isArabic ? "طلباتي" : "My orders"}
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    {isArabic
                        ? "اطّلع على مشترياتك السابقة وتابع تقدّم طلباتك الحالية."
                        : "View your previous purchases and follow the progress of current orders."}
                </p>
            </div>

            
            {isLoading && (
                <div className="flex min-h-60 items-center justify-center">
                    <Loader2 className="size-7 animate-spin text-primary" />
                </div>
            )}

            
            {isError && (
                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardContent className="p-10 text-center">
                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic
                                ? "تعذر تحميل طلباتك"
                                : "Unable to load your orders"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "يرجى المحاولة مرة أخرى لاحقاً."
                                : "Please try again later."}
                        </p>
                    </CardContent>
                </Card>
            )}

            
            {!isLoading && !isError && orders.length === 0 && (
                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardContent className="flex flex-col items-center p-10 text-center">
                        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
                            <Package className="size-6 text-muted-foreground" />
                        </div>

                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic ? "لا توجد طلبات بعد" : "No orders yet"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "عندما تقوم بأول طلب، ستظهر تفاصيله هنا."
                                : "When you place your first order, its details will appear here."}
                        </p>

                        <Button asChild variant="asymmetric" className="mt-6 rounded-xl">
                            <Link to="/">
                                {isArabic ? "تسوق الكعكات" : "Browse cakes"}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
            
            {!isLoading && !isError && orders.length > 0 && (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const items = totalItems(order);

                        return (
                            <Card
                                key={order._id}
                                className="rounded-2xl border bg-background shadow-none transition-all hover:border-primary/30 hover:shadow-sm"
                            >
                                <CardContent className="p-5 sm:p-6">
                                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Package className="size-5" />
                                            </div>

                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <p className="font-semibold">
                                                        {isArabic ? "طلب" : "Order"}{" "}
                                                        #{order.orderNumber}
                                                    </p>

                                                    <Badge
                                                        variant="secondary"
                                                        className={getStatusClass(
                                                            order.orderStatus,
                                                        )}
                                                    >
                                                        {getStatusLabel(
                                                            order.orderStatus,
                                                            language,
                                                        )}
                                                    </Badge>
                                                </div>

                                                <p className="mt-1.5 text-sm text-muted-foreground">
                                                    {isArabic ? "تم الطلب في" : "Placed on"}{" "}
                                                    {formatDate(
                                                        order.createdAt,
                                                        language,
                                                    )}
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {items}{" "}
                                                    {isArabic
                                                        ? items === 1
                                                            ? "عنصر"
                                                            : "عناصر"
                                                        : items === 1
                                                          ? "item"
                                                          : "items"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-5 border-t pt-4 lg:border-0 lg:pt-0">
                                            <div>
                                                <p className="text-xs text-muted-foreground">
                                                    {isArabic
                                                        ? "إجمالي الطلب"
                                                        : "Order total"}
                                                </p>

                                                <p className="mt-1 font-semibold">
                                                    KWD{" "}
                                                    {Number(
                                                        order.totalPrice,
                                                    ).toFixed(3)}
                                                </p>
                                            </div>

                                            <Button
                                                asChild
                                                variant="outline"
                                                className="rounded-xl"
                                            >
                                                <Link
                                                    to={`/dashboard/orders/${order._id}`}
                                                >
                                                    {isArabic
                                                        ? "عرض الطلب"
                                                        : "View order"}
                                                    <ArrowUpRight className="ml-2 size-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}


        </div>
    );
};

export default Orders;
