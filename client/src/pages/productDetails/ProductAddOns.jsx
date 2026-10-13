import { useMemo } from "react";
import { useNavigate } from "react-router";
import { Check, Loader2, Minus, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import useAuth from "@/hooks/useAuth";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import usePatch from "@/hooks/usePatch";
import useDelete from "@/hooks/useDelete";

const formatPrice = (price) => `${Number(price).toFixed(3)} KWD`;

const ProductAddOns = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";
    const { isAuthenticated, user } = useAuth();

    const isCustomer = isAuthenticated && user?.role === "user";

    const { data: addOnsResponse, isLoading, isError } = useGet({
        url: "/add-ons",
        queryKey: ["add-ons"],
        retry: false,
    });

    const { data: cartResponse, refetch: refetchCart } = useGet({
        url: "/cart",
        queryKey: ["cart"],
        enabled: isCustomer,
        retry: false,
    });

    const addOns = useMemo(() => {
        const apiAddOns = addOnsResponse?.data ?? [];

        return apiAddOns
            .filter((addOn) => addOn.isActive)
            .map((addOn) => ({
                id: addOn._id,
                name: addOn.name,
                image: addOn.imageUrl,
                price: Number(addOn.price ?? 0),
            }));
    }, [addOnsResponse]);

    const addOnCartMap = useMemo(() => {
        const apiAddOns = cartResponse?.data?.addOns ?? [];

        return new Map(
            apiAddOns
                .filter((item) => item.addOn)
                .map((item) => [item.addOn._id, item.quantity]),
        );
    }, [cartResponse]);

    const handleUpdated = async () => {
        await refetchCart();
    };

    if (isLoading || isError || addOns.length === 0) {
        return null;
    }

    return (
        <section className="border-t border-border py-10 md:py-14">
            <div className="wrapper">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-primary">
                            <Sparkles className="size-4" />

                            <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                                {isArabic
                                    ? "أكمل احتفالك"
                                    : "Complete the celebration"}
                            </span>
                        </div>

                        <h2 className="mt-2 text-xl font-black tracking-tight md:text-2xl">
                            {isArabic
                                ? "اجعل كعكتك أكثر تميزًا"
                                : "Make your cake extra special"}
                        </h2>
                    </div>

                    <p className="max-w-xl text-sm leading-6 text-muted-foreground md:text-right">
                        {isArabic
                            ? "أضف شموعًا أو بطاقة تهنئة أو زهورًا جميلة مع كعكتك."
                            : "Add candles, a greeting card, flowers, or another little extra to make your cake special."}
                    </p>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {addOns.map((addOn) => (
                        <FeaturedAddOn
                            key={addOn.id}
                            addOn={addOn}
                            language={language}
                            selected={addOnCartMap.has(addOn.id)}
                            quantity={addOnCartMap.get(addOn.id) ?? 0}
                            onUpdated={handleUpdated}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

const SelectionIndicator = ({ selected }) => {
    return (
        <div
            aria-hidden="true"
            className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:size-7 ${
                selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/35 bg-background"
            }`}
        >
            {selected && <Check className="size-3 sm:size-3.5" />}
        </div>
    );
};

const QuantityControl = ({
    quantity,
    maximumQuantity = 50,
    onIncrease,
    onDecrease,
    disabled = false,
    compact = false,
    allowZero = false,
}) => {
    const minimumQuantity = allowZero ? 0 : 1;

    return (
        <div
            className={`flex w-fit shrink-0 items-center rounded-none rounded-tl-lg rounded-br-lg border border-border bg-background ${
                compact ? "h-8" : "h-9"
            } ${disabled ? "opacity-50" : ""}`}
        >
            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={
                    disabled ||
                    quantity <= minimumQuantity ||
                    maximumQuantity < 1
                }
                onClick={onDecrease}
                className={`${compact ? "size-7" : "size-8"} rounded-none`}
            >
                <Minus className="size-3" />
            </Button>

            <span
                dir="ltr"
                className={`text-center font-bold ${
                    compact ? "w-6 text-xs" : "w-8 text-sm"
                }`}
            >
                {quantity}
            </span>

            <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled || quantity >= maximumQuantity}
                onClick={onIncrease}
                className={`${compact ? "size-7" : "size-8"} rounded-none`}
            >
                <Plus className="size-3" />
            </Button>
        </div>
    );
};

const FeaturedAddOn = ({ addOn, language, selected, quantity, onUpdated }) => {
    const isArabic = language === "ar";
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const { mutate: addCartAddOn, isPending: isAdding } = usePost({
        url: "/cart/add-ons",
    });

    const { mutate: updateCartAddOn, isPending: isUpdating } = usePatch({
        url: `/cart/add-ons/${addOn.id}`,
    });

    const { mutate: removeCartAddOn, isPending: isRemoving } = useDelete({
        url: `/cart/add-ons/${addOn.id}`,
    });

    const isPending = isAdding || isUpdating || isRemoving;

    const handleAdd = () => {
        if (isPending || selected) {
            return;
        }

        if (!isAuthenticated) {
            toast.error(
                isArabic
                    ? "يرجى تسجيل الدخول لإضافة الإضافات إلى السلة"
                    : "Please log in to add add-ons to your cart",
            );

            navigate("/auth/login");
            return;
        }

        if (user?.role !== "user") {
            toast.error(
                isArabic
                    ? "التسوق متاح لحسابات العملاء فقط"
                    : "Shopping is available for customer accounts only",
            );

            return;
        }

        addCartAddOn(
            {
                addOnId: addOn.id,
                quantity: 1,
            },
            {
                onSuccess: async () => {
                    toast.success(
                        isArabic
                            ? "تمت إضافة الإضافة إلى السلة"
                            : "Add-on added to cart",
                    );

                    await onUpdated();
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                            (isArabic
                                ? "تعذر إضافة الإضافة"
                                : "Unable to add add-on"),
                    );
                },
            },
        );
    };

    const handleIncrease = () => {
        if (isPending) {
            return;
        }

        if (!selected) {
            handleAdd();
            return;
        }

        if (quantity >= 50) {
            return;
        }

        updateCartAddOn(
            {
                quantity: quantity + 1,
            },
            {
                onSuccess: async () => {
                    await onUpdated();
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                            (isArabic
                                ? "تعذر تحديث كمية الإضافة"
                                : "Unable to update add-on quantity"),
                    );
                },
            },
        );
    };

    const handleDecrease = () => {
        if (isPending || !selected) {
            return;
        }

        if (quantity > 1) {
            updateCartAddOn(
                {
                    quantity: quantity - 1,
                },
                {
                    onSuccess: async () => {
                        await onUpdated();
                    },
                    onError: (error) => {
                        toast.error(
                            error?.response?.data?.message ||
                                (isArabic
                                    ? "تعذر تحديث كمية الإضافة"
                                    : "Unable to update add-on quantity"),
                        );
                    },
                },
            );

            return;
        }

        removeCartAddOn(undefined, {
            onSuccess: async () => {
                toast.success(
                    isArabic ? "تمت إزالة الإضافة" : "Add-on removed",
                );

                await onUpdated();
            },
            onError: (error) => {
                toast.error(
                    error?.response?.data?.message ||
                        (isArabic
                            ? "تعذر إزالة الإضافة"
                            : "Unable to remove add-on"),
                );
            },
        });
    };


    return (
        <div
            className={`min-w-0 overflow-hidden rounded-none rounded-tl-2xl rounded-br-2xl border transition-all ${
                selected
                    ? "border-primary/60 bg-primary/[0.05]"
                    : "border-border bg-card"
            }`}
        >
            <div className="relative aspect-[1.45] overflow-hidden bg-secondary">
                <img
                    src={addOn.image}
                    alt={addOn.name[language]}
                    className="h-full w-full object-cover"
                />

                <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
                    <SelectionIndicator selected={selected} />
                </div>
            </div>

            <div className="p-2.5 sm:p-3 md:p-4">
                <div className="min-w-0">
                    <h3 className="truncate text-xs font-bold sm:text-sm md:text-base">
                        {addOn.name[language]}
                    </h3>

                    <p
                        dir="ltr"
                        className="mt-1 text-xs font-bold text-primary sm:text-sm"
                    >
                        +{formatPrice(addOn.price)}
                    </p>
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-border/70 pt-3 sm:mt-4 sm:gap-2.5">
                    <span className="text-[10px] font-semibold text-muted-foreground sm:text-xs">
                        {isArabic ? "الكمية" : "Quantity"}
                    </span>

                    {isPending ? (
                        <div className="flex h-8 w-[92px] items-center justify-center rounded-none rounded-tl-lg rounded-br-lg border border-border bg-background">
                            <Loader2 className="size-3.5 animate-spin text-primary" />
                        </div>
                    ) : (
                        <QuantityControl
                            quantity={selected ? quantity : 0}
                            onIncrease={handleIncrease}
                            onDecrease={handleDecrease}
                            maximumQuantity={50}
                            allowZero
                            compact
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductAddOns;

