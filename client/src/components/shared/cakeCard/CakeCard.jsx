import { Loader2, Plus } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";

/*
 * Shared cake card — same look as the category grid / hot-deals cards.
 * Handles both category shapes returned by the API (object or array).
 */
const CakeCard = ({
    cake,
    language = "en",
    onAdd,
    isAdding = false,
    pendingId = null,
}) => {
    const isArabic = language === "ar";
    const price = cake.discountedPrice ?? cake.price;
    const hasDiscount =
        cake.discountedPrice != null && cake.discountedPrice < cake.price;
    const image = cake.images?.[0]?.url || "";
    const categoryObj = Array.isArray(cake.category)
        ? cake.category[0]
        : cake.category;

    return (
        <Link
            to={`/cake/${cake.slug}`}
            className="group flex flex-col overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
        >
            <div className="relative aspect-square overflow-hidden bg-secondary">
                {image ? (
                    <img
                        src={image}
                        alt={cake.name?.[language] || ""}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="h-full w-full bg-secondary" />
                )}

                {hasDiscount && (
                    <span
                        dir="ltr"
                        className="absolute top-3 inset-s-3 rounded-none rounded-tl-xl rounded-br-xl bg-primary px-2.5 py-1.5 text-[10px] font-bold text-primary-foreground"
                    >
                        -
                        {Math.round(
                            ((cake.price - price) / cake.price) * 100,
                        )}
                        %
                    </span>
                )}

                {cake.weightSize && (
                    <span className="absolute bottom-3 inset-e-3 rounded-none rounded-tl-xl rounded-br-xl border border-white/40 bg-background/90 px-2.5 py-1.5 text-[10px] font-bold text-foreground shadow-sm backdrop-blur-sm">
                        {cake.weightSize === "small"
                            ? isArabic
                                ? "صغير"
                                : "Small"
                            : isArabic
                              ? "متوسط"
                              : "Medium"}
                    </span>
                )}
            </div>

            <div className="flex flex-1 flex-col p-3.5 md:p-4">
                {categoryObj?.name && (
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                        {categoryObj.name[language]}
                    </p>
                )}

                <h3 className="line-clamp-2 min-h-10 text-sm font-bold tracking-tight text-card-foreground md:text-base">
                    {cake.name?.[language]}
                </h3>

                <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                    <div className="flex min-w-0 items-baseline gap-1.5">
                        <span className="text-lg font-extrabold tracking-tight text-foreground md:text-xl">
                            {Number(price).toFixed(2)}
                        </span>

                        {hasDiscount && (
                            <span className="text-[10px] text-muted-foreground line-through md:text-xs">
                                {Number(cake.price).toFixed(2)}
                            </span>
                        )}

                        <span className="text-[9px] font-semibold text-muted-foreground">
                            KWD
                        </span>
                    </div>

                    <Button
                        type="button"
                        variant="asymmetric"
                        size="icon"
                        aria-label="Add to cart"
                        disabled={isAdding && pendingId === cake._id}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            onAdd?.(cake);
                        }}
                        className="shrink-0"
                    >
                        {isAdding && pendingId === cake._id ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Plus className="size-4" />
                        )}
                    </Button>
                </div>
            </div>
        </Link>
    );
};

export default CakeCard;
