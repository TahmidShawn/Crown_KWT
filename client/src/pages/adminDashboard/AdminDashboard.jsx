import { Link } from "react-router";
import {
    Cake,
    ChevronRight,
    Loader2,
    RefreshCw,
    ShoppingBag,
    Tags,
    Users,
} from "lucide-react";

import useGet from "@/hooks/useGet";

export default function AdminDashboard() {
    const { data, isLoading, isError, refetch } = useGet({
        url: "/admin/stats",
        queryKey: ["admin-stats"],
        retry: false,
    });

    const stats = data?.data;

    const cards = [
        {
            title: "Total Orders",
            value: stats?.totalOrders,
            caption: stats
                ? `${stats.pendingOrders} pending`
                : null,
            icon: ShoppingBag,
            to: "/admin/orders",
        },
        {
            title: "Products",
            value: stats?.totalProducts,
            caption: "Cakes in your store",
            icon: Cake,
            to: "/admin/cakes",
        },
        {
            title: "Categories",
            value: stats?.totalCategories,
            caption: "Cake categories",
            icon: Tags,
            to: "/admin/categories",
        },
        {
            title: "Customers",
            value: stats?.totalCustomers,
            caption: "Ordered at least once (staff excluded)",
            icon: Users,
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                    Dashboard
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                    Overview of your Crown Kwt store.
                </p>
            </div>

            {isError ? (
                <div className="rounded-2xl border bg-background p-10 text-center">
                    <h3 className="text-lg font-bold text-foreground">
                        Failed to load stats
                    </h3>

                    <p className="mt-2 text-sm text-muted-foreground">
                        Something went wrong while fetching the dashboard
                        stats.
                    </p>

                    <button
                        type="button"
                        onClick={() => refetch()}
                        className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                        <RefreshCw className="size-4" />
                        Try again
                    </button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {cards.map((stat) => {
                        const Icon = stat.icon;

                        const content = (
                            <>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-muted-foreground">
                                        {stat.title}
                                    </p>

                                    {stat.to && (
                                        <ChevronRight className="size-4 text-muted-foreground" />
                                    )}
                                </div>

                                <div className="mt-2 flex items-end justify-between gap-3">
                                    <div>
                                        <p className="text-2xl font-semibold text-foreground">
                                            {isLoading ? (
                                                <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                            ) : (
                                                stat.value ?? "—"
                                            )}
                                        </p>

                                        {stat.caption && !isLoading && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {stat.caption}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Icon className="size-5" />
                                    </div>
                                </div>
                            </>
                        );

                        if (stat.to) {
                            return (
                                <Link
                                    key={stat.title}
                                    to={stat.to}
                                    className="rounded-2xl border bg-background p-5 transition-colors hover:border-primary/40 hover:bg-muted/30"
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <div
                                key={stat.title}
                                className="rounded-2xl border bg-background p-5"
                            >
                                {content}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
