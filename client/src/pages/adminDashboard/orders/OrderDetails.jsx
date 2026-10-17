import { useState } from "react";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    ArrowLeft,
    Check,
    CheckCircle2,
    CreditCard,
    Loader2,
    MapPin,
    Package,
    Pencil,
    Truck,
    User,
    XCircle,
} from "lucide-react";
import { toast } from "sonner";

import api from "@/api/axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import usePatch from "@/hooks/usePatch";
import { buildTrackingSteps, getStatusClass } from "@/utils/orderStatus";
import {
    STATUS_ACTION_LABELS,
    STATUS_LABELS,
    canCancelOrder,
    formatPaymentStatus,
    formatPrice,
    getNextStatuses,
    isAwaitingOnlinePayment,
} from "@/utils/adminOrder";

const STATUS_ICONS = {
    confirmed: Check,
    out_for_delivery: Truck,
    delivered: CheckCircle2,
};

const StatusBadge = ({ status }) => (
    <Badge className={getStatusClass(status)}>
        {STATUS_LABELS[status] ?? status}
    </Badge>
);

const StatusTimeline = ({ order }) => {
    const history = order?.statusHistory ?? [];

    return (
        <Card className="rounded-2xl border bg-background shadow-none">
            <CardHeader className="px-5 py-4 sm:px-6">
                <CardTitle className="text-lg">Status history</CardTitle>
            </CardHeader>

            <CardContent className="px-5 pb-5 sm:pb-6">
                <div className="space-y-0">
                    {history.map((entry, index) => {
                        const enabled = index === history.length - 1;

                        return (
                            <div
                                key={index}
                                className="flex flex-col gap-3"
                                style={{ paddingTop: index === 0 ? "6px" : "0" }}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${enabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                    >
                                        {enabled ? (
                                            <div className="relative flex size-4">
                                                <div className="absolute inline-flex size-full rounded-full bg-primary/20 animate-ping" />
                                                <div className="relative inline-flex size-4 rounded-full bg-primary" />
                                            </div>
                                        ) : (
                                            <div className="size-2 rounded-full bg-current opacity-60" />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <StatusBadge status={entry?.status} />

                                        <p className="text-xs text-muted-foreground">
                                            {entry?.note || "No notes"}
                                        </p>
                                    </div>
                                </div>

                                {index < history.length - 1 && (
                                    <div className="ml-11 mt-2 h-0.5 w-16 rounded bg-border sm:w-24" />
                                )}
                            </div>
                        );
                    })}

                    {history.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            No status history yet
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};


const OrderActionsCard = ({ order, isUpdating, onAskStatus }) => {
    const nextStatuses = getNextStatuses(order);
    const changeable = nextStatuses.filter((status) => status !== "cancelled");
    const cancelAllowed = canCancelOrder(order);
    const awaitingPayment = isAwaitingOnlinePayment(order);
    const isFinal = nextStatuses.length === 0 && !awaitingPayment;

    return (
        <Card className="rounded-2xl border bg-background shadow-none">
            <CardHeader className="px-5 py-4 sm:px-6">
                <CardTitle className="text-lg">Manage order</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5 px-5 pb-5 sm:pb-6">
                {awaitingPayment && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800">
                        Awaiting online payment — status actions unlock after
                        the customer pays. The order stays here so it can be
                        confirmed once payment arrives.
                    </div>
                )}
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-foreground">
                            Current status
                        </p>

                        <div>
                            <StatusBadge status={order.orderStatus} />
                        </div>

                        <p className="text-xs text-muted-foreground">
                            {isFinal
                                ? "This order is finalized and can no longer change status."
                                : "Update the status as you process this order. The customer sees the same status when tracking."}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {changeable.map((status) => {
                            const Icon = STATUS_ICONS[status] ?? Check;

                            return (
                                <Button
                                    key={status}
                                    variant={
                                        status === "delivered"
                                            ? "default"
                                            : "outline"
                                    }
                                    className="rounded-xl"
                                    disabled={isUpdating}
                                    onClick={() => onAskStatus(status)}
                                >
                                    <Icon className="mr-2 size-4" />
                                    {STATUS_ACTION_LABELS[status]}
                                </Button>
                            );
                        })}

                        <Button
                            variant="outline"
                            className="rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            disabled={!cancelAllowed || isUpdating}
                            onClick={() => onAskStatus("cancelled")}
                        >
                            <XCircle className="mr-2 size-4" />
                            Cancel order
                        </Button>
                    </div>
                </div>

                {!cancelAllowed && !isFinal && (
                    <p className="text-xs text-muted-foreground">
                        Only pending cash-on-delivery orders can be cancelled.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};


const AdminNotesCard = ({ order, orderId, onSaved }) => {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState(order.adminNotes ?? "");

    const { mutate: saveNotes, isPending: isSaving } = usePatch({
        url: `/admin/orders/${orderId}/notes`,
    });

    const handleOpen = () => {
        setNotes(order.adminNotes ?? "");
        setOpen(true);
    };

    const handleSave = () => {
        saveNotes(
            { adminNotes: notes },
            {
                onSuccess: (response) => {
                    toast.success(response?.message || "Notes saved");
                    setOpen(false);
                    onSaved();
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                            "Unable to save notes",
                    );
                },
            },
        );
    };

    return (
        <Card className="rounded-2xl border bg-background shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-5 py-4 sm:px-6">
                <CardTitle className="text-lg">Admin notes</CardTitle>

                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl"
                    onClick={handleOpen}
                >
                    <Pencil className="mr-1.5 size-4" />
                    {order.adminNotes ? "Edit note" : "Add note"}
                </Button>
            </CardHeader>

            <CardContent className="px-5 pb-5 sm:pb-6">
                {order.adminNotes ? (
                    <p className="text-sm whitespace-pre-line text-muted-foreground">
                        {order.adminNotes}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No notes yet. Notes are internal and only visible to
                        admins.
                    </p>
                )}
            </CardContent>

            <Dialog
                open={open}
                onOpenChange={(nextOpen) => {
                    if (!nextOpen && !isSaving) {
                        setOpen(false);
                    }
                }}
            >
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>
                            {order.adminNotes
                                ? "Edit admin note"
                                : "Add admin note"}
                        </DialogTitle>

                        <DialogDescription>
                            Internal note for this order. Only visible to
                            admins.
                        </DialogDescription>
                    </DialogHeader>

                    <Textarea
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={5}
                        maxLength={1000}
                        placeholder="e.g. Customer requested delivery after 6pm"
                    />

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>

                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving && (
                                <Loader2 className="mr-2 size-4 animate-spin" />
                            )}
                            Save note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
};


const OrderDetails = () => {
    const { orderId } = useParams();
    const queryClient = useQueryClient();
    const [statusConfirm, setStatusConfirm] = useState(null);

    const {
        data: orderResponse,
        isLoading,
        isError,
    } = useGet({
        url: `/admin/orders/${orderId}`,
        queryKey: ["admin-order", orderId],
        enabled: Boolean(orderId),
        retry: false,
    });

    const order = orderResponse?.data;

    const invalidateOrderQueries = () => {
        queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
        queryClient.invalidateQueries({ queryKey: ["admin-order", orderId] });
    };

    const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
        mutationFn: async (newStatus) => {
            const response = await api.patch(
                `/admin/orders/${orderId}/status`,
                { status: newStatus },
            );

            return response.data;
        },
        onSuccess: (response) => {
            toast.success(response?.message || "Status updated successfully");

            setStatusConfirm(null);
            invalidateOrderQueries();
        },
        onError: (error) => {
            toast.error(
                error?.response?.data?.message || "Unable to update status",
            );

            setStatusConfirm(null);
        },
    });

    if (isLoading) {
        return (
            <div className="flex min-h-60 items-center justify-center">
                <Loader2 className="size-7 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="space-y-6">
                <Button
                    asChild
                    variant="ghost"
                    className="-ml-3 rounded-xl text-muted-foreground"
                >
                    <Link to="/admin/orders">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to orders
                    </Link>
                </Button>

                <div className="rounded-2xl border bg-background p-10 text-center">
                    <h2 className="text-lg font-bold text-foreground">
                        Order not found
                    </h2>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                        This order could not be found. It may have been removed.
                    </p>
                </div>
            </div>
        );
    }

    const shipping = order.shippingAddress ?? {};
    const items = order.items ?? [];
    const addOns = order.addOns ?? [];
    const trackingSteps = buildTrackingSteps(order, "en");
    const customerName = shipping.fullName || order.user?.username;


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <Button
                    asChild
                    variant="ghost"
                    className="-ml-3 mb-4 rounded-xl text-muted-foreground"
                >
                    <Link to="/admin/orders">
                        <ArrowLeft className="mr-2 size-4" />
                        Back to orders
                    </Link>
                </Button>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="mb-1 text-sm font-semibold text-primary">
                            Orders
                        </p>

                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {`Order #${order.orderNumber}`}
                        </h1>

                        <p className="mt-2 text-sm text-muted-foreground">
                            {`Placed on ${new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`}
                        </p>
                    </div>

                    <StatusBadge status={order.orderStatus} />
                </div>
            </div>

            {/* Quick status actions */}
            <OrderActionsCard
                order={order}
                isUpdating={isUpdatingStatus}
                onAskStatus={setStatusConfirm}
            />

            {/* Fulfillment progress */}
            <Card className="rounded-2xl border bg-background shadow-none">
                <CardHeader className="px-5 py-4 sm:px-6">
                    <CardTitle className="text-lg">
                        Fulfillment progress
                    </CardTitle>
                </CardHeader>

                <CardContent className="px-5 pb-5 sm:pb-6">
                    <div
                        className={`grid gap-3 ${trackingSteps.length > 1 ? "sm:grid-cols-4" : ""}`}
                    >
                        {trackingSteps.map((step) => {
                            const Icon = step.icon;
                            const isCancelled = step.key === "cancelled";
                            const isDone =
                                Boolean(step.completed) ||
                                Boolean(step.current);

                            return (
                                <div
                                    key={step.key}
                                    className={`rounded-xl border p-4 ${
                                        step.current
                                            ? "border-primary bg-primary/5"
                                            : isDone
                                              ? "border-primary/40 bg-primary/[0.03]"
                                              : "border-border"
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <Icon
                                            className={`size-4 ${
                                                isCancelled
                                                    ? "text-destructive"
                                                    : isDone
                                                      ? "text-primary"
                                                      : "text-muted-foreground"
                                            }`}
                                        />

                                        {isCancelled ? (
                                            <XCircle className="size-3.5 text-destructive" />
                                        ) : (
                                            isDone && (
                                                <Check className="size-3.5 text-primary" />
                                            )
                                        )}
                                    </div>

                                    <p className="mt-2 text-sm font-medium text-foreground">
                                        {step.title}
                                    </p>

                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        {step.date ||
                                            (step.current
                                                ? "In progress"
                                                : isDone
                                                  ? "Completed"
                                                  : "Not started")}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>


            {/* Customer & payment */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardHeader className="px-5 py-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="size-4 text-muted-foreground" />
                            Customer & delivery
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4 px-5 pb-5 sm:pb-6">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Customer
                            </p>

                            <p className="font-medium text-foreground">
                                {customerName}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                {order.user?.email}
                            </p>

                            {shipping.phone && (
                                <p className="text-sm text-muted-foreground">
                                    {shipping.phone}
                                </p>
                            )}
                        </div>

                        <div>
                            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <MapPin className="size-3.5" />
                                Delivery address
                            </p>

                            <p className="mt-1 text-sm text-foreground">
                                {[
                                    `Block ${shipping.block}`,
                                    `Street ${shipping.street}`,
                                    `Building ${shipping.building}`,
                                    shipping.floor
                                        ? `Floor ${shipping.floor}`
                                        : null,
                                    shipping.apartmentNo
                                        ? `Apt ${shipping.apartmentNo}`
                                        : null,
                                    shipping.area,
                                    shipping.governorate,
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>

                            {shipping.notes && (
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {`Note: ${shipping.notes}`}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>


                <Card className="rounded-2xl border bg-background shadow-none">
                    <CardHeader className="px-5 py-4 sm:px-6">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CreditCard className="size-4 text-muted-foreground" />
                            Payment summary
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-3 px-5 pb-5 sm:pb-6">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Method
                            </span>
                            <span className="font-medium text-foreground">
                                {order.paymentMethod === "online"
                                    ? "Online payment"
                                    : "Cash on delivery"}
                            </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Payment status
                            </span>
                            <Badge
                                className={
                                    order.paymentStatus === "paid"
                                        ? "bg-primary/10 text-primary"
                                        : order.paymentStatus === "failed"
                                          ? "bg-destructive/10 text-destructive"
                                          : "bg-amber-500/10 text-amber-600"
                                }
                            >
                                {formatPaymentStatus(order.paymentStatus)}
                            </Badge>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="text-foreground">
                                {formatPrice(order.subtotal)}
                            </span>
                        </div>

                        {Number(order.discount) > 0 && (
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Discount
                                </span>
                                <span className="text-primary">
                                    {`- ${formatPrice(order.discount)}`}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                                Delivery fee
                            </span>
                            <span className="text-foreground">
                                {formatPrice(order.deliveryFee)}
                            </span>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground">
                                Total
                            </span>
                            <span className="text-lg font-bold text-foreground">
                                {formatPrice(order.totalPrice)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* Status timeline */}
            <StatusTimeline order={order} />

            {/* Items */}
            <Card className="rounded-2xl border bg-background shadow-none">
                <CardHeader className="px-5 py-4 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Package className="size-4 text-muted-foreground" />
                        {`Items (${items.length + addOns.length})`}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 px-5 pb-5 sm:pb-6">
                    {items.length === 0 && addOns.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                            This order has no items.
                        </p>
                    )}

                    {items.map((item) => (
                        <div
                            key={item._id ?? `${item.cake}-${item.name.en}`}
                            className="flex gap-4 border-b border-border pb-4 last:border-0"
                        >
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <Package className="size-6 text-muted-foreground" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {item.name.en}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {`Quantity: ${item.quantity}`}
                                        </p>

                                        {item.specialInstructions && (
                                            <p className="text-sm text-muted-foreground">
                                                {`Instructions: ${item.specialInstructions}`}
                                            </p>
                                        )}
                                    </div>

                                    <p className="font-semibold text-foreground">
                                        {formatPrice(item.totalPrice)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}


                    {addOns.map((item) => (
                        <div
                            key={item._id ?? `${item.addOn}-${item.name.en}`}
                            className="flex gap-4 border-b border-border pb-4 last:border-0"
                        >
                            <div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-muted">
                                <Package className="size-6 text-muted-foreground" />
                            </div>

                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-foreground">
                                            {item.name.en}
                                        </p>

                                        <p className="text-sm text-muted-foreground">
                                            {`Quantity: ${item.quantity}`}
                                        </p>

                                        {item.specialInstructions && (
                                            <p className="text-sm text-muted-foreground">
                                                {`Instructions: ${item.specialInstructions}`}
                                            </p>
                                        )}
                                    </div>

                                    <p className="font-semibold text-foreground">
                                        {formatPrice(item.totalPrice)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Admin notes */}
            <AdminNotesCard
                order={order}
                orderId={orderId}
                onSaved={invalidateOrderQueries}
            />

            {/* Status update confirmation modal */}
            <AlertDialog
                open={Boolean(statusConfirm)}
                onOpenChange={(open) => {
                    if (!open && !isUpdatingStatus) {
                        setStatusConfirm(null);
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {statusConfirm === "cancelled"
                                ? "Cancel this order?"
                                : "Update order status?"}
                        </AlertDialogTitle>

                        <AlertDialogDescription>
                            {statusConfirm === "cancelled" ? (
                                <>
                                    You are about to cancel order{" "}
                                    <span className="font-medium text-foreground">
                                        #{order.orderNumber}
                                    </span>{" "}
                                    for{" "}
                                    <span className="font-medium text-foreground">
                                        {customerName}
                                    </span>
                                    . The reserved cake stock will be restored
                                    and the customer will see the order as
                                    cancelled. This cannot be undone.
                                </>
                            ) : (
                                <>
                                    Mark order{" "}
                                    <span className="font-medium text-foreground">
                                        #{order.orderNumber}
                                    </span>{" "}
                                    as{" "}
                                    <span className="font-medium text-foreground">
                                        {STATUS_LABELS[statusConfirm]}
                                    </span>
                                    ?{" "}
                                    {statusConfirm === "delivered"
                                        ? "The delivery date will be recorded. "
                                        : ""}
                                    The customer will see the updated status
                                    when tracking their order.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingStatus}>
                            Go back
                        </AlertDialogCancel>

                        <AlertDialogAction
                            disabled={isUpdatingStatus}
                            onClick={(event) => {
                                event.preventDefault();
                                updateStatus(statusConfirm);
                            }}
                        >
                            {isUpdatingStatus
                                ? "Updating..."
                                : statusConfirm === "cancelled"
                                  ? "Yes, cancel order"
                                  : "Update status"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default OrderDetails;
