import { ArrowRight, Loader2, TrendingUp } from "lucide-react";
import { Link } from "react-router";

import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";

const POPULAR_CATEGORIES_COUNT = 3;

const PopularCategories = () => {
    const { language } = useLanguage();
    const isArabic = language === "ar";

    const {
        data: categoriesResponse,
        isLoading,
        isError,
    } = useGet({
        url: "/categories",
        params: {
            isPopular: "true",
            limit: POPULAR_CATEGORIES_COUNT,
        },
        queryKey: [
            "categories",
            "popular",
            { isPopular: "true", limit: POPULAR_CATEGORIES_COUNT },
        ],
        retry: false,
    });

    const categories = categoriesResponse?.data || [];

    return (
        <section className="relative overflow-hidden bg-secondary/30 py-16 md:py-20">
            <div className="wrapper">
                <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                            <TrendingUp className="size-3.5" />

                            {isArabic ? "الأكثر طلباً" : "Most ordered"}
                        </div>

                        <h2 className="text-2xl font-extrabold tracking-[-0.03em] text-foreground md:text-3xl xl:text-4xl">
                            {isArabic ? "الفئات الشائعة" : "Popular categories"}
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                            {isArabic
                                ? "أكثر المجموعات طلباً من عملائنا، اختر ما يناسب مناسبتك."
                                : "The collections our customers order the most. Find the one that fits your occasion."}
                        </p>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex min-h-40 items-center justify-center py-20">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                )}

                {isError && (
                    <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic
                                ? "حدث خطأ أثناء تحميل الفئات الشائعة. يرجى المحاولة مرة أخرى."
                                : "Something went wrong while loading popular categories. Please try again."}
                        </h2>
                    </div>
                )}

                {!isLoading && !isError && categories.length === 0 && (
                    <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
                            <TrendingUp className="size-6 text-muted-foreground" />
                        </div>

                        <h2 className="text-lg font-bold text-foreground">
                            {isArabic
                                ? "لا توجد فئات شائعة"
                                : "No popular categories available"}
                        </h2>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {isArabic
                                ? "لا توجد فئات متاحة حالياً. تحقق مرة أخرى قريباً."
                                : "There are no popular categories right now. Check back soon."}
                        </p>
                    </div>
                )}

                {!isLoading && !isError && categories.length > 0 && (
                    <div className="grid gap-4 md:grid-cols-3 md:gap-5">
                        {categories.map((category, index) => (
                            <Link
                                to={`/category/${category.slug}`}
                                key={category._id}
                                className="group overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
                            >
                                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name[language]}
                                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    <div className="absolute inset-0 bg-linear-to-t from-foreground/40 via-transparent to-transparent" />


                                </div>

                                <div className="flex items-center justify-between gap-3 p-4 md:p-5">
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-semibold text-card-foreground md:text-base">
                                            {category.name[language]}
                                        </h3>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {isArabic
                                                ? "تسوّق المجموعة الآن"
                                                : "Shop the collection"}
                                        </p>
                                    </div>

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none rounded-tl-lg rounded-br-lg bg-secondary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularCategories;

