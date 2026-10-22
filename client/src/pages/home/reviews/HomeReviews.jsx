import { useCallback, useEffect, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    MessageSquare,
    Quote,
    Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { useGetLatestReviews } from "@/hooks/useReviews";

const LATEST_REVIEWS_COUNT = 8;
const AUTOPLAY_MS = 3500;
const SLIDE_GAP = 24;

// Slides visible per breakpoint: 1 (mobile) -> 2 (sm) -> 3 (lg)
const SLIDES_PER_VIEW = [
    { query: "(min-width: 1024px)", count: 3 },
    { query: "(min-width: 640px)", count: 2 },
    { query: "(max-width: 639px)", count: 1 },
];

const getSlidesPerView = () => {
    if (typeof window === "undefined") {
        return 1;
    }

    const match = SLIDES_PER_VIEW.find((item) =>
        window.matchMedia(item.query).matches,
    );

    return match ? match.count : 1;
};

const ARABIC_CHARACTER = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

// Reviews are stored as written by the customer, so they keep their own
// language regardless of the current UI language.
const detectLanguage = (text) => {
    if (!text) return null;

    return ARABIC_CHARACTER.test(text) ? "ar" : "en";
};

const formatDate = (value, isArabic) => {
    if (!value) return "";

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

const StarRow = ({ rating }) => (
    <div className="flex items-center gap-0.5" dir="ltr">
        {Array.from({ length: 5 }).map((_, index) => (
            <Star
                key={index}
                className={
                    index < rating
                        ? "size-3.5 fill-primary text-primary"
                        : "size-3.5 text-muted-foreground/30"
                }
            />
        ))}
    </div>
);

export default function HomeReviews() {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const {
        data,
        isLoading,
        isError,
        refetch,
    } = useGetLatestReviews({ limit: LATEST_REVIEWS_COUNT });

    const reviews = data?.data || [];

    const [perView, setPerView] = useState(getSlidesPerView);

    const viewportRef = useRef(null);
    const trackRef = useRef(null);
    const positionRef = useRef(0);
    const draggingRef = useRef(false);
    const dragOffsetRef = useRef(0);
    const dragStartXRef = useRef(0);

    const total = reviews.length;
    const step = total > 0 ? total : 1;

    // Keep the number of visible slides in sync with the viewport.
    useEffect(() => {
        const onResize = () => setPerView(getSlidesPerView());

        window.addEventListener("resize", onResize);

        return () => window.removeEventListener("resize", onResize);
    }, []);

    const measure = useCallback(() => {
        const track = trackRef.current;

        if (!track || !track.firstElementChild) return { slide: 0, gap: 0 };

        const slide = track.firstElementChild.offsetWidth;
        const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;

        return { slide, gap };
    }, []);

    // The track is a flex row, so in RTL the slides are laid out from right
    // to left. The horizontal offset therefore has to be mirrored, otherwise
    // the carousel slides out of view and the reviews look "lost".
    const directionFactor = isArabic ? 1 : -1;

    const applyTransform = useCallback(
        (position, animate = true) => {
            const track = trackRef.current;

            if (!track) return;

            const { slide, gap } = measure();

            track.style.transition = animate
                ? "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)"
                : "none";
            track.style.transform = `translate3d(${
                directionFactor * position * (slide + gap)
            }px, 0, 0)`;
        },
        [directionFactor, measure],
    );


    const [carousel, setCarousel] = useState({
        activeIndex: 0,
        total,
        perView,
    });

    if (carousel.total !== total || carousel.perView !== perView) {
        setCarousel({ activeIndex: 0, total, perView });
    }

    const activeIndex = carousel.activeIndex;

    useEffect(() => {
        if (total === 0) {
            positionRef.current = 0;
            applyTransform(0, false);

            return;
        }

        positionRef.current = step;
        applyTransform(step, false);
    }, [applyTransform, perView, step, total]);

    const moveTo = useCallback(
        (nextPosition) => {
            positionRef.current = nextPosition;
            applyTransform(nextPosition, true);
            setCarousel((prev) => ({
                ...prev,
                activeIndex: ((nextPosition % step) + step) % step,
            }));
        },
        [applyTransform, step],
    );

    // Jump to an equivalent position without animation, then continue in the
    // requested direction. Two frames are used so the browser paints the
    // jump first — otherwise the following move is animated from the wrong
    // position and the loop visibly jumps backwards.
    const jumpAndContinue = useCallback(
        (jumped, direction) => {
            applyTransform(jumped, false);
            positionRef.current = jumped;

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    moveTo(jumped + direction);
                });
            });
        },
        [applyTransform, moveTo],
    );

    const goNext = useCallback(() => {
        const next = positionRef.current + 1;

        // Reached the end of the last copy — jump back to the first copy
        // (identical content) without animating so the loop looks endless.
        if (next > 2 * step - 1) {
            jumpAndContinue(next - step, 1);

            return;
        }

        moveTo(next);
    }, [jumpAndContinue, moveTo, step]);

    const goPrev = useCallback(() => {
        const next = positionRef.current - 1;

        if (next < 0) {
            jumpAndContinue(next + step, -1);

            return;
        }

        moveTo(next);
    }, [jumpAndContinue, moveTo, step]);

    // Autoplay — hover does NOT pause it; it only stops while dragging.
    useEffect(() => {
        if (total === 0 || perView >= total) return undefined;

        const timer = setInterval(() => {
            if (!draggingRef.current) {
                goNext();
            }
        }, AUTOPLAY_MS);

        return () => clearInterval(timer);
    }, [goNext, perView, total]);

    // Drag to scroll (pointer events, works for mouse and touch).
    const onPointerDown = (event) => {
        if (total === 0) return;

        draggingRef.current = true;
        dragStartXRef.current = event.clientX;
        dragOffsetRef.current = 0;

        event.currentTarget.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event) => {
        if (!draggingRef.current) return;

        const delta = event.clientX - dragStartXRef.current;

        dragOffsetRef.current = delta;

        const track = trackRef.current;

        if (!track) return;

        const { slide, gap } = measure();

        track.style.transition = "none";
        track.style.transform = `translate3d(${
            -positionRef.current * (slide + gap) + delta
        }px, 0, 0)`;
    };

    const onPointerUp = () => {
        if (!draggingRef.current) return;

        draggingRef.current = false;

        const { slide } = measure();
        const threshold = Math.max(slide * 0.2, 40);

        // In RTL the track is mirrored, so the drag has to be mirrored too:
        // dragging towards the right reveals the next slide.
        const dragSign = directionFactor === -1 ? 1 : -1;
        const dragDistance = dragSign * dragOffsetRef.current;

        if (dragDistance <= -threshold) {
            goNext();
        } else if (dragDistance >= threshold) {
            goPrev();
        } else {
            applyTransform(positionRef.current, true);
        }

        dragOffsetRef.current = 0;
    };

    if (isLoading) {
        return (
            <section className="relative overflow-hidden bg-secondary/30 py-16 md:py-20">
                <div className="wrapper flex min-h-40 items-center justify-center">
                    <Loader2 className="size-8 animate-spin text-primary" />
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <section className="relative overflow-hidden bg-secondary/30 py-16 md:py-20">
                <div className="wrapper rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                    <h2 className="text-lg font-bold text-foreground">
                        {isArabic
                            ? "حدث خطأ أثناء تحميل المراجعات. يرجى المحاولة مرة أخرى."
                            : "Something went wrong while loading the reviews. Please try again."}
                    </h2>

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
            </section>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    // Three copies of the list so the loop can scroll forever without a seam.
    const loopedReviews = [...reviews, ...reviews, ...reviews];

    const slideWidth = `calc(${100 / perView}% - ${(SLIDE_GAP * (perView - 1)) / perView}px)`;

    return (
        <section className="relative overflow-hidden bg-secondary/30 py-16 md:py-20">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 start-1/3 size-72 rounded-full bg-primary/10 blur-3xl"
            />

            <div className="wrapper relative">
                <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                            <MessageSquare className="size-3.5" />

                            {isArabic
                                ? "آراء عملائنا"
                                : "What our guests say"}
                        </div>

                        <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl xl:text-4xl">
                            {isArabic
                                ? "تقييمات من عشاق الحلويات"
                                : "Loved by cake lovers"}
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                            {isArabic
                                ? "أحدث آراء عملائنا حول الكعكات التي صممناها بعناية."
                                : "The most recent reviews from customers who tasted our handcrafted cakes."}
                        </p>
                    </div>

                    <div className="hidden shrink-0 items-center gap-2 md:flex">
                        <Button
                            type="button"
                            variant="outline-asymmetric"
                            size="icon-lg"
                            aria-label={isArabic ? "السابق" : "Previous reviews"}
                            onClick={goPrev}
                        >
                            <ChevronLeft className="size-4 rtl:rotate-180" />
                        </Button>

                        <Button
                            type="button"
                            variant="outline-asymmetric"
                            size="icon-lg"
                            aria-label={isArabic ? "التالي" : "Next reviews"}
                            onClick={goNext}
                        >
                            <ChevronRight className="size-4 rtl:rotate-180" />
                        </Button>
                    </div>
                </div>

                <div
                    ref={viewportRef}
                    className="overflow-hidden"
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onPointerLeave={onPointerUp}
                    style={{ touchAction: "pan-y" }}
                >
                    <div
                        ref={trackRef}
                        className="flex items-stretch"
                        style={{ columnGap: `${SLIDE_GAP}px` }}
                    >
                        {loopedReviews.map((review, slideIndex) => {
                            const reviewLanguage =
                                detectLanguage(review.comment) || language;
                            const reviewIsArabic = reviewLanguage === "ar";

                            return (
                                <div
                                    key={`${review._id}-${slideIndex}`}
                                    className="shrink-0 grow-0"
                                    style={{ width: slideWidth }}
                                >
                                    <article className="flex h-full flex-col rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-xl">
                                        <div className="flex items-center justify-between gap-3">
                                            <StarRow rating={Number(review.rating) || 0} />

                                            <Quote className="size-6 shrink-0 text-primary/20" />
                                        </div>

                                        <p
                                            dir="auto"
                                            className="mt-4 line-clamp-4 flex-1 text-sm leading-6 text-muted-foreground"
                                        >
                                            {review.comment ||
                                                (reviewIsArabic
                                                    ? "مذاق رائع وتقديم جميل."
                                                    : "Great taste and beautiful presentation.")}
                                        </p>

                                        <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                                            {review.user?.avatarUrl ? (
                                                <img
                                                    src={review.user.avatarUrl}
                                                    alt={review.user.username}
                                                    className="size-10 shrink-0 rounded-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                                                    {(
                                                        review.user?.username?.[0] ||
                                                        "?"
                                                    ).toUpperCase()}
                                                </div>
                                            )}

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-foreground">
                                                    {review.user?.username ||
                                                        (reviewIsArabic
                                                            ? "عميل"
                                                            : "Customer")}
                                                </p>

                                                <p className="truncate text-xs text-muted-foreground">
                                                    {review.cake?.name?.[reviewLanguage] ||
                                                        (reviewIsArabic
                                                            ? "كعكة مميزة"
                                                            : "Signature cake")}
                                                </p>
                                            </div>

                                            <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                                                {formatDate(
                                                    review.createdAt,
                                                    reviewIsArabic,
                                                )}
                                            </span>
                                        </div>
                                    </article>
                                </div>
                        );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2">
                    {reviews.map((review, dotIndex) => (
                        <button
                            key={review._id}
                            type="button"
                            aria-label={isArabic
                                ? `عرض المراجعة ${dotIndex + 1}`
                                : `Show review ${dotIndex + 1}`}
                            onClick={() => {
                                const target = step + dotIndex;

                                positionRef.current = target;
                                applyTransform(target, true);
                                setCarousel((prev) => ({
                                    ...prev,
                                    activeIndex: dotIndex,
                                }));
                            }}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                activeIndex === dotIndex
                                    ? "w-6 bg-primary"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                            }`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
