import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
    Check,
    ChevronRight,
    CreditCard,
    MapPin,
    Pencil,
    ShoppingBag,
    Sparkles,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";

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
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import { useLanguage } from "@/context/LanguageContext";

const governorates = [
    "Al Asimah",
    "Hawalli",
    "Farwaniya",
    "Mubarak Al-Kabeer",
    "Ahmadi",
    "Jahra",
];

// Keep these in sync with the backend validation schema
const FIELD_LIMITS = {
    fullNameMin: 4,
    fullName: 30,
    area: 100,
    block: 50,
    street: 150,
    building: 50,
    floor: 50,
    apartmentNo: 50,
    notes: 300,
};

const formatPrice = (price) => `${Number(price).toFixed(3)} KWD`;

/*
 * Extracts the (up to) 8 local digits from whatever the user typed or pasted:
 * "+965 9123 4567", "00965 91234567", "965-9123-4567", "9123 4567" ...
 */
const extractKuwaitLocalNumber = (phone = "") => {
    let digits = String(phone).replace(/\D/g, "");

    if (digits.startsWith("00965")) {
        digits = digits.slice(5);
    } else if (digits.startsWith("965") && digits.length > 8) {
        digits = digits.slice(3);
    }

    return digits.slice(0, 8);
};

// Final format sent to the backend: +965XXXXXXXX
const normalizeKuwaitPhone = (phone = "") => {
    const local = extractKuwaitLocalNumber(phone);

    return local ? `+965${local}` : "";
};

const isValidKuwaitPhone = (phone = "") => {
    return /^[2-9]\d{7}$/.test(extractKuwaitLocalNumber(phone));
};

// Pretty display: +965 9123 4567
const formatKuwaitPhoneForDisplay = (phone = "") => {
    const local = extractKuwaitLocalNumber(phone);

    if (local.length !== 8) {
        return phone;
    }

    return `+965 ${local.slice(0, 4)} ${local.slice(4)}`;
};

