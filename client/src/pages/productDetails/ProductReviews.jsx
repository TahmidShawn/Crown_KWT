import {
    CheckCircle2,
    Loader2,
    MessageSquare,
    Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useGetCakeReviews } from "@/hooks/useReviews";

const formatDate = (value, isArabic) => {
    if (!value) {
        return "";
    }

    try {
        return new Intl.DateTimeFormat(isArabic ? "ar-KW" : "en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
        }).format(new Date(value));
    } catch {
        return "";
    }
};

const StarRow = ({ rating, size = "size-4" }) => {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    className={
                        index < rating
                            ? `${size} fill-primary text-primary`
                            : `${size} text-muted-foreground/30`
                    }
                />
            ))}
        </div>
    );
};

const ProductReviews = ({ slug, onWriteReview, canReview = true, hasReviewed = false }) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const { data, isLoading, isError, refetch } = useGetCakeReviews({
        slug,
    });

    const reviews = data?.data || [];
    const summary = data?.summary;
    const avgRating = Number(summary?.avgRating || 0);
    const numReviews = summary?.numReviews || 0;

    if (isLoading) {
        return (
            <div className="mt-8 flex items-center justify-center gap-3 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-10 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin text-primary" />

                {isArabic
                    ? "جاري تحميل المراجعات..."
                    : "Loading reviews..."}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="mt-8 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-6 text-center">
                <p className="text-sm text-muted-foreground">
                    {isArabic
                        ? "تعذر تحميل المراجعات."
                        : "We couldn't load the reviews."}
                </p>

                <Button
                    type="button"
                    variant="outline-asymmetric"
                    size="sm"
                    className="mt-4"
                    onClick={() => refetch()}
                >
                    {isArabic ? "إعادة المحاولة" : "Try again"}
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-6">
            <div className="rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-base font-bold tracking-tight">
                            {isArabic
                                ? "آراء العملاء"
                                : "Customer reviews"}
                        </h3>

                        {numReviews > 0 && (
                            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                {numReviews}
                            </span>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="outline-asymmetric"
                        size="sm"
                        onClick={onWriteReview}
                        disabled={!canReview}
                    >
                        {hasReviewed
                            ? isArabic
                                ? "تم التقييم"
                                : "Reviewed"
                            : isArabic
                              ? "اكتب مراجعة"
                              : "Write a review"}
                    </Button>
                </div>

                {numReviews > 0 ? (
                    <div className="grid gap-8 px-6 py-6 md:grid-cols-[auto_1fr] md:items-center md:gap-12">
                        <div className="flex items-center gap-5 md:flex-col md:items-start md:gap-2">
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black leading-none tracking-tight">
                                    {avgRating.toFixed(1)}
                                </span>

                                <span className="text-sm font-medium text-muted-foreground">
                                    / 5
                                </span>
                            </div>

                            <StarRow
                                rating={Math.round(avgRating)}
                                size="size-5"
                            />

                            <p className="text-xs text-muted-foreground">
                                {isArabic
                                    ? `بناءً على ${numReviews} مراجعة`
                                    : `Based on ${numReviews} ${
                                          numReviews === 1
                                              ? "review"
                                              : "reviews"
                                      }`}
                            </p>
                        </div>

                        <div className="space-y-2.5">
                            {[5, 4, 3, 2, 1].map((star) => {
                                const count =
                                    summary?.distribution?.[star] || 0;

                                const percent = numReviews
                                    ? Math.round((count / numReviews) * 100)
                                    : 0;

                                return (
                                    <div
                                        key={star}
                                        className="flex items-center gap-3"
                                    >
                                        <span className="flex w-8 shrink-0 items-center justify-end gap-1 text-xs font-medium text-muted-foreground">
                                            {star}

                                            <Star className="size-3 fill-primary text-primary" />
                                        </span>

                                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className="h-full rounded-full bg-primary transition-[width] duration-500"
                                                style={{
                                                    width: `${percent}%`,
                                                }}
                                            />
                                        </div>

                                        <span className="w-16 shrink-0 text-end text-xs text-muted-foreground">
                                            {count} ({percent}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            {isArabic
                                ? "لا توجد مراجعات بعد — كن أول من يقيّم هذه الكعكة."
                                : "No reviews yet — be the first to review this cake."}
                        </p>
                    </div>
                )}
            </div>


            {reviews.length === 0 ? (
                <div className="rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-10 text-center">
                    <MessageSquare className="mx-auto size-8 text-muted-foreground/50" />

                    <p className="mt-3 text-sm font-medium">
                        {isArabic ? "لا توجد مراجعات بعد" : "No reviews yet"}
                    </p>

                    <p className="mt-1 text-sm text-muted-foreground">
                        {isArabic
                            ? "كن أول من يقيّم هذه الكعكة."
                            : "Be the first to review this cake."}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {reviews.map((review) => (
                        <article
                            key={review._id}
                            className="flex flex-col rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-md"
                        >
                            <div className="flex items-start gap-3">
                                {review.user?.avatarUrl ? (
                                    <img
                                        src={review.user.avatarUrl}
                                        alt={review.user.username}
                                        className="size-10 shrink-0 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                        {(
                                            review.user?.username?.[0] || "?"
                                        ).toUpperCase()}
                                    </div>
                                )}

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p
                                                className="text-sm font-semibold leading-tight break-words"
                                                title={review.user?.username}
                                            >
                                                {review.user?.username ||
                                                    (isArabic
                                                        ? "عميل"
                                                        : "Customer")}
                                            </p>

                                            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                                                <CheckCircle2 className="size-3 shrink-0" />

                                                {review.isVerifiedPurchase
                                                    ? isArabic
                                                        ? "شراء موثّق"
                                                        : "Verified purchase"
                                                    : isArabic
                                                      ? "عميل موثّق"
                                                      : "Verified customer"}
                                            </span>
                                        </div>

                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                            {formatDate(
                                                review.createdAt,
                                                isArabic,
                                            )}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <StarRow
                                            rating={Number(review.rating)}
                                            size="size-3.5"
                                        />
                                    </div>
                                </div>
                            </div>

                            {review.comment && (
                                <p className="mt-3 line-clamp-4 text-sm leading-6 text-muted-foreground">
                                    {review.comment}
                                </p>
                            )}
                        </article>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductReviews;
