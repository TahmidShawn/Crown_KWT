import { Link } from "react-router";

import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import useAddToCart from "@/hooks/useAddToCart";
import CakeCard from "@/components/shared/cakeCard/CakeCard";

/*
 * Cross-sell strip for the bottom of /category/:slug (and /search).
 *
 * What normal e-commerce does on a listing page:
 *  - NEVER repeat the same category grid (it's already on screen).
 *  - Show picks from OTHER categories so the shopper keeps browsing
 *    instead of bouncing ("You may also like" / "Explore more").
 *  - Bias toward discounted cakes — they convert 2-3x better as impulse adds.
 *
 * The backend has no "exclude category" filter, so we over-fetch the
 * top-discounted cakes (limit 12) and drop anything from the current
 * category client-side, then show up to 8. Falls back to unfiltered
 * top-discounted cakes if the whole store is one category.
 */
const YouMayAlsoLike = ({ excludeSlug = "", excludeIds = [] }) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const { data, isLoading } = useGet({
        url: "/cakes",
        params: { sort: "discount", limit: 12 },
        queryKey: ["cakes", "you-may-also-like", excludeSlug],
    });

    const { addToCart, isPending, pendingCakeId } = useAddToCart();

    const all = data?.data || [];
    const excluded = new Set(excludeIds);

    const filtered = all.filter((cake) => {
        if (excluded.has(cake._id)) return false;
        const cats = Array.isArray(cake.category)
            ? cake.category
            : [cake.category];
        return !cats.some((c) => c?.slug === excludeSlug);
    });

    // If every cake is in this category, show the top-discounted ones anyway
    // (minus items already on screen) rather than an empty section.
    const visible = (filtered.length > 0 ? filtered : all.filter((c) => !excluded.has(c._id))).slice(0, 8);

    if (isLoading || visible.length === 0) return null;

    return (
        <section className="border-t border-border bg-secondary/30 py-12 md:py-16">
            <div className="wrapper">
                <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {isArabic ? "اكتشف المزيد" : "Keep exploring"}
                        </div>

                        <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl">
                            {isArabic ? "قد تعجبك أيضاً" : "You may also like"}
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                            {isArabic
                                ? "مختارات من فئات أخرى قد تنال إعجابك"
                                : "Top picks from our other collections you might love."}
                        </p>
                    </div>

                    <Link
                        to="/search"
                        className="hidden shrink-0 text-sm font-bold text-primary hover:text-primary/70 md:block"
                    >
                        {isArabic ? "عرض الكل" : "View all"}
                    </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
                    {visible.map((cake) => (
                        <CakeCard
                            key={cake._id}
                            cake={cake}
                            language={language}
                            onAdd={(c) => addToCart(c._id)}
                            isAdding={isPending}
                            pendingId={pendingCakeId}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default YouMayAlsoLike;
