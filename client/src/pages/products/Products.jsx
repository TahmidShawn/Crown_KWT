import { Filter, Loader2, Plus, X } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { useParams, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import useAddToCart from "@/hooks/useAddToCart";

import ProductFilters from "./ProductFilters";
import YouMayAlsoLike from "@/components/shared/youMayAlsoLike/YouMayAlsoLike";

const initialFilters = {
    price: null,
    size: [],
};

const Products = () => {
    const { slug } = useParams();
    const [searchParams] = useSearchParams();
    const { language } = useLanguage();

    const [filters, setFilters] = useState(initialFilters);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [sort, setSort] = useState("featured");

    const isArabic = language === "ar";

    // Search term comes from the URL when on the category/product/search routes.
    const search = searchParams
        .get("query")
        ?.trim() || searchParams.get("search")?.trim() || "";

    /*
     * The category comes from the URL:
     *
     * /category/birtday  ->  slug = "birtday"
     *
     * With no slug (/search or /search?query=...), we browse all
     * active cakes and optionally filter by the search term.
     *
     * Price and size remain local filter state.
     */
    const params = {
        ...(slug && { category: slug }),
        ...(search && { search }),
        ...(filters.price && {
            price: filters.price,
        }),
        ...(filters.size.length > 0 && {
            size: filters.size.join(","),
        }),
        ...(sort !== "featured" && {
            sort,
        }),
    };

    const {
        data: cakesResponse,
        isLoading,
        isError,
    } = useGet({
        url: "/cakes",
        params,
        queryKey: ["cakes", "category", slug, search, params],
        enabled: Boolean(slug || search),
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

    const handleFilterChange = (nextFilters) => {
        setFilters(nextFilters);
    };

    const clearFilters = () => {
        setFilters(initialFilters);
    };

    const selectedFilters = [];

    if (filters.price) {
        const priceLabels = {
            "0-5": {
                en: "0 – 5 KWD",
                ar: "٠ – ٥ د.ك",
            },
            "5-10": {
                en: "5 – 10 KWD",
                ar: "٥ – ١٠ د.ك",
            },
            "10-15": {
                en: "10 – 15 KWD",
                ar: "١٠ – ١٥ د.ك",
            },
            "15-100": {
                en: "15 – 100 KWD",
                ar: "١٥ – ١٠٠ د.ك",
            },
        };

        const price = priceLabels[filters.price];

        if (price) {
            selectedFilters.push({
                type: "price",
                value: filters.price,
                label: price[language],
            });
        }
    }

    filters.size.forEach((size) => {
        selectedFilters.push({
            type: "size",
            value: size,
            label:
                size === "small"
                    ? isArabic
                        ? "صغير"
                        : "Small"
                    : isArabic
                      ? "متوسط"
                      : "Medium",
        });
    });

    const removeFilter = (type, value) => {
        if (type === "price") {
            setFilters((current) => ({
                ...current,
                price: null,
            }));

            return;
        }

        if (type === "size") {
            setFilters((current) => ({
                ...current,
                size: current.size.filter((item) => item !== value),
            }));
        }
    };

    return (
        <main className="bg-background pb-16 md:pb-0">
            {/* Page header */}
            <section className="border-b border-border bg-secondary/30 pt-28 pb-8 md:pt-32 md:pb-10">
                <div className="wrapper">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                        {isArabic ? "مجموعتنا" : "Our collection"}
                    </p>

                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-[-0.04em] text-foreground md:text-4xl xl:text-5xl">
                                {slug
                                    ? (cakesResponse?.data?.[0]?.category?.[0]?.name?.[language] || "Category")
                                    : search
                                      ? isArabic
                                          ? `نتائج البحث عن “${search}”`
                                          : `Search results for “${search}”`
                                      : "Explore our cakes"}
                            </h1>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground md:text-base">
                                {isArabic
                                    ? "اختر من مجموعتنا من الكعكات المصنوعة لكل مناسبة."
                                    : "Browse our collection of cakes crafted for every occasion."}
                            </p>
                        </div>

                        {/* Mobile filters */}
                        <Sheet
                            open={mobileFiltersOpen}
                            onOpenChange={setMobileFiltersOpen}
                        >
                            <SheetTrigger asChild>
                                <Button
                                    type="button"
                                    variant="outline-asymmetric"
                                    size="sm"
                                    className="shrink-0 px-8 py-5 md:hidden"
                                >
                                    <Filter className="size-4" />
                                    {isArabic ? "تصفية" : "Filters"}
                                </Button>
                            </SheetTrigger>

                            <SheetContent
                                side={isArabic ? "left" : "right"}
                                className="w-[min(90vw,380px)] overflow-y-auto p-0"
                            >
                                <SheetHeader className="border-b border-border px-5 py-5 text-start">
                                    <SheetTitle>
                                        {isArabic
                                            ? "تصفية المنتجات"
                                            : "Filter products"}
                                    </SheetTitle>

                                    <SheetDescription>
                                        {isArabic
                                            ? "اختر ما يناسبك"
                                            : "Refine your selection"}
                                    </SheetDescription>
                                </SheetHeader>

                                <div className="px-5">
                                    <ProductFilters
                                        filters={filters}
                                        onFilterChange={handleFilterChange}
                                    />
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </section>

            {/* Product section */}
            <section className="py-8 md:py-10">
                <div className="wrapper">
                    <div className="flex items-start gap-8">
                        {/* Desktop filters */}
                        <aside className="hidden w-60 shrink-0 md:block xl:w-64">
                            <div className="sticky top-24 rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card p-5 shadow-sm">
                                <ProductFilters
                                    filters={filters}
                                    onFilterChange={handleFilterChange}
                                />
                            </div>
                        </aside>

                        {/* Products */}
                        <div className="min-w-0 flex-1">
                            {/* Toolbar */}
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-bold text-foreground">
                                        {cakes.length}
                                    </span>{" "}
                                    {isArabic ? "منتج" : "products"}
                                </p>

                                <div className="flex items-center gap-2">
                                    <span className="hidden text-xs font-medium text-muted-foreground md:block">
                                        {isArabic ? "ترتيب حسب" : "Sort by"}
                                    </span>

                                    <Select
                                        value={sort}
                                        onValueChange={setSort}
                                    >
                                        <SelectTrigger className="h-9 w-36 rounded-none rounded-tl-xl rounded-br-xl bg-card text-xs md:w-40">
                                            <SelectValue />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="featured">
                                                {isArabic ? "مميز" : "Featured"}
                                            </SelectItem>

                                            <SelectItem value="price-low">
                                                {isArabic
                                                    ? "السعر: الأقل"
                                                    : "Price: Low to high"}
                                            </SelectItem>

                                            <SelectItem value="price-high">
                                                {isArabic
                                                    ? "السعر: الأعلى"
                                                    : "Price: High to low"}
                                            </SelectItem>

                                            <SelectItem value="name">
                                                {isArabic ? "الاسم" : "Name"}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Selected filters */}
                            {selectedFilters.length > 0 && (
                                <div className="mb-6 flex flex-wrap items-center gap-2">
                                    <span className="me-1 text-xs font-semibold text-muted-foreground">
                                        {isArabic
                                            ? "الفلاتر المحددة:"
                                            : "Selected:"}
                                    </span>

                                    {selectedFilters.map((filter) => (
                                        <button
                                            key={`${filter.type}-${filter.value}`}
                                            type="button"
                                            onClick={() =>
                                                removeFilter(
                                                    filter.type,
                                                    filter.value,
                                                )
                                            }
                                            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/30 hover:bg-secondary hover:text-primary"
                                        >
                                            {filter.label}

                                            <X className="size-3 text-muted-foreground transition-colors group-hover:text-primary" />
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="ms-1 text-xs font-semibold text-primary hover:text-primary/70"
                                    >
                                        {isArabic ? "مسح الكل" : "Clear all"}
                                    </button>
                                </div>
                            )}

                            {/* Loading */}
                            {isLoading && (
                                <div className="flex min-h-80 items-center justify-center">
                                    <Loader2 className="size-7 animate-spin text-primary" />
                                </div>
                            )}

                            {/* Error */}
                            {!isLoading && isError && (
                                <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                                    <h2 className="text-lg font-bold text-foreground">
                                        {isArabic
                                            ? "تعذر تحميل الكعكات"
                                            : "Unable to load cakes"}
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                        {isArabic
                                            ? "حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى."
                                            : "Something went wrong while loading the products. Please try again."}
                                    </p>
                                </div>
                            )}

                            {/* Product grid */}
                            {!isLoading && !isError && cakes.length > 0 && (
                                <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
                                    {cakes.map((cake) => {
                                        const price =
                                            cake.discountedPrice ?? cake.price;

                                        const hasDiscount =
                                            cake.discountedPrice != null &&
                                            cake.discountedPrice < cake.price;

                                        const image =
                                            cake.images?.[0]?.url || "";

                                        return (
                                            <Link
                                                to={`/cake/${cake.slug}`}
                                                key={cake._id}
                                                className="group flex flex-col overflow-hidden rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
                                            >
                                                <div className="relative aspect-square overflow-hidden bg-secondary">
                                                    {image ? (
                                                        <img
                                                            src={image}
                                                            alt={
                                                                cake.name?.[
                                                                    language
                                                                ] || ""
                                                            }
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
                                                                ((cake.price -
                                                                    price) /
                                                                    cake.price) *
                                                                    100,
                                                            )}
                                                            %
                                                        </span>
                                                    )}

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

                                                <div className="flex flex-1 flex-col p-4 md:p-5">
                                                    {cake.category?.name && (
                                                        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
                                                            {
                                                                cake.category
                                                                    .name[
                                                                    language
                                                                ]
                                                            }
                                                        </p>
                                                    )}

                                                    <h3 className="line-clamp-2 min-h-10 text-sm font-bold tracking-tight text-card-foreground md:text-base">
                                                        {cake.name?.[language]}
                                                    </h3>

                                                    <div className="mt-auto flex items-center justify-between gap-2 pt-4">
                                                        <div className="flex min-w-0 items-baseline gap-1.5">
                                                            <span className="text-lg font-extrabold tracking-tight text-foreground md:text-xl">
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
                                                            size="icon"
                                                            aria-label="Add to cart"
                                                            disabled={
                                                                isAddingToCart &&
                                                                pendingCakeId ===
                                                                    cake._id
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
                                                            pendingCakeId ===
                                                                cake._id ? (
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

                            {/* Empty */}
                            {!isLoading && !isError && cakes.length === 0 && (
                                <div className="rounded-none rounded-tl-3xl rounded-br-3xl border border-border bg-card px-6 py-16 text-center">
                                    <h2 className="text-lg font-bold text-foreground">
                                        {isArabic
                                            ? "لم يتم العثور على كعكات"
                                            : "No cakes found"}
                                    </h2>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                                        {search
                                            ? isArabic
                                                ? `لا توجد نتائج لـ "${search}".`
                                                : `No results found for “${search}”.`
                                            : isArabic
                                              ? "لا توجد كعكات متاحة في هذه الفئة."
                                              : "There are no cakes available in this category."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {cakes.length > 0 && (
                <HotDeals />
            )}
        </main>
    );
};

export default Products;
