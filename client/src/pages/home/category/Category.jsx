import { LayoutGrid, Loader2 } from "lucide-react";

import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import { Link } from "react-router";

const Category = () => {
    const { language } = useLanguage();

    const {
        data: response,
        isLoading,
        isError,
    } = useGet({
        url: "/categories",
        queryKey: ["categories"],
        retry: false,
    });

    const categories = response?.data || [];

    return (
        <section className="relative overflow-hidden bg-secondary/30 py-16 sm:py-20">
            <div className="wrapper">
                
                <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
                    <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-card px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />

                            {language === "ar"
                                ? "اكتشف مجموعتنا"
                                : "Explore our collection"}
                        </div>

                        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl xl:text-4xl">
                            {language === "ar"
                                ? "اختر حسب الفئة"
                                : "Find your perfect cake"}
                        </h2>

                        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                            {language === "ar"
                                ? "اكتشف مجموعة من الكعكات المصنوعة لكل مناسبة."
                                : "Browse our selection of cakes crafted for every occasion."}
                        </p>
                    </div>
                </div>

                
                {isLoading && (
                    <div className="flex min-h-40 items-center justify-center">
                        <Loader2 className="size-7 animate-spin text-primary" />
                    </div>
                )}

                
                {isError && !isLoading && (
                    <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-12 text-center">
                        <h3 className="text-base font-bold text-foreground">
                            {language === "ar"
                                ? "تعذر تحميل الفئات"
                                : "Unable to load categories"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {language === "ar"
                                ? "يرجى المحاولة مرة أخرى لاحقاً."
                                : "Please try again later."}
                        </p>
                    </div>
                )}

                
                {!isLoading && !isError && categories.length === 0 && (
                    <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-12 text-center">
                        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-muted">
                            <LayoutGrid className="size-6 text-muted-foreground" />
                        </div>

                        <h3 className="text-base font-bold text-foreground">
                            {language === "ar"
                                ? "لا توجد فئات بعد"
                                : "No categories yet"}
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            {language === "ar"
                                ? "تحقق مرة أخرى قريباً."
                                : "Check back soon."}
                        </p>
                    </div>
                )}

                
                {!isLoading && !isError && categories.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
                        {categories.map((category) => (
                            <Link
                                to={`/category/${category.slug}`}
                                key={category._id}
                                className="group overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-xl"
                            >
                                <div className="relative aspect-[1.1/1] overflow-hidden bg-secondary">
                                    <img
                                        src={category.imageUrl}
                                        alt={category.name[language]}
                                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    <div className="absolute inset-0 bg-linear-to-t from-foreground/35 via-transparent to-transparent" />

                                    <div className="absolute bottom-3 inset-s-3 rounded-none rounded-tl-xl rounded-br-xl border border-white/30 bg-background/90 px-2.5 py-1.5 text-[10px] font-semibold text-foreground shadow-sm backdrop-blur-sm">
                                        {category.cakeCount}{" "}
                                        {language === "ar"
                                            ? "كعكة"
                                            : category.cakeCount === 1
                                              ? "cake"
                                              : "cakes"}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between gap-3 p-4">
                                    <h3 className="min-w-0 truncate text-sm font-semibold text-card-foreground md:text-base">
                                        {category.name[language]}
                                    </h3>

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none rounded-tl-lg rounded-br-lg bg-secondary text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="size-4 transition-transform duration-300 group-hover:rotate-45"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M7 17 17 7" />
                                            <path d="M7 7h10v10" />
                                        </svg>
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

export default Category;
