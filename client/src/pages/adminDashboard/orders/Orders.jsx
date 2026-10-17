import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Check,
    CheckCircle2,
    Clock,
    Copy,
    ExternalLink,
    Eye,
    Loader2,
    MoreHorizontal,
    Search,
    ShoppingBag,
    Truck,
    X,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/api/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import useGet from "@/hooks/useGet";
import { getStatusClass } from "@/utils/orderStatus";
import {
    STATUS_ACTION_LABELS,
    STATUS_LABELS,
    canCancelOrder,
    formatPaymentStatus,
    formatPrice,
    getNextStatuses,
    isAwaitingOnlinePayment,
} from "@/utils/adminOrder";

const STATUS_TABS = [
    { key: "all", label: "All orders", path: "/admin/orders" },
    { key: "pending", label: "Pending", path: "/admin/orders/pending" },
    { key: "confirmed", label: "Confirmed", path: "/admin/orders/confirmed" },
    {
        key: "out_for_delivery",
        label: "Out for delivery",
        path: "/admin/orders/out-for-delivery",
    },
    { key: "delivered", label: "Delivered", path: "/admin/orders/delivered" },
    { key: "cancelled", label: "Cancelled", path: "/admin/orders/cancelled" },
];

const STATUS_ICONS = {
    confirmed: Check,
    out_for_delivery: Truck,
    delivered: CheckCircle2,
    cancelled: X,
};

const STATS = [
    {
        key: "all",
        label: "Total orders",
        icon: ShoppingBag,
        path: "/admin/orders",
    },
    {
        key: "pending",
        label: "Pending",
        icon: Clock,
        path: "/admin/orders/pending",
    },
    {
        key: "out_for_delivery",
        label: "Out for delivery",
        icon: Truck,
        path: "/admin/orders/out-for-delivery",
    },
    {
        key: "delivered",
        label: "Delivered",
        icon: CheckCircle2,
        path: "/admin/orders/delivered",
    },
];

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "total-high", label: "Total: high to low" },
    { value: "total-low", label: "Total: low to high" },
];


const Actions = ({ order, onStatusAction, onCancelOrder }) => {
    const navigate = useNavigate();

    const nextStatuses = getNextStatuses(order).filter(
        (status) => status !== "cancelled",
    );

    const cancelAllowed = canCancelOrder(order);
    const awaitingPayment = isAwaitingOnlinePayment(order);

    const copyOrderNumber = async () => {
        try {
            await navigator.clipboard.writeText(String(order.orderNumber));
            toast.success(`Copied order #${order.orderNumber}`);
        } catch {
            toast.error("Unable to copy the order number");
        }
    };

    return (
        <div
            className="flex justify-end"
            onClick={(event) => event.stopPropagation()}
        >
            <DropdownMenu>
                {/*
                 * Base UI composes through `render`, not Radix's `asChild`.
                 * The wrapper below bridges the two so the trigger is a single
                 * <button> instead of an invalid nested pair.
                 */}
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-lg px-2"
                            aria-label="Order actions"
                            title="Order actions"
                        >
                            <MoreHorizontal className="size-4" />
                        </Button>
                    }
                />

                <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Order actions</DropdownMenuLabel>

                        <DropdownMenuItem
                            onClick={() =>
                                navigate(`/admin/orders/${order._id}`)
                            }
                        >
                            <Eye />
                            View order details
                        </DropdownMenuItem>

                        <DropdownMenuItem onClick={copyOrderNumber}>
                            <Copy />
                            Copy order number
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() =>
                                navigate(
                                    `/order-tracking?orderNumber=${encodeURIComponent(order.orderNumber)}`,
                                )
                            }
                        >
                            <ExternalLink />
                            Track order
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuLabel>Update status</DropdownMenuLabel>

                        {awaitingPayment ? (
                            <DropdownMenuItem disabled>
                                Awaiting online payment
                            </DropdownMenuItem>
                        ) : nextStatuses.length === 0 ? (
                            <DropdownMenuItem disabled>
                                Order is finalized
                            </DropdownMenuItem>
                        ) : (
                            nextStatuses.map((status) => {
                                const Icon = STATUS_ICONS[status] ?? Check;

                                return (
                                    <DropdownMenuItem
                                        key={status}
                                        onClick={() =>
                                            onStatusAction(order, status)
                                        }
                                    >
                                        <Icon />
                                        {STATUS_ACTION_LABELS[status]}
                                    </DropdownMenuItem>
                                );
                            })
                        )}
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                        variant="destructive"
                        disabled={!cancelAllowed}
                        title={
                            !cancelAllowed
                                ? "Only pending cash-on-delivery orders can be cancelled"
                                : undefined
                        }
                        onClick={() => onCancelOrder(order)}
                    >
                        <X />
                        Cancel order
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};


