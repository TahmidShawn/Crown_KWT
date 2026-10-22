import { useState } from "react";
import {
    ChevronRight,
    Clock3,
    Home,
    Loader2,
    Minus,
    PackageCheck,
    Plus,
    ShoppingCart,
    Star,
    Tag,
    Users,
} from "lucide-react";
import { Link, useParams, useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import useGet from "@/hooks/useGet";
import useAddToCart from "@/hooks/useAddToCart";
import useAuth from "@/hooks/useAuth";
import { useGetMyCakeReview } from "@/hooks/useReviews";

import ProductGallery from "./ProductGallery";
import ProductAddOns from "./ProductAddOns";
import ProductReviews from "./ProductReviews";
import ReviewFormModal from "./ReviewFormModal";
import { PageTitle } from "@/components/shared/PageTitle";
import { normalizeFlavors } from "@/utils/flavor";

const flavorLabels = {
    chocolate: {
        en: "Chocolate",
        ar: "شوكولاتة",
    },
    vanilla: {
        en: "Vanilla",
        ar: "فانيليا",
    },
    "red-velvet": {
        en: "Red Velvet",
        ar: "ريد فلفت",
    },
    strawberry: {
        en: "Strawberry",
        ar: "فراولة",
    },
    carrot: {
        en: "Carrot",
        ar: "جزر",
    },
    butterscotch: {
        en: "Butterscotch",
        ar: "باترسكوتش",
    },
    "black-forest": {
        en: "Black Forest",
        ar: "بلاك فورست",
    },
    lemon: {
        en: "Lemon",
        ar: "ليمون",
    },
    mango: {
        en: "Mango",
        ar: "مانجو",
    },
    pistachio: {
        en: "Pistachio",
        ar: "فستق",
    },
};

const sizeLabels = {
    small: {
        en: "Small",
        ar: "صغير",
    },
    medium: {
        en: "Medium",
        ar: "متوسط",
    },
};

const ProductDetails = () => {
    const { language } = useLanguage();
    const { slug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("reviews");
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

    const {
        data: cakeResponse,
        isLoading,
        isError,
    } = useGet({
        url: `/cakes/${slug}`,
        queryKey: ["cake", slug],
        enabled: Boolean(slug),
    });

    const { addToCart, isPending: isAddingToCart } = useAddToCart();

    const {
        data: myReviewResponse,
        isLoading: isMyReviewLoading,
    } = useGetMyCakeReview({
        slug,
        enabled: Boolean(slug) && isAuthenticated,
    });

    const myReview = myReviewResponse?.data || null;

    // The button stays locked until we know the user has not reviewed yet.
    const hasReviewed = Boolean(myReview);
    const isReviewStateLoading = isAuthLoading || isMyReviewLoading;
    const canReview = !hasReviewed && !isReviewStateLoading;

    const product = cakeResponse?.data;
    const isArabic = language === "ar";

    if (isLoading) {
        return (
            <main className="bg-background pb-16 md:pb-0">
                <section className="pt-24 md:pt-28">
                    <div className="wrapper flex min-h-[50vh] items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            {isArabic
                                ? "جاري تحميل الكعكة..."
                                : "Loading cake..."}
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    if (isError || !product) {
        return (
            <main className="bg-background pb-16 md:pb-0">
                <section className="pt-24 md:pt-28">
                    <div className="wrapper flex min-h-[50vh] items-center justify-center">
                        <p className="text-sm text-destructive">
                            {isArabic
                                ? "لم يتم العثور على الكعكة."
                                : "Cake not found."}
                        </p>
                    </div>
                </section>
            </main>
        );
    }

    const flavor =
        normalizeFlavors(product.flavor)
            .map((f) => flavorLabels[f]?.[language] ?? f)
            .join(", ") || "-";

    const size =
        sizeLabels[product.weightSize]?.[language] ?? product.weightSize;

    const originalPrice = Number(product.price);

    const discountedPrice =
        product.discountPercentage > 0
            ? originalPrice - (originalPrice * product.discountPercentage) / 100
            : originalPrice;

    const increaseQuantity = () => {
        setQuantity((current) => Math.min(current + 1, product.stock));
    };

    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(current - 1, 1));
    };

    const handleAddToCart = () => {
        if (isOutOfStock || isAddingToCart) {
            return;
        }

        addToCart(product._id, quantity);
    };

    const handleWriteReview = () => {
        if (hasReviewed) {
            toast.error(
                isArabic
                    ? "لقد قيّمت هذه الكعكة بالفعل. يمكنك كتابة مراجعة واحدة فقط لكل كعكة."
                    : "You have already reviewed this cake. You can leave only one review per cake.",
            );

            return;
        }

        if (!isAuthenticated) {
            toast.error(
                isArabic
                    ? "يرجى تسجيل الدخول لكتابة مراجعة"
                    : "Please log in to write a review",
            );

            navigate("/auth/login", {
                replace: true,
                state: { from: location },
            });

            return;
        }

        setIsReviewModalOpen(true);
    };

    const isOutOfStock = product.stock <= 0;

    return (
        <>
            <PageTitle
                title={
                    product?.name?.[isArabic ? "ar" : "en"] ||
                    (isArabic ? "تفاصيل المنتج" : "Product Details")
                }
                description={
                    isArabic
                        ? "استكشف كعكة لذيذة من Crown Kwt وأدرك خيارات التخصيص المتاحة."
                        : "Explore a delicious cake from Crown Kwt and discover customization options."
                }
            />
            <main className="bg-background pb-16 md:pb-0">
            
            <section className="pt-12">
                <div className="wrapper">
                    <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-none rounded-tl-2xl rounded-br-2xl border border-border bg-secondary/40 px-4 text-xs">
                        <Home className="size-3.5 shrink-0 text-primary" />

                        <ChevronRight className="size-3 shrink-0 text-muted-foreground rtl:rotate-180" />

                        <span className="shrink-0 text-muted-foreground">
                            {isArabic ? "الكعكات" : "Cakes"}
                        </span>

                        <ChevronRight className="size-3 shrink-0 text-muted-foreground rtl:rotate-180" />

                        {product.category?.slug ? (
                            <Link
                                to={`/category/${product.category.slug}`}
                                className="shrink-0 font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
                                title={product.category?.name?.[language]}
                            >
                                {product.category?.name?.[language]}
                            </Link>
                        ) : (
                            <span className="shrink-0 text-muted-foreground">
                                {product.category?.name?.[language]}
                            </span>
                        )}

                        <ChevronRight className="size-3 shrink-0 text-muted-foreground rtl:rotate-180" />

                        <span className="truncate font-semibold text-foreground">
                            {product.name[language]}
                        </span>
                    </div>
                </div>
            </section>

            
            <section className="py-8 md:py-12 xl:py-14">
                <div className="wrapper">
                    <div className="flex flex-col gap-8 md:gap-10 xl:flex-row xl:items-start xl:gap-14">
                        <div className="xl:w-[54%]">
                            <ProductGallery product={product} />
                        </div>

                        <div className="xl:w-[46%]">
                            
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                                    {product.category.name[language]}
                                </span>

                                {product.isFeatured && (
                                    <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold text-primary">
                                        {isArabic ? "مميز" : "Featured"}
                                    </span>
                                )}
                            </div>

                            
                            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-foreground md:text-4xl xl:text-5xl">
                                {product.name[language]}
                            </h1>

                            
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-1.5">
                                    <Star className="size-4 fill-primary text-primary" />

                                    <span className="text-sm font-bold">
                                        {Number(product.avgRating).toFixed(1)}
                                    </span>

                                    <span className="text-sm text-muted-foreground">
                                        ({product.numReviews}{" "}
                                        {isArabic ? "مراجعة" : "reviews"})
                                    </span>
                                </div>

                                <span className="h-4 w-px bg-border" />

                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                        product.stock > 0
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                            : "bg-destructive/10 text-destructive"
                                    }`}
                                >
                                    <span
                                        className={`size-1.5 rounded-full ${
                                            product.stock > 0
                                                ? "bg-emerald-500"
                                                : "bg-destructive"
                                        }`}
                                    />

                                    {product.stock > 0
                                        ? isArabic
                                            ? "متوفر"
                                            : "In stock"
                                        : isArabic
                                          ? "غير متوفر"
                                          : "Out of stock"}
                                </span>
                            </div>

                            
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                                {product.description[language]}
                            </p>

                            
                            <div className="mt-6 flex flex-wrap items-end gap-3 border-y border-border py-5">
                                <span
                                    dir="ltr"
                                    className="text-2xl font-black tracking-tight text-foreground md:text-3xl"
                                >
                                    {discountedPrice.toFixed(3)} KWD
                                </span>

                                {product.discountPercentage > 0 && (
                                    <>
                                        <span
                                            dir="ltr"
                                            className="text-sm text-muted-foreground line-through"
                                        >
                                            {originalPrice.toFixed(3)} KWD
                                        </span>

                                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary">
                                            {isArabic
                                                ? `خصم ${product.discountPercentage}%`
                                                : `${product.discountPercentage}% OFF`}
                                        </span>
                                    </>
                                )}
                            </div>

                            
                            <div className="grid grid-cols-2 gap-3 py-5 md:grid-cols-3">
                                <ProductAttribute
                                    icon={PackageCheck}
                                    label={isArabic ? "الحجم" : "Size"}
                                    value={size}
                                />

                                <ProductAttribute
                                    icon={Users}
                                    label={isArabic ? "الحصص" : "Servings"}
                                    value={product.servings}
                                    dir="ltr"
                                />

                                <ProductAttribute
                                    icon={Clock3}
                                    label={isArabic ? "النكهة" : "Flavor"}
                                    value={flavor}
                                />
                            </div>

                            
                            <div className="mt-2 border-t border-border pt-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.14em]">
                                            {isArabic ? "الكمية" : "Quantity"}
                                        </p>

                                        {product.stock > 0 && (
                                            <p className="mt-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                {isArabic
                                                    ? `${product.stock} متوفر`
                                                    : `${product.stock} available`}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex h-10 items-center rounded-none rounded-tl-xl rounded-br-xl border border-border bg-card">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={
                                                quantity <= 1 ||
                                                isOutOfStock ||
                                                isAddingToCart
                                            }
                                            onClick={decreaseQuantity}
                                            className="size-9 rounded-none"
                                        >
                                            <Minus className="size-3.5" />
                                        </Button>

                                        <span
                                            dir="ltr"
                                            className="w-8 text-center text-sm font-bold"
                                        >
                                            {quantity}
                                        </span>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            disabled={
                                                quantity >= product.stock ||
                                                isOutOfStock ||
                                                isAddingToCart
                                            }
                                            onClick={increaseQuantity}
                                            className="size-9 rounded-none"
                                        >
                                            <Plus className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    variant="asymmetric"
                                    size="lg"
                                    disabled={isOutOfStock || isAddingToCart}
                                    onClick={handleAddToCart}
                                    className="mt-5 h-12 w-full gap-3 text-sm font-bold"
                                >
                                    {isAddingToCart ? (
                                        <>
                                            <Loader2 className="size-4 animate-spin" />

                                            {isArabic
                                                ? "جاري الإضافة..."
                                                : "Adding..."}
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="size-4" />

                                            {isOutOfStock
                                                ? isArabic
                                                    ? "غير متوفر"
                                                    : "Out of stock"
                                                : isArabic
                                                  ? "أضف إلى السلة"
                                                  : "Add to cart"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            
            <ProductAddOns />

            
            <section className="border-t border-border py-10 md:py-14">
                <div className="wrapper">
                    
                    <div className="flex border-b border-border">
                        <button
                            type="button"
                            onClick={() => setActiveTab("description")}
                            className={`relative px-1 pb-4 text-sm font-bold transition-colors ${
                                activeTab === "description"
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isArabic ? "الوصف" : "Description"}

                            {activeTab === "description" && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("reviews")}
                            className={`relative ms-8 px-1 pb-4 text-sm font-bold transition-colors ${
                                activeTab === "reviews"
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {isArabic
                                ? `المراجعات (${product.numReviews})`
                                : `Reviews (${product.numReviews})`}

                            {activeTab === "reviews" && (
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>

                    
                    <div className="pt-8">
                        {activeTab === "description" ? (
                            <div className="max-w-3xl">
                                <h2 className="text-xl font-black tracking-tight md:text-2xl">
                                    {isArabic
                                        ? "عن هذه الكعكة"
                                        : "About this cake"}
                                </h2>

                                <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                                    {product.description[language]}
                                </p>

                                {product.tags?.length > 0 && (
                                    <div className="mt-6 flex flex-wrap items-center gap-2">
                                        <Tag className="me-1 size-4 text-primary" />

                                        {product.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-3">
                                    <Detail
                                        label={isArabic ? "الفئة" : "Category"}
                                        value={product.category.name[language]}
                                    />

                                    <Detail
                                        label={isArabic ? "النكهة" : "Flavor"}
                                        value={flavor}
                                    />

                                    <Detail
                                        label={isArabic ? "الحجم" : "Size"}
                                        value={size}
                                    />

                                    <Detail
                                        label={isArabic ? "الحصص" : "Servings"}
                                        value={product.servings}
                                    />

                                    <Detail
                                        label={isArabic ? "التقييم" : "Rating"}
                                        value={`${Number(
                                            product.avgRating,
                                        ).toFixed(1)} / 5`}
                                    />

                                    <Detail
                                        label={
                                            isArabic ? "المراجعات" : "Reviews"
                                        }
                                        value={product.numReviews}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-5xl">
                                <ProductReviews
                                    slug={slug}
                                    canReview={canReview}
                                    hasReviewed={hasReviewed}
                                    onWriteReview={handleWriteReview}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <ReviewFormModal
                open={isReviewModalOpen}
                onOpenChange={setIsReviewModalOpen}
                slug={slug}
                cakeName={product?.name?.[isArabic ? "ar" : "en"]}
            />
        </main>
        </>
    );
};

const ProductAttribute = ({ icon: Icon, label, value, dir }) => {
    return (
        <div className="rounded-none rounded-tl-xl rounded-br-xl border border-border bg-card p-3">
            <div className="flex items-center gap-2 text-primary">
                <Icon className="size-4" />

                <span className="text-[10px] font-bold uppercase tracking-wider">
                    {label}
                </span>
            </div>

            <p dir={dir} className="mt-2 text-sm font-bold text-foreground">
                {value}
            </p>
        </div>
    );
};

const Detail = ({ label, value }) => {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                {label}
            </p>

            <p className="mt-1.5 text-sm font-semibold text-foreground">
                {value}
            </p>
        </div>
    );
};

export default ProductDetails;
