import { useState } from "react";
import { useSearchParams } from "react-router";
import { Clock3, Loader2, Package, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import OrderTimeline from "@/components/shared/orderTimeline/OrderTimeline";
import useGet from "@/hooks/useGet";
import {
    buildTrackingSteps,
    formatDate,
    getStatusClass,
    getStatusLabel,
} from "@/utils/orderStatus";

const OrderTracking = () => {

    const [searchParams] = useSearchParams();
    const initialNumber = searchParams.get("orderNumber")?.trim() ?? "";

    const [orderId, setOrderId] = useState(initialNumber);
    const [trackedNumber, setTrackedNumber] = useState(initialNumber);

    const trimmed = orderId.trim();

    const {
        data: orderResponse,
        isError,
        isFetching,
    } = useGet({
        url: `/order/track/${encodeURIComponent(trackedNumber)}`,
        queryKey: ["track-order", trackedNumber],
        enabled: Boolean(trackedNumber),
        retry: false,
    });

    const order = orderResponse?.data;
    const trackingSteps = buildTrackingSteps(order, "en");

    const handleSubmit = (event) => {
        event.preventDefault();

        const value = orderId.trim();

        if (!value) {
            return;
        }

        setTrackedNumber(value);
    };

    return (
        <div className="min-h-[70vh] px-5 py-12 sm:px-7 lg:px-9 lg:py-16">
            <div className="mx-auto max-w-3xl">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="mb-3 text-sm font-semibold text-primary">
                        Order tracking
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                        Track your Crown Kwt order
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                        Enter your order number below to see the latest status
                        of your delivery.
                    </p>
                </div>

                <Card className="mt-8 rounded-2xl border bg-background shadow-sm">
                    <CardContent className="p-5 sm:p-6">
                        <form
                            onSubmit={handleSubmit}
                            className="flex flex-col gap-3 sm:flex-row"
                        >
                            <Input
                                value={orderId}
                                onChange={(event) =>
                                    setOrderId(event.target.value)
                                }
                                placeholder="Enter order number, e.g. ORD-XXXX"
                                className="h-12 rounded-xl"
                            />

                            <Button
                                type="submit"
                                disabled={!trimmed || isFetching}
                                className="h-12 rounded-xl px-6"
                            >
                                {isFetching ? (
                                    <Loader2 className="mr-2 size-4 animate-spin" />
                                ) : (
                                    <Search className="mr-2 size-4" />
                                )}
                                Track order
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {isFetching && (
                    <div className="mt-8 flex items-center justify-center py-10">
                        <Loader2 className="size-7 animate-spin text-primary" />
                    </div>
                )}

                {!isFetching && isError && trackedNumber && (
                    <Card className="mt-8 rounded-2xl border bg-background shadow-sm">
                        <CardContent className="flex flex-col items-center p-10 text-center">
                            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
                                <Package className="size-6 text-muted-foreground" />
                            </div>

                            <h2 className="text-lg font-bold text-foreground">
                                Order not found
                            </h2>

                            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                We couldn't find an order with that number.
                                Please double-check it and try again.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {!isFetching && !isError && order && (
                    <Card className="mt-8 rounded-2xl border bg-background shadow-sm">
                        <CardContent className="p-5 sm:p-6">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground">
                                        Order #{order.orderNumber}
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Placed on {formatDate(order.createdAt)}
                                    </p>

                                    {order.itemCount > 0 && (
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {order.itemCount}{" "}
                                            {order.itemCount === 1
                                                ? "item"
                                                : "items"}
                                        </p>
                                    )}
                                </div>

                                <Badge
                                    variant="secondary"
                                    className={`w-fit rounded-lg px-3 py-1.5 ${getStatusClass(
                                        order.orderStatus,
                                    )}`}
                                >
                                    {getStatusLabel(order.orderStatus)}
                                </Badge>
                            </div>

                            <OrderTimeline
                                steps={trackingSteps}
                                language="en"
                            />

                            {order.orderStatus !== "cancelled" &&
                                order.orderStatus !== "delivered" && (
                                    <div className="mt-7 flex items-start gap-3 rounded-xl bg-muted/60 p-4">
                                        <Clock3 className="mt-0.5 size-4 shrink-0 text-primary" />

                                        <div>
                                            <p className="text-sm font-semibold">
                                                Estimated delivery
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {order.orderStatus ===
                                                "out_for_delivery"
                                                    ? "Your order is on the way."
                                                    : "We'll update you when it's out for delivery."}
                                            </p>
                                        </div>
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    );
};

export default OrderTracking;
