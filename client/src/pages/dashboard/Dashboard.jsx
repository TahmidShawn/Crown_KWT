import {
    ArrowUpRight,
    CheckCircle2,
    Clock3,
    Loader2,
    Package,
    ShoppingBag,
    Truck,
} from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/hooks/useAuth";
import useGet from "@/hooks/useGet";
import {
    formatDate,
    getStatusClass,
    getStatusLabel,
} from "@/utils/orderStatus";

const Dashboard = () => {
    const { isLoading: authLoading, isAuthenticated } = useAuth();

    const {
        data: ordersResponse,
        isLoading: ordersLoading,
        isError,
    } = useGet({
        url: "/orders",
        queryKey: ["orders"],
        retry: false,
        enabled: !authLoading && isAuthenticated,
    });

    const orders = ordersResponse?.data ?? [];


    const processing = orders.filter(
        (order) =>
            order.orderStatus === "pending" ||
            order.orderStatus === "confirmed",
    ).length;

    const onTheWay = orders.filter(
        (order) => order.orderStatus === "out_for_delivery",
    ).length;

    const delivered = orders.filter(
        (order) => order.orderStatus === "delivered",
    ).length;

    const statistics = [
        {
            title: "Total orders",
            value: orders.length,
            description: "All time orders",
            icon: ShoppingBag,
        },
        {
            title: "Processing",
            value: processing,
            description: "Currently preparing",
            icon: Clock3,
        },
        {
            title: "On the way",
            value: onTheWay,
            description: "Out for delivery",
            icon: Truck,
        },
        {
            title: "Delivered",
            value: delivered,
            description: "Successfully delivered",
            icon: CheckCircle2,
        },
    ];


    const recentOrders = orders.slice(0, 4);

    const isLoading = authLoading || ordersLoading;

    return (
        <div className="p-5 sm:p-7 lg:p-9">
            
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <p className="mb-2 text-sm font-semibold text-primary">
                        Overview
                    </p>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Your dashboard
                    </h1>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                        Keep an eye on your recent orders and account activity.
                    </p>
                </div>

                <Button asChild variant="outline-asymmetric" className="w-fit">
                    <Link to="/">
                        Continue shopping
                        <ArrowUpRight className="ml-2 size-4" />
                    </Link>
                </Button>
            </div>

            
            {isLoading && (
                <div className="flex min-h-60 items-center justify-center">
                    <Loader2 className="size-7 animate-spin text-primary" />
                </div>
            )}

            
            {!isLoading && isError && (
                <div className="rounded-2xl border bg-background px-6 py-14 text-center">
                    <h3 className="text-base font-bold">
                        Unable to load your dashboard
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                        We couldn&apos;t fetch your orders. Please try again
                        later.
                    </p>
                </div>
            )}

            
            {!isLoading && !isError && !isAuthenticated && (
                <div className="rounded-2xl border bg-background px-6 py-14 text-center">
                    <h3 className="text-base font-bold">Please log in</h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                        Log in to see your orders, stats and account activity.
                    </p>

                    <Button asChild variant="asymmetric" className="mt-5">
                        <Link to="/auth/login">Log in</Link>
                    </Button>
                </div>
            )}

            {!isLoading && !isError && isAuthenticated && (
                <>
                    
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {statistics.map((item) => {
                            const Icon = item.icon;

                            return (
                                <Card
                                    key={item.title}
                                    className="rounded-2xl border bg-background shadow-none transition-shadow hover:shadow-sm"
                                >
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-muted-foreground">
                                                    {item.title}
                                                </p>

                                                <p className="mt-2 text-2xl font-bold tracking-tight">
                                                    {item.value}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {item.description}
                                                </p>
                                            </div>

                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                <Icon className="size-5" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    
                    <Card className="mt-6 rounded-2xl border bg-background shadow-none">
                        <CardHeader className="flex flex-col gap-3 border-b px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <CardTitle className="text-lg">
                                    Recent orders
                                </CardTitle>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Your latest Crown Kwt purchases.
                                </p>
                            </div>

                            <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="w-fit gap-1 rounded-lg"
                            >
                                <Link to="/dashboard/orders">
                                    View all
                                    <ArrowUpRight className="size-4" />
                                </Link>
                            </Button>
                        </CardHeader>

                        <CardContent className="px-5 py-1 sm:px-6">
                            {recentOrders.length === 0 && (
                                <div className="flex flex-col items-center py-10 text-center">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                                        <Package className="size-6 text-muted-foreground" />
                                    </div>

                                    <p className="mt-4 font-semibold">
                                        No orders yet
                                    </p>

                                    <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                                        When you place an order, it will show up
                                        here.
                                    </p>

                                    <Button
                                        asChild
                                        variant="outline-asymmetric"
                                        className="mt-4"
                                    >
                                        <Link to="/">Start shopping</Link>
                                    </Button>
                                </div>
                            )}

                            {recentOrders.map((order, index) => (
                                <div key={order._id}>
                                    <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                                <Package className="size-5 text-muted-foreground" />
                                            </div>

                                            <div>
                                                <p className="font-semibold">
                                                    #{order.orderNumber}
                                                </p>

                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {formatDate(
                                                        order.createdAt,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                                            <div>
                                                <Badge
                                                    variant="secondary"
                                                    className={getStatusClass(
                                                        order.orderStatus,
                                                    )}
                                                >
                                                    {getStatusLabel(
                                                        order.orderStatus,
                                                    )}
                                                </Badge>

                                                <p className="mt-2 text-sm font-semibold">
                                                    KWD{" "}
                                                    {Number(
                                                        order.totalPrice,
                                                    ).toFixed(3)}
                                                </p>
                                            </div>

                                            <Button
                                                asChild
                                                variant="outline-asymmetric"
                                                size="icon"
                                            >
                                                <Link
                                                    to={`/dashboard/orders/${order._id}`}
                                                >
                                                    <ArrowUpRight className="size-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>

                                    {index < recentOrders.length - 1 && (
                                        <Separator />
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default Dashboard;