const Checkout = () => {
    const { language } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const selectedCakeIds = location.state?.cakeIds ?? [];

    const [savedAddress, setSavedAddress] = useState(null);
    const [address, setAddress] = useState({
        phone: "",
    });
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [placedOrder, setPlacedOrder] = useState(null);

    const {
        data: cartResponse,
        isLoading: isCartLoading,
        isError: isCartError,
    } = useGet({
        url: "/cart",
        queryKey: ["cart"],
        retry: false,
        enabled: selectedCakeIds.length > 0,
    });

    const { mutate: createOrder, isPending: isCreatingOrder } = usePost({
        url: "/order",
    });

    const { mutate: createPayment, isPending: isCreatingPayment } = usePost({
        url: "/payments",
    });

    const orderItems = useMemo(() => {
        const cartItems = cartResponse?.data?.items ?? [];

        return cartItems
            .filter((item) => {
                const cakeId =
                    typeof item.cake === "object" ? item.cake?._id : item.cake;

                return selectedCakeIds.includes(cakeId);
            })
            .map((item) => {
                const cake = item.cake;

                if (!cake || typeof cake !== "object") {
                    return null;
                }

                const imageUrl =
                    typeof cake.images?.[0] === "string"
                        ? cake.images[0]
                        : cake.images?.[0]?.url;

                const originalPrice = Number(cake.price ?? 0);

                const discountedPrice =
                    cake.discountedPrice !== undefined
                        ? Number(cake.discountedPrice)
                        : originalPrice;

                return {
                    id: cake._id,
                    name: cake.name,
                    imageUrl,
                    price: originalPrice,
                    discountedPrice,
                    quantity: item.quantity,
                };
            })
            .filter(Boolean);
    }, [cartResponse, selectedCakeIds]);

    const orderAddOns = useMemo(() => {
        const cartAddOns = cartResponse?.data?.addOns ?? [];

        return cartAddOns
            .map((item) => {
                const addOn = item.addOn;

                if (!addOn || typeof addOn !== "object") {
                    return null;
                }

                return {
                    id: addOn._id,
                    name: addOn.name,
                    imageUrl: addOn.imageUrl,
                    price: Number(addOn.price ?? 0),
                    quantity: item.quantity,
                };
            })
            .filter(Boolean);
    }, [cartResponse]);

    const cakesTotal = orderItems.reduce(
        (total, item) => total + item.discountedPrice * item.quantity,
        0,
    );

    const addOnsTotal = orderAddOns.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );

    const subtotal = cakesTotal + addOnsTotal;

    const cakesCount = orderItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const addOnsCount = orderAddOns.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const itemsCount = cakesCount + addOnsCount;

    const deliveryFee = 0;

    const discount = orderItems.reduce(
        (total, item) =>
            total + (item.price - item.discountedPrice) * item.quantity,
        0,
    );

    const totalPrice = subtotal + deliveryFee;

    const updateAddress = (field, value) => {
        setAddress((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleOpenAddressModal = () => {
        setAddress(
            savedAddress
                ? {
                      ...savedAddress,
                      // Show only the 8 local digits inside the modal
                      phone: extractKuwaitLocalNumber(savedAddress.phone),
                  }
                : {
                      phone: "",
                  },
        );

        setIsAddressModalOpen(true);
    };

    const handleSaveAddress = () => {
        const fullName = address.fullName?.trim();
        const localPhone = extractKuwaitLocalNumber(address.phone);
        const area = address.area?.trim();
        const block = address.block?.trim();
        const street = address.street?.trim();
        const building = address.building?.trim();
        const floor = address.floor?.trim();
        const apartmentNo = address.apartmentNo?.trim();
        const notes = address.notes?.trim();

        if (!fullName) {
            toast.error("Please enter your full name.");
            return;
        }

        if (fullName.length < FIELD_LIMITS.fullNameMin) {
            toast.error(
                `Full name must be at least ${FIELD_LIMITS.fullNameMin} characters.`,
            );
            return;
        }

        if (fullName.length > FIELD_LIMITS.fullName) {
            toast.error(
                `Full name cannot exceed ${FIELD_LIMITS.fullName} characters.`,
            );
            return;
        }

        if (!localPhone) {
            toast.error("Please enter your phone number.");
            return;
        }

        if (!isValidKuwaitPhone(localPhone)) {
            toast.error("Please enter a valid 8-digit Kuwait phone number.");
            return;
        }

        if (!address.governorate) {
            toast.error("Please select your governorate.");
            return;
        }

        if (!area) {
            toast.error("Please enter your area.");
            return;
        }

        if (!block) {
            toast.error("Please enter your block.");
            return;
        }

        if (!street) {
            toast.error("Please enter your street.");
            return;
        }

        if (!building) {
            toast.error("Please enter your building number.");
            return;
        }

        setSavedAddress({
            fullName,
            phone: normalizeKuwaitPhone(localPhone),
            governorate: address.governorate,
            area,
            block,
            street,
            building,
            ...(floor ? { floor } : {}),
            ...(apartmentNo ? { apartmentNo } : {}),
            ...(notes ? { notes } : {}),
        });

        setIsAddressModalOpen(false);
    };

    const handlePlaceOrder = () => {
        if (!savedAddress) {
            toast.error("Please add a delivery address.");
            return;
        }

        if (!paymentMethod) {
            toast.error("Please select a payment method.");
            return;
        }

        if (!selectedCakeIds.length) {
            toast.error("No cakes selected for checkout.");
            navigate("/cart");
            return;
        }

        const payload = {
            cakeIds: selectedCakeIds,
            addOns: orderAddOns.map((item) => ({
                addOnId: item.id,
                quantity: item.quantity,
            })),
            shippingAddress: savedAddress,
            paymentMethod,
        };

        createOrder(payload, {
            onSuccess: (response) => {
                const order = response?.data;

                if (!order?._id) {
                    toast.error(
                        "Order was created, but the order ID is missing.",
                    );
                    return;
                }

                if (paymentMethod === "cash_on_delivery") {
                    setPlacedOrder(order);
                    setOrderPlaced(true);

                    toast.success(
                        response?.message || "Order placed successfully.",
                    );

                    return;
                }

                createPayment(
                    {
                        orderId: order._id,
                    },
                    {
                        onSuccess: (paymentResponse) => {
                            const paymentUrl =
                                paymentResponse?.data?.paymentUrl;

                            if (!paymentUrl) {
                                toast.error(
                                    "Payment was created, but the payment URL is missing.",
                                );
                                return;
                            }

                            window.location.href = paymentUrl;
                        },

                        onError: (error) => {
                            const message =
                                error?.response?.data?.message ||
                                "Unable to initialize payment. Please try again.";

                            toast.error(message);
                        },
                    },
                );
            },

            onError: (error) => {
                const message =
                    error?.response?.data?.message ||
                    "Unable to place your order. Please try again.";

                toast.error(message);
            },
        });
    };

    if (!selectedCakeIds.length) {
        return (
            <main className="wrapper py-10 md:py-14">
                <div className="mx-auto max-w-2xl border border-border bg-card p-8 text-center md:p-12">
                    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShoppingBag className="size-8" />
                    </div>

                    <p className="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
                        Checkout
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        No items selected
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                        Please select at least one cake from your cart before
                        continuing to checkout.
                    </p>

                    <Button
                        variant="asymmetric"
                        size="lg"
                        className="mt-8"
                        onClick={() => navigate("/cart")}
                    >
                        Back to cart
                        <ChevronRight className="size-4" />
                    </Button>
                </div>
            </main>
        );
    }

    if (orderPlaced) {
        return (
            <main className="wrapper py-10 md:py-14">
                <div className="mx-auto max-w-2xl border border-border bg-card p-8 text-center md:p-12">
                    <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="size-8" />
                    </div>

                    <p className="mb-2 text-sm font-semibold tracking-wider text-primary uppercase">
                        Order placed
                    </p>

                    <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Your order is confirmed
                    </h1>

                    <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                        Your order has been created successfully. We will
                        continue with your selected payment and delivery flow.
                    </p>

                    {placedOrder?.orderNumber && (
                        <div className="mt-6 border border-border bg-background p-4">
                            <p className="text-xs text-muted-foreground">
                                Order number
                            </p>

                            <p className="mt-1 font-semibold">
                                {placedOrder.orderNumber}
                            </p>
                        </div>
                    )}

                    <div className="mt-8 flex flex-col justify-center gap-3 md:flex-row">
                        <Button
                            variant="asymmetric"
                            size="lg"
                            onClick={() => navigate("/")}
                        >
                            Continue shopping
                        </Button>

                        <Button
                            variant="outline-asymmetric"
                            size="lg"
                            onClick={() => navigate("/dashboard/orders")}
                        >
                            View orders
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                </div>
            </main>
        );
    }

    const isLoading = isCartLoading;
    const hasError = isCartError;

    const hasMissingSelectedCake =
        !isCartLoading && orderItems.length !== selectedCakeIds.length;

    const isCheckoutReady =
        !isLoading &&
        !hasError &&
        !hasMissingSelectedCake &&
        orderItems.length > 0;

    const isProcessingOrder = isCreatingOrder || isCreatingPayment;

    return (
        <main className="wrapper py-6 md:py-10">
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Cart</span>

                    <ChevronRight className="size-4" />

                    <span className="font-medium text-foreground">
                        Checkout
                    </span>
                </div>

                <div className="mt-5">
                    <p className="text-sm font-semibold tracking-wider text-primary uppercase">
                        Secure checkout
                    </p>

                    <h1 className="mt-1 text-3xl font-bold tracking-tight md:text-4xl">
                        Complete your order
                    </h1>

                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
                        Confirm your delivery details, choose your payment
                        method, and review your order before placing it.
                    </p>
                </div>
            </div>

            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                    <section className="border border-border bg-card p-5 md:p-6">
                        <SectionHeader
                            number="01"
                            icon={MapPin}
                            title="Delivery address"
                            description="Choose or update the address where your order will be delivered."
                        />

                        {savedAddress ? (
                            <SavedAddress
                                address={savedAddress}
                                onEdit={handleOpenAddressModal}
                            />
                        ) : (
                            <button
                                type="button"
                                onClick={handleOpenAddressModal}
                                className="flex w-full items-center gap-4 border border-dashed border-border bg-background p-5 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <MapPin className="size-5" />
                                </div>

                                <div>
                                    <p className="font-semibold">
                                        Add delivery address
                                    </p>

                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Enter the address where you want your
                                        cake delivered.
                                    </p>
                                </div>

                                <ChevronRight className="ml-auto size-5 text-muted-foreground" />
                            </button>
                        )}
                    </section>

                    <section className="border border-border bg-card p-5 md:p-6">
                        <SectionHeader
                            number="02"
                            icon={CreditCard}
                            title="Payment method"
                            description="Select one payment method to continue."
                        />

                        <div className="grid gap-3 md:grid-cols-2">
                            <PaymentCard
                                value="online"
                                selected={paymentMethod === "online"}
                                onSelect={setPaymentMethod}
                                icon={CreditCard}
                                title="Online payment"
                                description="Pay securely using MyFatoorah."
                            />

                            <PaymentCard
                                value="cash_on_delivery"
                                selected={paymentMethod === "cash_on_delivery"}
                                onSelect={setPaymentMethod}
                                icon={Wallet}
                                title="Cash on delivery"
                                description="Pay when your order arrives."
                            />
                        </div>

                        {!paymentMethod && (
                            <p className="mt-3 text-xs text-muted-foreground">
                                Please select a payment method before placing
                                your order.
                            </p>
                        )}
                    </section>

                    <section className="border border-border bg-card p-5 md:p-6">
                        <SectionHeader
                            number="03"
                            icon={ShoppingBag}
                            title="Order review"
                            description="Check your cakes and extras before placing the order."
                        />

                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">
                                Loading your selected items...
                            </p>
                        ) : hasError ? (
                            <p className="text-sm text-destructive">
                                Unable to load your selected items. Please go
                                back to your cart and try again.
                            </p>
                        ) : (
                            <>
                                <div className="space-y-3">
                                    {orderItems.map((item) => (
                                        <OrderItem
                                            key={item.id}
                                            imageUrl={item.imageUrl}
                                            name={
                                                item.name?.[language] ??
                                                item.name?.en
                                            }
                                            quantity={item.quantity}
                                            price={item.discountedPrice}
                                            originalPrice={item.price}
                                        />
                                    ))}
                                </div>

                                {orderAddOns.length > 0 && (
                                    <div className="mt-6 border-t border-border pt-5">
                                        <div className="mb-3 flex items-center justify-between">
                                            <h3 className="font-semibold">
                                                Add-ons
                                            </h3>

                                            <span className="text-xs text-muted-foreground">
                                                {orderAddOns.length} extras
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {orderAddOns.map((item) => (
                                                <OrderItem
                                                    key={item.id}
                                                    imageUrl={item.imageUrl}
                                                    name={
                                                        item.name?.[language] ??
                                                        item.name?.en
                                                    }
                                                    quantity={item.quantity}
                                                    price={item.price}
                                                    compact
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </section>
                </div>

                <aside className="xl:sticky xl:top-24">
                    <div className="overflow-hidden border border-border bg-card">
                        <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4 md:px-6">
                            <h2 className="text-lg font-black tracking-tight">
                                Order summary
                            </h2>

                            {itemsCount > 0 && (
                                <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                                    {itemsCount}{" "}
                                    {itemsCount === 1 ? "item" : "items"}
                                </span>
                            )}
                        </div>

                        <div className="p-5 md:p-6">
                            {itemsCount === 0 ? (
                                <div className="py-6 text-center">
                                    <ShoppingBag className="mx-auto size-8 text-muted-foreground" />

                                    <p className="mt-3 text-sm font-semibold">
                                        No items to show yet
                                    </p>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Your price breakdown will appear here.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 pe-1">
                                        {orderItems.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                                    Cakes
                                                </p>

                                                <div className="space-y-2">
                                                    {orderItems.map((item) => (
                                                        <SummaryItem
                                                            key={item.id}
                                                            image={
                                                                item.imageUrl
                                                            }
                                                            name={
                                                                item.name?.[
                                                                    language
                                                                ] ??
                                                                item.name?.en
                                                            }
                                                            quantity={
                                                                item.quantity
                                                            }
                                                            unitPrice={
                                                                item.discountedPrice
                                                            }
                                                            originalPrice={
                                                                item.price
                                                            }
                                                            lineTotal={
                                                                item.discountedPrice *
                                                                item.quantity
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {orderAddOns.length > 0 && (
                                            <div>
                                                <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                                    Add-ons
                                                </p>

                                                <div className="space-y-2">
                                                    {orderAddOns.map((item) => (
                                                        <SummaryItem
                                                            key={item.id}
                                                            image={
                                                                item.imageUrl
                                                            }
                                                            name={
                                                                item.name?.[
                                                                    language
                                                                ] ??
                                                                item.name?.en
                                                            }
                                                            quantity={
                                                                item.quantity
                                                            }
                                                            unitPrice={
                                                                item.price
                                                            }
                                                            lineTotal={
                                                                item.price *
                                                                item.quantity
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="my-5 border-t border-dashed border-border" />

                                    <div className="space-y-3 text-sm">
                                        {orderItems.length > 0 && (
                                            <SummaryRow
                                                label="Cakes"
                                                hint={`${cakesCount} pcs`}
                                                value={cakesTotal}
                                            />
                                        )}

                                        {orderAddOns.length > 0 && (
                                            <SummaryRow
                                                label="Add-ons"
                                                hint={`${addOnsCount} pcs`}
                                                value={addOnsTotal}
                                            />
                                        )}

                                        <SummaryRow
                                            label="Delivery"
                                            value={deliveryFee}
                                            free={deliveryFee === 0}
                                        />
                                    </div>

                                    {discount > 0 && (
                                        <div className="mt-4 flex items-center justify-between gap-3 border border-primary/20 bg-primary/10 px-3 py-2.5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                                <Sparkles className="size-4" />
                                                Total savings
                                            </div>

                                            <span className="text-sm font-black text-primary">
                                                {formatPrice(discount)}
                                            </span>
                                        </div>
                                    )}

                                    {deliveryFee === 0 && (
                                        <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                                            <Check className="size-3.5" />
                                            You've unlocked free delivery.
                                        </p>
                                    )}
                                </>
                            )}

                            <div className="my-5 border-t border-border" />

                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <p className="text-sm font-bold">Total</p>

                                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                                        Including delivery
                                    </p>
                                </div>

                                <span className="text-2xl font-black tracking-tight text-primary">
                                    {formatPrice(totalPrice)}
                                </span>
                            </div>

                            <Button
                                variant="asymmetric"
                                size="lg"
                                className="mt-6 h-11 w-full text-sm"
                                disabled={
                                    !savedAddress ||
                                    !paymentMethod ||
                                    !isCheckoutReady ||
                                    isProcessingOrder
                                }
                                onClick={handlePlaceOrder}
                            >
                                {isCreatingOrder
                                    ? "Creating order..."
                                    : isCreatingPayment
                                      ? "Redirecting to payment..."
                                      : paymentMethod === "online"
                                        ? "Continue to payment"
                                        : "Place order"}

                                {!isProcessingOrder && (
                                    <ChevronRight className="size-4" />
                                )}
                            </Button>

                            <p className="mt-3 text-center text-xs leading-relaxed text-muted-foreground">
                                By placing your order, you agree to our terms
                                and delivery policy.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            <AddressModal
                open={isAddressModalOpen}
                onOpenChange={setIsAddressModalOpen}
                address={address}
                onChange={updateAddress}
                onSave={handleSaveAddress}
                governorates={governorates}
                hasSavedAddress={Boolean(savedAddress)}
            />
        </main>
    );
};

const SectionHeader = ({ number, icon: Icon, title, description }) => {
    return (
        <div className="mb-6 flex gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="size-4" />
            </div>

            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-primary">
                        {number}
                    </span>

                    <h2 className="text-lg font-bold">{title}</h2>
                </div>

                <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                </p>
            </div>
        </div>
    );
};

const SavedAddress = ({ address, onEdit }) => {
    return (
        <div className="border border-primary/20 bg-primary/5 p-4 md:p-5">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check className="size-3.5" />
                        </div>

                        <p className="text-sm font-semibold">
                            Saved delivery address
                        </p>
                    </div>

                    <div className="mt-4 space-y-1.5 text-sm">
                        <p className="font-semibold">{address.fullName}</p>

                        <p
                            dir="ltr"
                            className="text-left text-muted-foreground"
                        >
                            {formatKuwaitPhoneForDisplay(address.phone)}
                        </p>

                        <p className="leading-relaxed text-muted-foreground">
                            {address.area}, {address.block}, {address.street}
                        </p>

                        <p className="leading-relaxed text-muted-foreground">
                            Building {address.building}
                            {address.floor && `, Floor ${address.floor}`}
                            {address.apartmentNo &&
                                `, Apartment ${address.apartmentNo}`}
                            , {address.governorate}
                        </p>

                        {address.notes && (
                            <p className="pt-1 text-xs text-muted-foreground">
                                Note: {address.notes}
                            </p>
                        )}
                    </div>
                </div>

                <Button
                    variant="outline-asymmetric"
                    size="sm"
                    className="shrink-0 gap-2"
                    onClick={onEdit}
                >
                    <Pencil className="size-3.5" />
                    Edit address
                </Button>
            </div>
        </div>
    );
};

const AddressModal = ({
    open,
    onOpenChange,
    address,
    onChange,
    onSave,
    governorates,
    hasSavedAddress,
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] !max-w-3xl overflow-y-auto p-5 md:p-6">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-xl">
                        {hasSavedAddress
                            ? "Edit delivery address"
                            : "Add delivery address"}
                    </DialogTitle>

                    <DialogDescription>
                        {hasSavedAddress
                            ? "Update your saved address. The new address will replace the existing one."
                            : "Enter the address where you want your order delivered."}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <FormField label="Full name" required>
                            <Input
                                value={address.fullName || ""}
                                onChange={(event) =>
                                    onChange("fullName", event.target.value)
                                }
                                placeholder="Enter your full name"
                                maxLength={FIELD_LIMITS.fullName}
                            />
                        </FormField>

                        <FormField label="Phone number" required>
                            <div
                                dir="ltr"
                                className="flex items-stretch overflow-hidden border border-input bg-background focus-within:ring-1 focus-within:ring-ring"
                            >
                                <span className="flex items-center border-r border-input bg-muted px-3 text-sm font-medium text-muted-foreground">
                                    +965
                                </span>

                                <Input
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel-national"
                                    className="border-0 text-left shadow-none focus-visible:ring-0"
                                    value={address.phone || ""}
                                    onChange={(event) =>
                                        onChange(
                                            "phone",
                                            extractKuwaitLocalNumber(
                                                event.target.value,
                                            ),
                                        )
                                    }
                                    placeholder="9123 4567"
                                />
                            </div>
                        </FormField>

                        <FormField label="Governorate" required>
                            <Select
                                value={address.governorate || ""}
                                onValueChange={(value) =>
                                    onChange("governorate", value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select governorate" />
                                </SelectTrigger>

                                <SelectContent>
                                    {governorates.map((governorate) => (
                                        <SelectItem
                                            key={governorate}
                                            value={governorate}
                                        >
                                            {governorate}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </FormField>

                        <FormField label="Area" required>
                            <Input
                                value={address.area || ""}
                                onChange={(event) =>
                                    onChange("area", event.target.value)
                                }
                                placeholder="e.g. Salmiya"
                                maxLength={FIELD_LIMITS.area}
                            />
                        </FormField>

                        <FormField label="Block" required>
                            <Input
                                value={address.block || ""}
                                onChange={(event) =>
                                    onChange("block", event.target.value)
                                }
                                placeholder="Block number"
                                maxLength={FIELD_LIMITS.block}
                            />
                        </FormField>

                        <FormField label="Street" required>
                            <Input
                                value={address.street || ""}
                                onChange={(event) =>
                                    onChange("street", event.target.value)
                                }
                                placeholder="Street name"
                                maxLength={FIELD_LIMITS.street}
                            />
                        </FormField>

                        <FormField label="Building" required>
                            <Input
                                value={address.building || ""}
                                onChange={(event) =>
                                    onChange("building", event.target.value)
                                }
                                placeholder="Building number"
                                maxLength={FIELD_LIMITS.building}
                            />
                        </FormField>

                        <FormField label="Floor">
                            <Input
                                value={address.floor || ""}
                                onChange={(event) =>
                                    onChange("floor", event.target.value)
                                }
                                placeholder="Optional"
                                maxLength={FIELD_LIMITS.floor}
                            />
                        </FormField>

                        <FormField label="Apartment number">
                            <Input
                                value={address.apartmentNo || ""}
                                onChange={(event) =>
                                    onChange("apartmentNo", event.target.value)
                                }
                                placeholder="Optional"
                                maxLength={FIELD_LIMITS.apartmentNo}
                            />
                        </FormField>
                    </div>

                    <FormField label="Delivery notes">
                        <Textarea
                            value={address.notes || ""}
                            onChange={(event) =>
                                onChange("notes", event.target.value)
                            }
                            placeholder="Any instructions for the delivery driver?"
                            className="min-h-24 resize-none"
                            maxLength={FIELD_LIMITS.notes}
                        />
                    </FormField>

                    <div className="flex flex-col-reverse gap-2 pt-2 md:flex-row md:justify-end">
                        <Button
                            type="button"
                            variant="outline-asymmetric"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            variant="asymmetric"
                            onClick={onSave}
                        >
                            <Check className="size-4" />
                            Save address
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const FormField = ({ label, required, children }) => {
    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                {label}

                {required && <span className="ml-1 text-destructive">*</span>}
            </label>

            {children}
        </div>
    );
};

const PaymentCard = ({
    value,
    selected,
    onSelect,
    icon: Icon,
    title,
    description,
}) => {
    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={`relative flex min-h-28 w-full items-start gap-3 border p-4 text-left transition-colors ${
                selected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-background hover:border-primary/30 hover:bg-muted/40"
            }`}
        >
            <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                    selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                }`}
            >
                <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{title}</p>

                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description}
                </p>
            </div>

            <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border"
                }`}
            >
                {selected && <Check className="size-3" />}
            </div>
        </button>
    );
};

const OrderItem = ({
    imageUrl,
    name,
    quantity,
    price,
    originalPrice,
    compact = false,
}) => {
    const hasDiscount =
        originalPrice !== undefined && Number(originalPrice) > Number(price);

    return (
        <div className="flex items-center gap-3 border border-border bg-background p-3">
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt={name}
                    className={`shrink-0 object-cover ${
                        compact ? "size-12" : "size-16"
                    }`}
                />
            )}

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-muted-foreground">{quantity} ×</span>

                    <span className="font-medium">{formatPrice(price)}</span>

                    {hasDiscount && (
                        <span className="text-muted-foreground line-through">
                            {formatPrice(originalPrice)}
                        </span>
                    )}
                </div>
            </div>

            <p className="shrink-0 text-sm font-semibold">
                {formatPrice(price * quantity)}
            </p>
        </div>
    );
};

const SummaryItem = ({
    image,
    name,
    quantity,
    unitPrice,
    originalPrice,
    lineTotal,
}) => {
    const hasDiscount =
        originalPrice !== undefined &&
        Number(originalPrice) > Number(unitPrice);

    const discountPercentage = hasDiscount
        ? Math.round(
              ((Number(originalPrice) - Number(unitPrice)) /
                  Number(originalPrice)) *
                  100,
          )
        : 0;

    return (
        <div className="flex items-center gap-3 bg-secondary/35 p-2.5">
            {image && (
                <div className="size-12 shrink-0 overflow-hidden bg-secondary">
                    <img
                        src={image}
                        alt={name}
                        className="h-full w-full object-cover"
                    />
                </div>
            )}

            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <p className="line-clamp-1 text-sm font-semibold">{name}</p>

                    <span className="shrink-0 text-sm font-black">
                        {formatPrice(lineTotal)}
                    </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                        {formatPrice(unitPrice)} × {quantity}
                    </span>

                    {hasDiscount && (
                        <>
                            <span className="text-[10px] text-muted-foreground line-through">
                                {formatPrice(originalPrice)}
                            </span>

                            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                                -{discountPercentage}%
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const SummaryRow = ({ label, value, hint, free = false }) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
                {label}

                {hint && (
                    <span className="text-[11px] font-medium text-muted-foreground/70">
                        ({hint})
                    </span>
                )}
            </span>

            {free ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    Free
                </span>
            ) : (
                <span className="font-semibold">{formatPrice(value)}</span>
            )}
        </div>
    );
};

export default Checkout;
