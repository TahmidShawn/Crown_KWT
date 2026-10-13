import { Loader2, Sparkles } from "lucide-react";

import PrimaryButton from "@/components/shared/button/PrimaryButton";
import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";

const FeaturedDeal = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    // The featured deal is the single highest-discounted active cake.
    const {
        data: response,
        isLoading,
        isError,
    } = useGet({
        url: "/cakes",
        params: { sort: "discount", limit: 1 },
        queryKey: ["cakes", "featured-deal"],
        retry: false,
    });

    const cake = response?.data?.[0];

    if (isLoading) {
        return (
            <section className="relative overflow-hidden bg-background pb-20">
                <div className="wrapper flex min-h-40 items-center justify-center">
                    <Loader2 className="size-7 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    // Hide the section entirely if there's nothing to feature.
    if (isError || !cake) {
        return null;
    }

    const price = Number(cake.discountedPrice ?? cake.price);
    const originalPrice = Number(cake.price);
    const hasDiscount = price < originalPrice;
    const discount = hasDiscount
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : 0;
    const image = cake.images?.[0]?.url || "";

    return (
        <section className="relative overflow-hidden bg-background pb-20">
            <div className="wrapper">
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                    <div className="flex flex-col md:flex-row">
                        {/* Cake Image */}
                        <div className="relative aspect-[1.3/1] overflow-hidden md:aspect-auto md:h-125 md:w-[55%]">
                            {image ? (
                                <img
                                    src={image}
                                    alt={cake.name?.[language] ?? ""}
                                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="h-full w-full bg-secondary" />
                            )}

                            <div className="absolute inset-0 bg-linear-to-t from-black/25 via-transparent to-transparent" />

                            {/* Discount */}
                            {discount > 0 && (
                                <div className="absolute top-4 inset-s-4 flex size-20 flex-col items-center justify-center rounded-full bg-background shadow-lg md:top-5 md:inset-s-5 md:size-22">
                                    <span className="text-2xl font-black leading-none text-foreground">
                                        {discount}%
                                    </span>

                                    <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                        {isArabic ? "خصم" : "OFF"}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex flex-1 flex-col justify-center p-7 md:p-9 xl:p-10">
                            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                                <Sparkles className="size-3.5" />

                                {isArabic ? "العرض المميز" : "Featured deal"}
                            </div>

                            {cake.category?.name && (
                                <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                                    {cake.category.name[language]}
                                </p>
                            )}

                            <h2 className="max-w-md text-3xl font-black tracking-[-0.04em] text-foreground md:text-4xl xl:text-5xl">
                                {cake.name?.[language]}
                            </h2>

                            <p className="mt-3 line-clamp-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base">
                                {cake.description?.[language]}
                            </p>

                            <div className="mt-5 flex flex-wrap items-end gap-2.5">
                                <span className="text-3xl font-black tracking-tight text-foreground">
                                    {price.toFixed(2)}
                                </span>

                                <span className="pb-1 text-xs font-semibold text-muted-foreground">
                                    KWD
                                </span>

                                {hasDiscount && (
                                    <span className="pb-1 text-sm text-muted-foreground line-through">
                                        {originalPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            <div className="mt-6">
                                <PrimaryButton
                                    to={`/cake/${cake.slug}`}
                                    type="button"
                                >
                                    {isArabic ? "اطلب الآن" : "Order now"}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FeaturedDeal;

