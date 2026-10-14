import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import ViewAllButton from "@/components/shared/button/SecondaryButton";
import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import useAddToCart from "@/hooks/useAddToCart";

const HotDeals = ({ eyebrow, title, subtitle } = {}) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    /*
     * Fetch the top 8 active cakes with the highest discount
     * directly from the database via the public cakes endpoint.
     */
    const {
        data: cakesResponse,
        isLoading,
        isError,
    } = useGet({
        url: "/cakes",
        params: { sort: "discount", limit: 8 },
        queryKey: ["cakes", "hot-deals"],
    });

    const cakes = cakesResponse?.data || [];

    const {
        addToCart,
        isPending: isAddingToCart,
        pendingCakeId,
    } = useAddToCart();

    const handleAddToCart = (event, cake) => {
        // The whole card is a link, so keep the "+" from navigating.
        event.preventDefault();
        event.stopPropagation();

        addToCart(cake._id);
    };

    return (
        <section className="relative overflow-hidden bg-background py-16 md:py-20">
            <div className="wrapper">
                {/* Section Header */}
                <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {eyebrow ?? (isArabic ? "الأكثر مبيعاً" : "Top sellers")}
                        </div>

                        <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl xl:text-4xl">
                            {title ?? (isArabic ? "عروض ساخنة لا تفوتها" : "Hot deals you’ll love")}
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                            {subtitle ?? (isArabic ? "اكتشف الكعكات الأكثر طلباً لدينا بأسعار مميزة." : "Discover our best-selling cakes at special prices.")}
                        </p>
                    </div>

                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic
                                ? "حدث خطأ أثناء تحميل العروض. يرجى المحاولة مرة أخرى."
                                : "Something went wrong while loading the deals. Please try again."}
                        </h2>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && cakes.length === 0 && (
                    <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic ? "لا توجد عروض" : "No deals available"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "لا توجد عروض متاحة حالياً. تحقق مرة أخرى قريباً."
                                : "There are no deals available right now. Check back soon."}
                        </p>
                    </div>
                )}

                {/* Product Grid */}
                {!isLoading && !isError && cakes.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
                        {cakes.map((cake) => {
                            const price =
                                cake.discountedPrice ?? cake.price;

                            const hasDiscount =
                                cake.discountedPrice != null &&
                                cake.discountedPrice < cake.price;

                            const image = cake.images?.[0]?.url || "";

                            return (
                                <Link
                                    to={`/cake/${cake.slug}`}
                                    key={cake._id}
                                    className="group overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card transition-all duration-300 hover:shadow-lg"
                                >
                                    <div className="relative aspect-[1.35/1] overflow-hidden bg-secondary">
                                        {image ? (
                                            <img
                                                src={image}
                                                alt={
                                                    cake.name?.[
                                                        language
                                                    ] || ""
                                                }
                                                className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-125"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-secondary" />
                                        )}

                                        {/* Discount Badge */}
                                        {hasDiscount && (
                                            <span
                                                dir="ltr"
                                                className="absolute top-3 inset-s-3 rounded-none rounded-tl-xl rounded-br-xl bg-primary px-2.5 py-1.5 text-[10px] font-bold text-primary-foreground"
                                            >
                                                -
                                                {Math.round(
                                                    ((cake.price -
                                                        price) /
                                                        cake.price) *
                                                        100,
                                                )}
                                                %
                                            </span>
                                        )}

                                        {/* Variant Badge */}
                                        {cake.weightSize && (
                                            <span className="absolute bottom-3 inset-e-3 rounded-none rounded-tl-xl rounded-br-xl border border-white/40 bg-background/90 px-2.5 py-1.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur-sm">
                                                {cake.weightSize ===
                                                "small"
                                                    ? isArabic
                                                        ? "صغير"
                                                        : "Small"
                                                    : isArabic
                                                      ? "متوسط"
                                                      : "Medium"}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-3.5 md:p-4">
                                        {cake.category?.name && (
                                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                                                {
                                                    cake.category.name[
                                                        language
                                                    ]
                                                }
                                            </p>
                                        )}

                                        <h3 className="truncate text-[13px] font-bold tracking-tight text-card-foreground md:text-[15px]">
                                            {cake.name?.[language]}
                                        </h3>

                                        <div className="mt-3 flex items-center justify-between gap-2">
                                            <div className="flex min-w-0 items-baseline gap-1.5">
                                                <span className="text-base font-extrabold tracking-tight text-foreground md:text-lg">
                                                    {Number(
                                                        price,
                                                    ).toFixed(2)}
                                                </span>

                                                {hasDiscount && (
                                                    <span className="text-[10px] text-muted-foreground line-through md:text-xs">
                                                        {Number(
                                                            cake.price,
                                                        ).toFixed(2)}
                                                    </span>
                                                )}

                                                <span className="text-[9px] font-semibold text-muted-foreground">
                                                    KWD
                                                </span>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="asymmetric"
                                                size="icon-sm"
                                                aria-label="Add to cart"
                                                disabled={
                                                    isAddingToCart &&
                                                    pendingCakeId === cake._id
                                                }
                                                onClick={(event) =>
                                                    handleAddToCart(
                                                        event,
                                                        cake,
                                                    )
                                                }
                                                className="shrink-0"
                                            >
                                                {isAddingToCart &&
                                                pendingCakeId === cake._id ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <Plus className="size-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Mobile View All (no generic /products browse) */}
                <ViewAllButton
                    to="/"
                    className="mt-6 w-full md:hidden"
                >
                    {isArabic ? "عرض جميع العروض" : "View all deals"}
                </ViewAllButton>
            </div>
        </section>
    );
};

export default HotDeals;