const OrdersList = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("newest");
    const [statusAction, setStatusAction] = useState(null);
    const queryClient = useQueryClient();

    const { data, isLoading, isError, refetch } = useGet({
        url: `/admin/orders`,
        queryKey: ["admin-orders"],
        retry: false,
    });

    const orders = useMemo(() => data?.data ?? [], [data]);

    const activeFilter =
        STATUS_TABS.find((tab) => tab.path === pathname)?.key ?? "all";

    const counts = useMemo(() => {
        const next = { all: orders.length };

        for (const status of Object.keys(STATUS_LABELS)) {
            next[status] = orders.filter(
                (order) => order.orderStatus === status,
            ).length;
        }

        return next;
    }, [orders]);

    const visibleOrders = useMemo(() => {
        const query = search.trim().toLowerCase();

        const filtered = orders.filter((order) => {
            if (activeFilter !== "all" && order.orderStatus !== activeFilter) {
                return false;
            }

            if (!query) {
                return true;
            }

            return [
                order.orderNumber,
                order.user?.username,
                order.user?.email,
                order.shippingAddress?.fullName,
                order.shippingAddress?.phone,
            ].some((value) =>
                String(value ?? "").toLowerCase().includes(query),
            );
        });

        const sorted = [...filtered];

        switch (sort) {
            case "oldest":
                sorted.sort(
                    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                );
                break;
            case "total-high":
                sorted.sort((a, b) => b.totalPrice - a.totalPrice);
                break;
            case "total-low":
                sorted.sort((a, b) => a.totalPrice - b.totalPrice);
                break;
            default:
                sorted.sort(
                    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
                );
        }

        return sorted;
    }, [orders, activeFilter, search, sort]);

    const { mutate: updateStatus, isPending: isUpdating } = useMutation({
        mutationFn: async ({ orderId, status }) => {
            const response = await api.patch(
                `/admin/orders/${orderId}/status`,
                { status },
            );

            return response.data;
        },
        onSuccess: (response) => {
            toast.success(response?.message || "Order status updated");

            setStatusAction(null);
            queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message ||
                    "Unable to update order status",
            );

            setStatusAction(null);
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <Loader2 className="size-7 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border bg-background p-10 text-center">
                <h2 className="text-lg font-bold text-foreground">
                    Failed to load orders
                </h2>

                <p className="mt-2 text-sm text-muted-foreground">
                    Something went wrong while fetching orders.
                </p>

                <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => refetch()}
                >
                    Try again
                </Button>
            </div>
        );
    }


    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    Orders
                </h1>

                <p className="mt-1 text-sm text-muted-foreground">
                    View and manage customer orders, statuses, and payments.
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {STATS.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <button
                            key={stat.key}
                            type="button"
                            onClick={() => navigate(stat.path)}
                            className={`rounded-2xl border bg-background p-5 text-left transition-colors hover:bg-muted/50 ${
                                activeFilter === stat.key
                                    ? "border-primary ring-1 ring-primary"
                                    : ""
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">
                                    {stat.label}
                                </span>

                                <Icon className="size-4 text-muted-foreground" />
                            </div>

                            <p className="mt-2 text-2xl font-bold text-foreground">
                                {counts[stat.key] ?? 0}
                            </p>
                        </button>
                    );
                })}
            </div>

            {/* Search + sort */}
            <div className="flex flex-col gap-3 rounded-2xl border bg-background p-5 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search by order number, customer, email, or phone..."
                        className="h-11 rounded-xl pl-11 pr-4 text-[15px] shadow-none"
                    />
                </div>

                <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="h-11 w-full rounded-xl sm:w-48">
                        <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                        {SORT_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Status filter tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map((tab) => (
                    <NavLink
                        key={tab.key}
                        to={tab.path}
                        end
                        className={({ isActive }) =>
                            `flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors ${
                                isActive
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`
                        }
                    >
                        {tab.label}

                        <span
                            className={`rounded-full px-1.5 py-0.5 text-xs ${
                                pathname === tab.path
                                    ? "bg-primary-foreground/20 text-primary-foreground"
                                    : "bg-muted text-muted-foreground"
                            }`}
                        >
                            {counts[tab.key] ?? 0}
                        </span>
                    </NavLink>
                ))}
            </div>


            {/* Table */}
            {visibleOrders.length === 0 ? (
                <div className="rounded-2xl border bg-background p-10 text-center">
                    <h2 className="text-lg font-bold text-foreground">
                        {orders.length === 0 ? "No orders yet" : "No results"}
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {orders.length === 0
                            ? "Orders placed by customers will appear here."
                            : "No orders match your search or filter."}
                    </p>

                    {orders.length > 0 && search && (
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => setSearch("")}
                        >
                            Clear search
                        </Button>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border bg-white">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="h-12 px-5">
                                        Order
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Customer
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Status
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Payment
                                    </TableHead>

                                    <TableHead className="h-12 px-5">
                                        Total
                                    </TableHead>

                                    <TableHead className="h-12 px-5 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>


                            <TableBody>
                                {visibleOrders.map((order) => (
                                    <TableRow
                                        key={order._id}
                                        className="cursor-pointer"
                                        onClick={() =>
                                            navigate(
                                                `/admin/orders/${order._id}`,
                                            )
                                        }
                                    >
                                        <TableCell className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                #{order.orderNumber}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {`Placed ${new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                {order.shippingAddress
                                                    ?.fullName ||
                                                    order.user?.username}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {order.user?.email}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            <Badge
                                                className={getStatusClass(
                                                    order.orderStatus,
                                                )}
                                            >
                                                {STATUS_LABELS[
                                                    order.orderStatus
                                                ] ?? order.orderStatus}
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            <div className="font-medium text-foreground">
                                                {order.paymentMethod === "online"
                                                    ? "Online"
                                                    : "Cash on delivery"}
                                            </div>

                                            <div className="text-xs text-muted-foreground">
                                                {formatPaymentStatus(
                                                    order.paymentStatus,
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-5 py-4 font-medium text-foreground">
                                            {formatPrice(order.totalPrice)}
                                        </TableCell>

                                        <TableCell className="px-5 py-4">
                                            <Actions
                                                order={order}
                                                onStatusAction={(target, status) =>
                                                    setStatusAction({
                                                        order: target,
                                                        status,
                                                    })
                                                }
                                                onCancelOrder={(target) =>
                                                    setStatusAction({
                                                        order: target,
                                                        status: "cancelled",
                                                    })
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}


            {/* Status update confirmation modal */}
            <AlertDialog
                open={Boolean(statusAction)}
                onOpenChange={(open) => {
                    if (!open && !isUpdating) {
                        setStatusAction(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {statusAction?.status === "cancelled"
                                ? "Cancel this order?"
                                : "Update order status?"}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {statusAction?.status === "cancelled" ? (
                                <>
                                    You are about to cancel order{" "}
                                    <span className="font-medium text-foreground">
                                        #{statusAction?.order?.orderNumber}
                                    </span>
                                    . The reserved cake stock will be restored
                                    and the customer will see the order as
                                    cancelled. This cannot be undone.
                                </>
                            ) : (
                                <>
                                    Mark order{" "}
                                    <span className="font-medium text-foreground">
                                        #{statusAction?.order?.orderNumber}
                                    </span>{" "}
                                    as{" "}
                                    <span className="font-medium text-foreground">
                                        {
                                            STATUS_LABELS[
                                                statusAction?.status
                                            ]
                                        }
                                    </span>
                                    ?{" "}
                                    {statusAction?.status === "delivered"
                                        ? "The delivery date will be recorded. "
                                        : ""}
                                    The customer will see the updated status
                                    when tracking their order.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>
                            Go back
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isUpdating}
                            onClick={(event) => {
                                event.preventDefault();
                                updateStatus({
                                    orderId: statusAction.order._id,
                                    status: statusAction.status,
                                });
                            }}
                        >
                            {isUpdating
                                ? "Updating..."
                                : statusAction?.status === "cancelled"
                                  ? "Yes, cancel order"
                                  : "Update status"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OrdersList;
