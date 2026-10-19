import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import {
    ArrowRight,
    Check,
    ChevronRight,
    Loader2,
    Minus,
    Plus,
    ShoppingBag,
    Sparkles,
    Trash2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";
import usePatch from "@/hooks/usePatch";
import useDelete from "@/hooks/useDelete";
import { toast } from "sonner";

const formatPrice = (price) => `${Number(price).toFixed(3)} KWD`;

const Cart = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";
    const navigate = useNavigate();

    const {
        data: cartResponse,
        isLoading: isCartLoading,
        isError: isCartError,
        refetch: refetchCart,
    } = useGet({
        url: "/cart",
        queryKey: ["cart"],
        retry: false,
    });

    const {
        data: addOnsResponse,
        isLoading: isAddOnsLoading,
        isError: isAddOnsError,
        refetch: refetchAddOns,
    } = useGet({
        url: "/add-ons",
        queryKey: ["add-ons"],
        retry: false,
    });

    const cartData = cartResponse?.data;

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

    const cartAddOns = useMemo(() => {
        const apiAddOns = cartData?.addOns ?? [];

        return apiAddOns
            .filter((item) => item.addOn)
            .map((item) => ({
                id: item.addOn._id,
                quantity: item.quantity,
            }));
    }, [cartData]);

    const addOnCartMap = useMemo(() => {
        return new Map(cartAddOns.map((item) => [item.id, item.quantity]));
    }, [cartAddOns]);

    const selectedAddOnItems = useMemo(() => {
        return addOns
            .filter((addOn) => addOnCartMap.has(addOn.id))
            .map((addOn) => ({
                ...addOn,
                quantity: addOnCartMap.get(addOn.id),
            }));
    }, [addOns, addOnCartMap]);

    const cartItems = useMemo(() => {
        const apiItems = cartData?.items ?? [];

        return apiItems
            .map((item) => {
                const cake = item.cake;

                if (!cake) {
                    return null;
                }

                const price = Number(cake.price ?? 0);
                const discountPercentage = Number(cake.discountPercentage ?? 0);

                const discountedPrice = Number(
                    cake.discountedPrice ??
                        (price - (price * discountPercentage) / 100).toFixed(3),
                );

                const image =
                    typeof cake.images?.[0] === "string"
                        ? cake.images[0]
                        : cake.images?.[0]?.url;

                return {
                    id: cake._id,
                    name: cake.name,
                    image,
                    size: cake.size ?? {
                        en: "",
                        ar: "",
                    },
                    weightSize: cake.weightSize,
                    servings: cake.servings ?? "",
                    price,
                    discountPercentage,
                    discountedPrice,
                    quantity: item.quantity,
                    stock: cake.stock,
                    isActive: cake.isActive,
                    slug: cake.slug,
                };
            })
            .filter(Boolean);
    }, [cartData]);

    const [selectedItems, setSelectedItems] = useState(null);

    const selectedItemIds =
        selectedItems === null
            ? cartItems.map((item) => item.id)
            : selectedItems.filter((id) =>
                  cartItems.some((item) => item.id === id),
              );

    const selectedCartItems = cartItems.filter((item) =>
        selectedItemIds.includes(item.id),
    );

    const totalCakeItems = cartItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const totalAddOnItems = selectedAddOnItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const totalItems = totalCakeItems + totalAddOnItems;

    const selectedCakesCount = selectedCartItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const selectedAddOnsCount = selectedAddOnItems.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const selectedItemsCount = selectedCakesCount + selectedAddOnsCount;

    const cakesTotal = selectedCartItems.reduce(
        (total, item) => total + item.discountedPrice * item.quantity,
        0,
    );

    const cakesOriginalTotal = selectedCartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );

    const addOnsTotal = selectedAddOnItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0,
    );

    const subtotal = cakesTotal + addOnsTotal;

    const discount = Math.max(0, cakesOriginalTotal - cakesTotal);

    const deliveryFee = 0;
    const total = subtotal + deliveryFee;

    const toggleItem = (id) => {
        setSelectedItems((current) => {
            const selected = current ?? cartItems.map((item) => item.id);

            return selected.includes(id)
                ? selected.filter((itemId) => itemId !== id)
                : [...selected, id];
        });
    };

    const toggleAllItems = () => {
        setSelectedItems((current) => {
            const selected = current ?? cartItems.map((item) => item.id);

            if (selected.length === cartItems.length) {
                return [];
            }

            return cartItems.map((item) => item.id);
        });
    };

    const scrollToAddOns = () => {
        document.getElementById("cart-add-ons")?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    const proceedToCheckout = () => {
        if (selectedItemIds.length === 0) {
            return;
        }

        navigate("/checkout", {
            state: {
                cakeIds: selectedItemIds,
            },
        });
    };

    if (isCartLoading || isAddOnsLoading) {
        return (
            <main className="bg-background pb-16 md:pb-0">
                <section className="pt-24 md:pt-28">
                    <div className="wrapper">
                        <div className="flex min-h-[400px] items-center justify-center">
                            <ShoppingBag className="size-8 animate-pulse text-primary" />
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    if (isCartError || isAddOnsError) {
        return (
            <main className="bg-background pb-16 md:pb-0">
                <section className="pt-24 md:pt-28">
                    <div className="wrapper">
                        <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
                            <ShoppingBag className="size-10 text-destructive" />

                            <h2 className="mt-4 text-lg font-black">
                                {isArabic
                                    ? "تعذر تحميل السلة"
                                    : "Unable to load your cart"}
                            </h2>

                            <Button
                                type="button"
                                variant="asymmetric"
                                className="mt-5"
                                onClick={() => {
                                    if (isCartError) {
                                        refetchCart();
                                    }

                                    if (isAddOnsError) {
                                        refetchAddOns();
                                    }
                                }}
                            >
                                {isArabic ? "حاول مرة أخرى" : "Try again"}
                            </Button>
                        </div>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="bg-background pb-16 md:pb-0">
            <section className="pt-24 md:pt-28">
                <div className="wrapper">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                    <ShoppingBag className="size-4" />
                                    {isArabic ? "سلة التسوق" : "Shopping cart"}
                                </div>

                                <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">
                                    {isArabic ? "سلتك" : "Your cart"}
                                </h1>
                            </div>

                            <span className="pb-1 text-sm font-semibold text-muted-foreground">
                                {totalItems}{" "}
                                {isArabic
                                    ? "منتج"
                                    : totalItems === 1
                                      ? "item"
                                      : "items"}
                            </span>
                        </div>

                        <div className="flex flex-col gap-4 rounded-none rounded-tl-2xl rounded-br-2xl border border-primary/20 bg-secondary/40 p-4 md:flex-row md:items-center md:justify-between md:p-5">
                            <div className="flex items-start gap-3">
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                    <Sparkles className="size-4" />
                                </div>

                                <div>
                                    <h2 className="text-sm font-black md:text-base">
                                        {isArabic
                                            ? "اجعل احتفالك أكثر تميزًا"
                                            : "Make your celebration extra special"}
                                    </h2>

                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        {isArabic
                                            ? "أضف شموعًا أو زهورًا أو بطاقة تهنئة مع كعكتك."
                                            : "Add candles, flowers, a greeting card, or a little extra with your cake."}
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="asymmetric"
                                size="lg"
                                className="shrink-0 gap-2 px-5 text-xs font-bold md:text-sm"
                                onClick={scrollToAddOns}
                            >
                                {isArabic
                                    ? "اكتشف الإضافات"
                                    : "Explore add-ons"}

                                <ArrowRight className="size-4 rtl:rotate-180" />
                            </Button>
                        </div>

                        <p className="text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "راجع طلبك وأضف لمساتك الخاصة قبل المتابعة."
                                : "Review your order and add something special before checkout."}
                        </p>
                    </div>
                </div>
            </section>

            <section className="py-8 md:py-10">
                <div className="wrapper">
                    <div className="flex flex-col gap-8 xl:flex-row xl:items-start">
                        <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={
                                            cartItems.length > 0 &&
                                            selectedItemIds.length ===
                                                cartItems.length
                                        }
                                        onCheckedChange={toggleAllItems}
                                    />

                                    <label
                                        htmlFor="select-all"
                                        className="cursor-pointer text-sm font-semibold"
                                    >
                                        {isArabic ? "تحديد الكل" : "Select all"}
                                    </label>
                                </div>

                                <span className="text-sm font-semibold text-muted-foreground">
                                    {selectedItemsCount}{" "}
                                    {isArabic ? "محدد" : "selected"}
                                </span>
                            </div>

                            <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card p-1 md:p-2">
                                <div className="space-y-2 md:space-y-3">
                                    {cartItems.map((item) => (
                                        <CartItem
                                            key={item.id}
                                            item={item}
                                            language={language}
                                            selected={selectedItemIds.includes(
                                                item.id,
                                            )}
                                            onToggle={() => toggleItem(item.id)}
                                            onUpdated={refetchCart}
                                        />
                                    ))}
                                </div>

                                {cartItems.length === 0 && (
                                    <div className="p-10 text-center">
                                        <ShoppingBag className="mx-auto size-10 text-muted-foreground" />

                                        <h2 className="mt-4 text-lg font-black">
                                            {isArabic
                                                ? "سلة التسوق فارغة"
                                                : "Your cart is empty"}
                                        </h2>

                                        <p className="mt-2 text-sm text-muted-foreground">
                                            {isArabic
                                                ? "أضف كعكة للبدء."
                                                : "Add a cake to get started."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div
                                id="cart-add-ons"
                                className="mt-10 scroll-mt-24"
                            >
                                <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-primary/20 bg-secondary/35 p-4 md:p-6">
                                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                        <div className="max-w-xl">
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

                                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                                {isArabic
                                                    ? "أضف شموعًا أو بطاقة تهنئة أو زهورًا جميلة مع طلبك."
                                                    : "Add candles, a greeting card, flowers, or another little extra to make your celebration memorable."}
                                            </p>
                                        </div>

                                        <Dialog>
                                            <DialogTrigger
                                                render={
                                                    <Button
                                                        variant="asymmetric"
                                                        size="lg"
                                                        className="shrink-0 gap-2 px-5 text-xs font-bold md:text-sm"
                                                    />
                                                }
                                            >
                                                <Sparkles className="size-4" />

                                                {isArabic
                                                    ? "عرض جميع الإضافات"
                                                    : `See all ${addOns.length} add-ons`}

                                                <ChevronRight className="size-4 rtl:rotate-180" />
                                            </DialogTrigger>

                                            <DialogContent className="w-[calc(100%-2rem)] !max-w-[70vw] max-h-[90vh] overflow-y-auto p-5 md:p-6">
                                                <DialogHeader className="mb-2">
                                                    <DialogTitle className="text-xl font-black md:text-2xl">
                                                        {isArabic
                                                            ? "اجعل طلبك مميزًا"
                                                            : "Make your order special"}
                                                    </DialogTitle>
                                                </DialogHeader>

                                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                    {addOns.map((addOn) => (
                                                        <AddOnCard
                                                            key={addOn.id}
                                                            addOn={addOn}
                                                            language={language}
                                                            selected={addOnCartMap.has(
                                                                addOn.id,
                                                            )}
                                                            quantity={
                                                                addOnCartMap.get(
                                                                    addOn.id,
                                                                ) ?? 0
                                                            }
                                                            onUpdated={
                                                                refetchCart
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>

                                    <div className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
                                        {addOns.slice(0, 6).map((addOn) => (
                                            <FeaturedAddOn
                                                key={addOn.id}
                                                addOn={addOn}
                                                language={language}
                                                selected={addOnCartMap.has(
                                                    addOn.id,
                                                )}
                                                quantity={
                                                    addOnCartMap.get(
                                                        addOn.id,
                                                    ) ?? 0
                                                }
                                                onUpdated={refetchCart}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <aside className="w-full xl:w-[360px]">
                            <div className="overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card xl:sticky xl:top-24">
                                <div className="flex items-center justify-between gap-3 border-b border-border bg-secondary/40 px-5 py-4 md:px-6">
                                    <h2 className="text-lg font-black tracking-tight">
                                        {isArabic
                                            ? "ملخص الطلب"
                                            : "Order summary"}
                                    </h2>

                                    {selectedItemsCount > 0 && (
                                        <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground">
                                            {selectedItemsCount}{" "}
                                            {isArabic
                                                ? "عنصر"
                                                : selectedItemsCount === 1
                                                  ? "item"
                                                  : "items"}
                                        </span>
                                    )}
                                </div>

                                <div className="p-5 md:p-6">
                                    {selectedItemsCount === 0 ? (
                                        <div className="py-6 text-center">
                                            <ShoppingBag className="mx-auto size-8 text-muted-foreground" />

                                            <p className="mt-3 text-sm font-semibold">
                                                {isArabic
                                                    ? "لم تحدد أي عنصر بعد"
                                                    : "No items selected yet"}
                                            </p>

                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {isArabic
                                                    ? "حدد عنصرًا لرؤية الأسعار."
                                                    : "Select an item to see your price breakdown."}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-4 pe-1">
                                                {selectedCartItems.length >
                                                    0 && (
                                                    <div>
                                                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                                            {isArabic
                                                                ? "الكعكات"
                                                                : "Cakes"}
                                                        </p>

                                                        <div className="space-y-2">
                                                            {selectedCartItems.map(
                                                                (item) => (
                                                                    <SummaryItem
                                                                        key={
                                                                            item.id
                                                                        }
                                                                        image={
                                                                            item.image
                                                                        }
                                                                        name={
                                                                            item
                                                                                .name[
                                                                                language
                                                                            ]
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
                                                                        discountPercentage={
                                                                            item.discountPercentage
                                                                        }
                                                                        lineTotal={
                                                                            item.discountedPrice *
                                                                            item.quantity
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedAddOnItems.length >
                                                    0 && (
                                                    <div>
                                                        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                                                            {isArabic
                                                                ? "الإضافات"
                                                                : "Add-ons"}
                                                        </p>

                                                        <div className="space-y-2">
                                                            {selectedAddOnItems.map(
                                                                (addOn) => (
                                                                    <SummaryItem
                                                                        key={
                                                                            addOn.id
                                                                        }
                                                                        image={
                                                                            addOn.image
                                                                        }
                                                                        name={
                                                                            addOn
                                                                                .name[
                                                                                language
                                                                            ]
                                                                        }
                                                                        quantity={
                                                                            addOn.quantity
                                                                        }
                                                                        unitPrice={
                                                                            addOn.price
                                                                        }
                                                                        lineTotal={
                                                                            addOn.price *
                                                                            addOn.quantity
                                                                        }
                                                                    />
                                                                ),
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="my-5 border-t border-dashed border-border" />

                                            <div className="space-y-3 text-sm">
                                                {selectedCartItems.length >
                                                    0 && (
                                                    <SummaryRow
                                                        label={
                                                            isArabic
                                                                ? "الكعكات"
                                                                : "Cakes"
                                                        }
                                                        hint={`${selectedCakesCount} ${
                                                            isArabic
                                                                ? "قطعة"
                                                                : "pcs"
                                                        }`}
                                                        value={cakesTotal}
                                                    />
                                                )}

                                                {selectedAddOnItems.length >
                                                    0 && (
                                                    <SummaryRow
                                                        label={
                                                            isArabic
                                                                ? "الإضافات"
                                                                : "Add-ons"
                                                        }
                                                        hint={`${selectedAddOnsCount} ${
                                                            isArabic
                                                                ? "قطعة"
                                                                : "pcs"
                                                        }`}
                                                        value={addOnsTotal}
                                                    />
                                                )}

                                                <SummaryRow
                                                    label={
                                                        isArabic
                                                            ? "التوصيل"
                                                            : "Delivery"
                                                    }
                                                    value={deliveryFee}
                                                    free={deliveryFee === 0}
                                                    isArabic={isArabic}
                                                />
                                            </div>

                                            {discount > 0 && (
                                                <div className="mt-4 flex items-center justify-between gap-3 rounded-none rounded-tl-xl rounded-br-xl border border-primary/20 bg-primary/10 px-3 py-2.5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-primary">
                                                        <Sparkles className="size-4" />

                                                        {isArabic
                                                            ? "إجمالي ما وفرته"
                                                            : "Total savings"}
                                                    </div>

                                                    <span
                                                        dir="ltr"
                                                        className="text-sm font-black text-primary"
                                                    >
                                                        {formatPrice(discount)}
                                                    </span>
                                                </div>
                                            )}

                                            {deliveryFee === 0 && (
                                                <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary">
                                                    <Check className="size-3.5" />

                                                    {isArabic
                                                        ? "لقد حصلت على توصيل مجاني."
                                                        : "You've unlocked free delivery."}
                                                </p>
                                            )}
                                        </>
                                    )}

                                    <div className="my-5 border-t border-border" />

                                    <div className="flex items-end justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold">
                                                {isArabic
                                                    ? "الإجمالي"
                                                    : "Total"}
                                            </p>

                                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                                                {isArabic
                                                    ? "شامل التوصيل"
                                                    : "Including delivery"}
                                            </p>
                                        </div>

                                        <span
                                            dir="ltr"
                                            className="text-2xl font-black tracking-tight text-primary"
                                        >
                                            {formatPrice(total)}
                                        </span>
                                    </div>

                                    <Button
                                        type="button"
                                        variant="asymmetric"
                                        size="lg"
                                        disabled={selectedItemIds.length === 0}
                                        className="mt-5 h-12 w-full gap-2 text-sm font-bold"
                                        onClick={proceedToCheckout}
                                    >
                                        {isArabic
                                            ? "متابعة الدفع"
                                            : "Proceed to checkout"}

                                        <ArrowRight className="size-4 rtl:rotate-180" />
                                    </Button>

                                    {selectedItemIds.length === 0 && (
                                        <p className="mt-3 text-center text-xs text-destructive">
                                            {isArabic
                                                ? "حدد عنصرًا واحدًا على الأقل للمتابعة."
                                                : "Select at least one item to continue."}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </main>
    );
};

const CartItem = ({ item, language, selected, onToggle, onUpdated }) => {
    const isArabic = language === "ar";

    const { mutate: updateCartItem, isPending: isUpdating } = usePatch({
        url: `/cart/items/${item.id}`,
    });

    const { mutate: deleteCartItem, isPending: isRemoving } = useDelete({
        url: `/cart/items/${item.id}`,
    });

    const handleQuantityChange = (quantity) => {
        const maxQuantity = Math.min(50, Number(item.stock ?? 50));

        if (quantity < 1 || quantity > maxQuantity) {
            return;
        }

        updateCartItem(
            { quantity },
            {
                onSuccess: async () => {
                    await onUpdated();
                },
                onError: (error) => {
                    toast.error(
                        error?.response?.data?.message ||
                            (isArabic
                                ? "تعذر تحديث كمية الكعكة"
                                : "Unable to update cart item"),
                    );
                },
            },
        );
    };

    const handleRemove = () => {
        if (isUpdating || isRemoving) {
            return;
        }

        deleteCartItem(undefined, {
            onSuccess: async () => {
                toast.success(
                    isArabic
                        ? "تمت إزالة الكعكة من السلة"
                        : "Cake removed from cart",
                );

                await onUpdated();
            },
            onError: (error) => {
                toast.error(
                    error?.response?.data?.message ||
                        (isArabic
                            ? "تعذر إزالة الكعكة من السلة"
                            : "Unable to remove cart item"),
                );
            },
        });
    };

    const maxQuantity = Math.min(50, Number(item.stock ?? 50));

    const lineTotal = item.discountedPrice * item.quantity;

    const savingsPerItem = Math.max(0, item.price - item.discountedPrice);

    const totalSavings = savingsPerItem * item.quantity;

    const hasDiscount = item.discountPercentage > 0 && savingsPerItem > 0;

    return (
        <div
            className={`rounded-none rounded-tl-2xl rounded-br-2xl border p-3 shadow-sm transition-all sm:p-4 md:p-5 ${
                selected
                    ? "border-border bg-background"
                    : "border-border/60 bg-muted/30 opacity-65"
            }`}
        >
            <div className="flex gap-2.5 sm:gap-3 md:gap-4">
                <div className="flex shrink-0 items-start pt-1">
                    <Checkbox
                        checked={selected}
                        disabled={isUpdating || isRemoving}
                        onCheckedChange={onToggle}
                    />
                </div>

                <div className="size-16 shrink-0 overflow-hidden rounded-none rounded-tl-xl rounded-br-xl bg-secondary sm:size-20 md:size-28">
                    <img
                        src={item.image}
                        alt={item.name?.[language] || ""}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2 sm:gap-3">
                        <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-primary sm:text-[10px]">
                                {item.weightSize}
                            </p>

                            <h2 className="mt-1 line-clamp-2 text-xs font-bold leading-4 sm:text-sm sm:leading-5 md:text-lg md:leading-6">
                                {item.name?.[language]}
                            </h2>

                            <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">
                                {isArabic
                                    ? `${item.servings} حصص`
                                    : `${item.servings} servings`}
                            </p>
                        </div>

                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating || isRemoving}
                            onClick={handleRemove}
                            className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                        >
                            {isRemoving ? (
                                <Loader2 className="size-3.5 animate-spin sm:size-4" />
                            ) : (
                                <Trash2 className="size-3.5 sm:size-4" />
                            )}
                        </Button>
                    </div>

                    <div className="mt-2.5 flex flex-col gap-2.5 sm:mt-3 sm:gap-3 md:flex-row md:items-end md:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                <span
                                    dir="ltr"
                                    className="text-xs font-bold text-primary sm:text-sm"
                                >
                                    {formatPrice(item.discountedPrice)}
                                </span>

                                {hasDiscount && (
                                    <>
                                        <span
                                            dir="ltr"
                                            className="text-[10px] text-muted-foreground line-through sm:text-xs"
                                        >
                                            {formatPrice(item.price)}
                                        </span>

                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary sm:text-[10px]">
                                            -{item.discountPercentage}%
                                        </span>
                                    </>
                                )}

                                <span className="text-[10px] font-semibold text-muted-foreground">
                                    × {item.quantity}
                                </span>
                            </div>

                            <div className="mt-1 flex items-baseline gap-1.5 sm:gap-2">
                                <span className="text-[10px] text-muted-foreground sm:text-[11px]">
                                    {isArabic ? "إجمالي المنتج" : "Item total"}
                                </span>

                                <span
                                    dir="ltr"
                                    className="text-sm font-black sm:text-base"
                                >
                                    {formatPrice(lineTotal)}
                                </span>
                            </div>

                            {hasDiscount && totalSavings > 0 && (
                                <p className="mt-1 text-[10px] font-semibold text-primary sm:text-[11px]">
                                    {isArabic
                                        ? `وفرت ${formatPrice(totalSavings)}`
                                        : `You save ${formatPrice(totalSavings)}`}
                                </p>
                            )}
                        </div>

                        {isUpdating ? (
                            <div className="flex h-9 w-[104px] shrink-0 items-center justify-center rounded-none rounded-tl-lg rounded-br-lg border border-border bg-background">
                                <Loader2 className="size-4 animate-spin text-primary" />
                            </div>
                        ) : (
                            <QuantityControl
                                quantity={item.quantity}
                                maximumQuantity={maxQuantity}
                                onIncrease={() =>
                                    handleQuantityChange(item.quantity + 1)
                                }
                                onDecrease={() =>
                                    handleQuantityChange(item.quantity - 1)
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeaturedAddOn = ({ addOn, language, selected, quantity, onUpdated }) => {
    const isArabic = language === "ar";

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

const AddOnCard = ({ addOn, language, selected, quantity, onUpdated }) => {
    const isArabic = language === "ar";

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
            className={`min-w-0 rounded-none rounded-tl-2xl rounded-br-2xl border p-3 transition-all ${
                selected
                    ? "border-primary/50 bg-primary/[0.04]"
                    : "border-border bg-card"
            }`}
        >
            <div className="flex gap-3">
                <div className="size-16 shrink-0 overflow-hidden rounded-none rounded-tl-xl rounded-br-xl bg-secondary">
                    <img
                        src={addOn.image}
                        alt={addOn.name[language]}
                        className="h-full w-full object-cover"
                    />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="text-sm font-bold">
                                {addOn.name[language]}
                            </h3>
                        </div>

                        <SelectionIndicator selected={selected} />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                        <span
                            dir="ltr"
                            className="text-xs font-bold text-primary"
                        >
                            +{formatPrice(addOn.price)}
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
        </div>
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

const SummaryItem = ({
    image,
    name,
    quantity,
    unitPrice,
    originalPrice,
    discountPercentage,
    lineTotal,
}) => {
    const hasDiscount =
        Number(discountPercentage ?? 0) > 0 &&
        Number(originalPrice ?? 0) > Number(unitPrice ?? 0);

    return (
        <div className="flex items-center gap-3 rounded-none rounded-tl-xl rounded-br-xl bg-secondary/35 p-2.5">
            {image && (
                <div className="size-12 shrink-0 overflow-hidden rounded-none rounded-tl-lg rounded-br-lg bg-secondary">
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

                    <span dir="ltr" className="shrink-0 text-sm font-black">
                        {formatPrice(lineTotal)}
                    </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span
                        dir="ltr"
                        className="text-[11px] font-semibold text-muted-foreground"
                    >
                        {formatPrice(unitPrice)} × {quantity}
                    </span>

                    {hasDiscount && (
                        <>
                            <span
                                dir="ltr"
                                className="text-[10px] text-muted-foreground line-through"
                            >
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

const SummaryRow = ({
    label,
    value,
    hint,
    free = false,
    discount = false,
    isArabic = false,
}) => {
    return (
        <div className="flex items-center justify-between gap-4">
            <span
                className={`flex items-center gap-1.5 ${
                    discount
                        ? "font-semibold text-primary"
                        : "text-muted-foreground"
                }`}
            >
                {label}

                {hint && (
                    <span className="text-[11px] font-medium text-muted-foreground/70">
                        ({hint})
                    </span>
                )}
            </span>

            {free ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                    {isArabic ? "مجاني" : "Free"}
                </span>
            ) : (
                <span
                    dir="ltr"
                    className={
                        discount
                            ? "font-semibold text-primary"
                            : "font-semibold"
                    }
                >
                    {discount ? `- ${formatPrice(value)}` : formatPrice(value)}
                </span>
            )}
        </div>
    );
};

export default Cart;
