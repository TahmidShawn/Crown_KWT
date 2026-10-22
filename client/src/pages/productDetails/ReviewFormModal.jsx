import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Star } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/LanguageContext";
import useCreateReview from "@/hooks/useCreateReview";

const reviewSchema = z.object({
    rating: z
        .number({ error: "Please pick a rating" })
        .int("Rating must be a whole number")
        .min(1, "Please pick a rating")
        .max(5, "Rating cannot exceed 5"),

    comment: z
        .string()
        .trim()
        .max(500, "Comment cannot exceed 500 characters"),
});

const MAX_COMMENT_LENGTH = 500;

const ReviewFormModal = ({ open, onOpenChange, slug, cakeName }) => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const [hoveredRating, setHoveredRating] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(reviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
        },
    });

    const { mutate: createReview, isPending } = useCreateReview();

    const rating = watch("rating");
    const comment = watch("comment") || "";

    const handleClose = () => {
        if (isPending) {
            return;
        }

        setHoveredRating(0);
        reset({ rating: 0, comment: "" });
        onOpenChange(false);
    };

    const onSubmit = (values) => {
        createReview(
            {
                slug,
                rating: values.rating,
                comment: values.comment || "",
            },
            {
                onSuccess: () => {
                    setHoveredRating(0);
                    reset({ rating: 0, comment: "" });
                    onOpenChange(false);
                },
            },
        );
    };

    const activeRating = hoveredRating || rating;


    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="w-[calc(100%-2rem)] !max-w-lg overflow-y-auto p-5 md:p-6">
                <DialogHeader className="text-left">
                    <DialogTitle>
                        {isArabic ? "اكتب تقييمك" : "Write your review"}
                    </DialogTitle>

                    <DialogDescription>
                        {isArabic
                            ? "شارك تجربتك مع هذه الكعكة. يمكنك كتابة تقييم واحد فقط لكل كعكة."
                            : "Share your experience with this cake. You can leave only one review per cake."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {cakeName && (
                        <p className="truncate text-sm font-medium">
                            {cakeName}
                        </p>
                    )}

                    <div className="space-y-2">
                        <Label
                            id="review-rating-label"
                            className="text-sm font-medium"
                        >
                            {isArabic ? "التقييم" : "Your rating"}
                        </Label>

                        <div
                            className="flex items-center gap-1"
                            role="radiogroup"
                            aria-labelledby="review-rating-label"
                            onMouseLeave={() => setHoveredRating(0)}
                        >
                            {Array.from({ length: 5 }).map((_, index) => {
                                const value = index + 1;

                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={rating === value}
                                        aria-label={`${value} ${isArabic ? "نجوم" : "stars"}`}
                                        className="rounded-md p-0.5 transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                                        onMouseEnter={() =>
                                            setHoveredRating(value)
                                        }
                                        onFocus={() => setHoveredRating(value)}
                                        onBlur={() => setHoveredRating(0)}
                                        onClick={() =>
                                            setValue("rating", value, {
                                                shouldValidate: true,
                                            })
                                        }
                                    >
                                        <Star
                                            className={
                                                activeRating >= value
                                                    ? "size-7 fill-primary text-primary"
                                                    : "size-7 text-muted-foreground/40"
                                            }
                                        />
                                    </button>
                                );
                            })}

                            <span className="ms-2 text-sm text-muted-foreground">
                                {activeRating
                                    ? `${activeRating} / 5`
                                    : isArabic
                                      ? "اختر تقييمك"
                                      : "Select a rating"}
                            </span>
                        </div>

                        {errors.rating && (
                            <p className="text-xs text-destructive">
                                {errors.rating.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="review-comment"
                            className="text-sm font-medium"
                        >
                            {isArabic ? "تعليقك" : "Your comment"}
                        </Label>

                        <Textarea
                            id="review-comment"
                            rows={4}
                            placeholder={
                                isArabic
                                    ? "كيف كانت تجربتك مع هذه الكعكة؟"
                                    : "How was your experience with this cake?"
                            }
                            disabled={isPending}
                            aria-invalid={Boolean(errors.comment)}
                            {...register("comment")}
                        />

                        <div className="flex items-center justify-between">
                            {errors.comment ? (
                                <p className="text-xs text-destructive">
                                    {errors.comment.message}
                                </p>
                            ) : (
                                <span />
                            )}

                            <span className="text-xs text-muted-foreground">
                                {comment.length}/{MAX_COMMENT_LENGTH}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline-asymmetric"
                            onClick={handleClose}
                            disabled={isPending}
                        >
                            {isArabic ? "إلغاء" : "Cancel"}
                        </Button>

                        <Button
                            type="submit"
                            variant="asymmetric"
                            disabled={isPending || rating === 0}
                        >
                            {isPending && (
                                <Loader2 className="size-4 animate-spin" />
                            )}

                            {isPending
                                ? isArabic
                                    ? "جارٍ الإرسال..."
                                    : "Submitting..."
                                : isArabic
                                  ? "نشر التقييم"
                                  : "Submit review"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewFormModal;

