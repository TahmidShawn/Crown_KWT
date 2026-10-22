import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, Package, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

import useAutoTranslate from "@/hooks/useAutoTranslate";
import useGet from "@/hooks/useGet";
import usePost from "@/hooks/usePost";

const MAX_IMAGES = 5;

const availableTags = [
    "birthday",
    "wedding",
    "anniversary",
    "celebration",
    "gift",
    "kids",
    "premium",
    "luxury",
    "bestseller",
    "new",
    "party",
    "family",
    "romantic",
    "elegant",
    "special-occasion",
    "dessert",
    "sweet",
    "custom",
    "popular",
    "festive",
];

const flavors = [
    { value: "chocolate", label: "Chocolate" },
    { value: "vanilla", label: "Vanilla" },
    { value: "red-velvet", label: "Red Velvet" },
    { value: "strawberry", label: "Strawberry" },
    { value: "carrot", label: "Carrot" },
    { value: "butterscotch", label: "Butterscotch" },
    { value: "black-forest", label: "Black Forest" },
    { value: "lemon", label: "Lemon" },
    { value: "mango", label: "Mango" },
    { value: "pistachio", label: "Pistachio" },
];

const cakeSchema = z.object({
    nameEn: z
        .string()
        .trim()
        .min(3, "English name must be at least 3 characters")
        .max(150, "English name cannot exceed 150 characters"),

    nameAr: z
        .string()
        .trim()
        .min(3, "Arabic name must be at least 3 characters")
        .max(150, "Arabic name cannot exceed 150 characters"),

    descriptionEn: z
        .string()
        .trim()
        .min(10, "English description must be at least 10 characters")
        .max(1000, "English description cannot exceed 1000 characters"),

    descriptionAr: z
        .string()
        .trim()
        .min(10, "Arabic description must be at least 10 characters")
        .max(1000, "Arabic description cannot exceed 1000 characters"),

    category: z.string().min(1, "Category is required"),

    flavor: z
        .array(z.string())
        .min(1, "Please select at least one cake flavor")
        .max(5, "You can select up to 5 cake flavors"),

    weightSize: z.enum(["small", "medium"]),

    price: z
        .string()
        .regex(
            /^\d+(\.\d{1,3})?$/,
            "Price must be a valid KWD amount with up to 3 decimal places",
        ),

    discountPercentage: z
        .string()
        .regex(/^\d+(\.\d+)?$/, "Discount must be a valid percentage")
        .refine(
            (value) => Number(value) >= 0 && Number(value) <= 100,
            "Discount must be between 0 and 100",
        ),

    stock: z.string().regex(/^\d+$/, "Stock must be a valid integer"),

    tags: z.array(z.string()).max(3, "You can select up to 3 tags"),

    images: z
        .array(z.instanceof(File))
        .min(1, "At least one cake image is required"),
});

export default function AddCakes() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [imagePreviews, setImagePreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        clearErrors,
        control,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(cakeSchema),
        defaultValues: {
            nameEn: "",
            nameAr: "",
            descriptionEn: "",
            descriptionAr: "",
            category: "",
            flavor: [],
            weightSize: "medium",
            price: "",
            discountPercentage: "0",
            stock: "",
            tags: [],
            images: [],
        },
    });

    const nameEn = watch("nameEn");
    const descriptionEn = watch("descriptionEn");
    const images = watch("images");
    const selectedTags = watch("tags");
    const selectedFlavors = watch("flavor") || [];

    const { data: categoriesResponse, isPending: isCategoriesLoading } = useGet(
        {
            url: "/categories",
            queryKey: ["categories"],
        },
    );

    const categories = categoriesResponse?.data ?? [];

    const {
        translatedValue: translatedName,
        isTranslating: isTranslatingName,
        error: nameTranslationError,
    } = useAutoTranslate({
        value: nameEn,
        sourceLanguage: "en",
        targetLanguage: "ar",
        delay: 700,
    });

    const {
        translatedValue: translatedDescription,
        isTranslating: isTranslatingDescription,
        error: descriptionTranslationError,
    } = useAutoTranslate({
        value: descriptionEn,
        sourceLanguage: "en",
        targetLanguage: "ar",
        delay: 700,
    });

    const { mutate: createCake, isPending } = usePost({
        url: "/admin/cakes",
    });

    useEffect(() => {
        if (!nameEn?.trim()) {
            setValue("nameAr", "", {
                shouldDirty: false,
                shouldValidate: false,
            });

            clearErrors("nameAr");
            return;
        }

        if (translatedName) {
            setValue("nameAr", translatedName, {
                shouldDirty: true,
                shouldValidate: false,
            });

            clearErrors("nameAr");
        }
    }, [nameEn, translatedName, setValue, clearErrors]);

    useEffect(() => {
        if (!descriptionEn?.trim()) {
            setValue("descriptionAr", "", {
                shouldDirty: false,
                shouldValidate: false,
            });

            clearErrors("descriptionAr");
            return;
        }

        if (translatedDescription) {
            setValue("descriptionAr", translatedDescription, {
                shouldDirty: true,
                shouldValidate: false,
            });

            clearErrors("descriptionAr");
        }
    }, [descriptionEn, translatedDescription, setValue, clearErrors]);

    useEffect(() => {
        if (nameTranslationError) {
            toast.error("Translation failed", {
                description:
                    "Arabic cake name could not be generated. You can enter it manually.",
            });
        }
    }, [nameTranslationError]);

    useEffect(() => {
        if (descriptionTranslationError) {
            toast.error("Translation failed", {
                description:
                    "Arabic description could not be generated. You can enter it manually.",
            });
        }
    }, [descriptionTranslationError]);

    useEffect(() => {
        if (!images?.length) {
            setImagePreviews([]);
            return;
        }

        const previews = images.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setImagePreviews(previews);

        return () => {
            previews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [images]);

    const fieldClasses =
        "!h-12 w-full min-w-0 rounded-xl px-4 text-[15px] shadow-none";

    const selectClasses =
        "!h-12 !w-full min-w-0 rounded-xl !px-4 !py-0 text-[15px] !leading-none shadow-none";

    const sectionClasses = "rounded-2xl border bg-card";

    const isTranslating = isTranslatingName || isTranslatingDescription;

    const isSubmitting = isPending || isTranslating;

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (!files.length) {
            return;
        }

        const currentImages = watch("images") || [];
        const nextImages = [...currentImages, ...files];

        if (nextImages.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        }

        setValue("images", nextImages.slice(0, MAX_IMAGES), {
            shouldDirty: true,
            shouldValidate: true,
        });

        clearErrors("images");
        event.target.value = "";
    };

    const handleDrop = (event) => {
        event.preventDefault();
        setIsDragging(false);

        const files = Array.from(event.dataTransfer.files || []).filter(
            (file) => file.type.startsWith("image/"),
        );

        if (!files.length) {
            toast.error("Please select valid image files");
            return;
        }

        const currentImages = watch("images") || [];
        const nextImages = [...currentImages, ...files];

        if (nextImages.length > MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        }

        setValue("images", nextImages.slice(0, MAX_IMAGES), {
            shouldDirty: true,
            shouldValidate: true,
        });

        clearErrors("images");
    };

    const handleRemoveImage = (index) => {
        const currentImages = watch("images") || [];

        const nextImages = currentImages.filter(
            (_, imageIndex) => imageIndex !== index,
        );

        setValue("images", nextImages, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleTagChange = (tag) => {
        const currentTags = selectedTags || [];

        if (currentTags.includes(tag)) {
            setValue(
                "tags",
                currentTags.filter((item) => item !== tag),
                {
                    shouldDirty: true,
                    shouldValidate: true,
                },
            );

            return;
        }

        if (currentTags.length >= 3) {
            toast.error("Maximum 3 SEO tags allowed");
            return;
        }

        setValue("tags", [...currentTags, tag], {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleFlavorChange = (flavor) => {
        const currentFlavors = selectedFlavors || [];

        if (currentFlavors.includes(flavor)) {
            setValue(
                "flavor",
                currentFlavors.filter((item) => item !== flavor),
                {
                    shouldDirty: true,
                    shouldValidate: true,
                },
            );

            return;
        }

        if (currentFlavors.length >= 5) {
            toast.error("Maximum 5 cake flavors allowed");
            return;
        }

        setValue("flavor", [...currentFlavors, flavor], {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const handleCreateCake = (formData) => {
        const data = new FormData();

        data.append("nameEn", formData.nameEn.trim());
        data.append("nameAr", formData.nameAr.trim());
        data.append("descriptionEn", formData.descriptionEn.trim());
        data.append("descriptionAr", formData.descriptionAr.trim());

        data.append("category", formData.category);
        data.append("flavor", formData.flavor.join(","));
        data.append("weightSize", formData.weightSize);
        data.append("price", formData.price);
        data.append("discountPercentage", formData.discountPercentage || "0");
        data.append("stock", formData.stock);

        if (formData.tags.length) {
            data.append("tags", formData.tags.join(","));
        }

        formData.images.forEach((file) => {
            data.append("images", file);
        });

        createCake(data, {
            onSuccess: (response) => {
                toast.success("Cake created", {
                    description:
                        response?.message || "Cake created successfully.",
                });

                // The admin list is sorted newest first, so invalidate it to
                // refetch and surface the new cake at the top of the table.
                // `refetchType: "all"` also refreshes the cached entry when the
                // list is not currently mounted.
                queryClient.invalidateQueries({
                    queryKey: ["admin", "cakes"],
                    refetchType: "all",
                });

                // Public listings are cached under the "cakes" prefix, so
                // drop them as well to keep the storefront in sync.
                queryClient.invalidateQueries({ queryKey: ["cakes"] });

                navigate("/admin/cakes");
            },

            onError: (error) => {
                toast.error("Failed to create cake", {
                    description:
                        error?.response?.data?.message ||
                        error?.message ||
                        "Something went wrong. Please try again.",
                });
            },
        });
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button
                        asChild
                        variant="outline-asymmetric"
                        size="icon"
                        className="size-11 shrink-0"
                    >
                        <Link to="/admin/cakes">
                            <ArrowLeft className="size-5" />
                        </Link>
                    </Button>

                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Add Cake
                        </h1>

                        <p className="text-sm text-muted-foreground">
                            Create a new cake product for your store.
                        </p>
                    </div>
                </div>
            </div>

            <form
                onSubmit={handleSubmit(handleCreateCake)}
                className="space-y-6"
            >
                <section className={sectionClasses}>
                    <div className="border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <ImagePlus className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">Cake Images</h2>

                                <p className="text-sm text-muted-foreground">
                                    Upload up to {MAX_IMAGES} product images.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div
                            onDragOver={(event) => {
                                event.preventDefault();
                                setIsDragging(true);
                            }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/20"
                            }`}
                        >
                            <input
                                id="images"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            <label
                                htmlFor="images"
                                className="flex cursor-pointer flex-col items-center"
                            >
                                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                                    <ImagePlus className="size-6 text-muted-foreground" />
                                </div>

                                <p className="font-medium">
                                    Click to upload or drag and drop
                                </p>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    PNG, JPG, WEBP up to {MAX_IMAGES} images
                                </p>
                            </label>
                        </div>

                        {errors.images && (
                            <p className="mt-2 text-sm text-destructive">
                                {errors.images.message}
                            </p>
                        )}

                        {imagePreviews.length > 0 && (
                            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {imagePreviews.map((preview, index) => (
                                    <div
                                        key={`${preview.file.name}-${index}`}
                                        className="group relative aspect-square overflow-hidden rounded-2xl border bg-muted"
                                    >
                                        <img
                                            src={preview.url}
                                            alt={`Cake preview ${index + 1}`}
                                            className="size-full object-cover"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveImage(index)
                                            }
                                            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100"
                                        >
                                            <X className="size-4" />
                                        </button>

                                        {index === 0 && (
                                            <span className="absolute bottom-2 left-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                                                Main image
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                <section className={sectionClasses}>
                    <div className="border-b p-6">
                        <h2 className="font-semibold">Basic Information</h2>

                        <p className="text-sm text-muted-foreground">
                            Add the cake name and description.
                        </p>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="nameEn">Cake Name (English)</Label>

                            <Input
                                id="nameEn"
                                placeholder="Enter cake name"
                                className={fieldClasses}
                                {...register("nameEn")}
                            />

                            {errors.nameEn && (
                                <p className="text-sm text-destructive">
                                    {errors.nameEn.message}
                                </p>
                            )}

                            {isTranslatingName && (
                                <p className="text-xs text-muted-foreground">
                                    Translating to Arabic...
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nameAr">Cake Name (Arabic)</Label>

                            <Input
                                id="nameAr"
                                dir="rtl"
                                placeholder="اسم الكيك"
                                className={fieldClasses}
                                {...register("nameAr")}
                            />

                            {errors.nameAr && (
                                <p className="text-sm text-destructive">
                                    {errors.nameAr.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descriptionEn">
                                Description (English)
                            </Label>

                            <Textarea
                                id="descriptionEn"
                                placeholder="Describe the cake..."
                                className="min-h-32 rounded-xl px-4 py-3 text-[15px] shadow-none"
                                {...register("descriptionEn")}
                            />

                            {errors.descriptionEn && (
                                <p className="text-sm text-destructive">
                                    {errors.descriptionEn.message}
                                </p>
                            )}

                            {isTranslatingDescription && (
                                <p className="text-xs text-muted-foreground">
                                    Translating to Arabic...
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descriptionAr">
                                Description (Arabic)
                            </Label>

                            <Textarea
                                id="descriptionAr"
                                dir="rtl"
                                placeholder="وصف الكيك..."
                                className="min-h-32 rounded-xl px-4 py-3 text-[15px] shadow-none"
                                {...register("descriptionAr")}
                            />

                            {errors.descriptionAr && (
                                <p className="text-sm text-destructive">
                                    {errors.descriptionAr.message}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className={sectionClasses}>
                    <div className="border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Tag className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Classification
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Categorize and classify the cake.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>

                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => {
                                    const selectedCategory = categories.find(
                                        (category) =>
                                            String(category._id) ===
                                            String(field.value),
                                    );

                                    return (
                                        <Select
                                            value={
                                                field.value
                                                    ? String(field.value)
                                                    : undefined
                                            }
                                            onValueChange={field.onChange}
                                            disabled={isCategoriesLoading}
                                        >
                                            <SelectTrigger
                                                id="category"
                                                className={selectClasses}
                                            >
                                                <span className="truncate">
                                                    {isCategoriesLoading
                                                        ? "Loading categories..."
                                                        : selectedCategory
                                                          ? selectedCategory
                                                                .name?.en
                                                          : "Select category"}
                                                </span>
                                            </SelectTrigger>

                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category._id}
                                                        value={String(
                                                            category._id,
                                                        )}
                                                    >
                                                        {category.name?.en}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />

                            {errors.category && (
                                <p className="text-sm text-destructive">
                                    {errors.category.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="flavor">Flavor</Label>
                            <p className="text-xs text-muted-foreground">
                                Select between 1 and 5 flavors
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {flavors.map((flavor) => {
                                    const isSelected = selectedFlavors.includes(
                                        flavor.value,
                                    );

                                    return (
                                        <button
                                            key={flavor.value}
                                            type="button"
                                            onClick={() =>
                                                handleFlavorChange(flavor.value)
                                            }
                                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${isSelected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-background hover:bg-muted"}`}
                                        >
                                            {flavor.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {errors.flavor && (
                                <p className="text-sm text-destructive">
                                    {errors.flavor.message}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className={sectionClasses}>
                    <div className="border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Package className="size-5" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Pricing & Inventory
                                </h2>

                                <p className="text-sm text-muted-foreground">
                                    Set cake size, pricing and stock.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                            <Label htmlFor="weightSize">Cake Size</Label>

                            <Controller
                                name="weightSize"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value || undefined}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            id="weightSize"
                                            className={selectClasses}
                                        >
                                            <span>
                                                {field.value === "small"
                                                    ? "Small"
                                                    : "Medium"}
                                            </span>
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="small">
                                                Small
                                            </SelectItem>

                                            <SelectItem value="medium">
                                                Medium
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />

                            {errors.weightSize && (
                                <p className="text-sm text-destructive">
                                    {errors.weightSize.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Price (KWD)</Label>

                            <Input
                                id="price"
                                type="text"
                                inputMode="decimal"
                                placeholder="0.000"
                                className={fieldClasses}
                                {...register("price")}
                            />

                            {errors.price && (
                                <p className="text-sm text-destructive">
                                    {errors.price.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="discountPercentage">
                                Discount (%)
                            </Label>

                            <Input
                                id="discountPercentage"
                                type="text"
                                inputMode="decimal"
                                placeholder="0"
                                className={fieldClasses}
                                {...register("discountPercentage")}
                            />

                            {errors.discountPercentage && (
                                <p className="text-sm text-destructive">
                                    {errors.discountPercentage.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock">Stock</Label>

                            <Input
                                id="stock"
                                type="text"
                                inputMode="numeric"
                                placeholder="0"
                                className={fieldClasses}
                                {...register("stock")}
                            />

                            {errors.stock && (
                                <p className="text-sm text-destructive">
                                    {errors.stock.message}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className={sectionClasses}>
                    <div className="border-b p-6">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h2 className="font-semibold">SEO Tags</h2>

                                <p className="text-sm text-muted-foreground">
                                    Select up to 3 tags for better product
                                    discovery.
                                </p>
                            </div>

                            <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium">
                                {selectedTags.length}/3
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => {
                                const isSelected = selectedTags.includes(tag);

                                return (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => handleTagChange(tag)}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                                            isSelected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-background hover:bg-muted"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>

                        {errors.tags && (
                            <p className="mt-2 text-sm text-destructive">
                                {errors.tags.message}
                            </p>
                        )}
                    </div>
                </section>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        type="button"
                        variant="outline-asymmetric"
                        className="h-12 rounded-xl px-6"
                        onClick={() => navigate("/admin/cakes")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        variant="asymmetric"
                        className="h-12 px-8"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="size-4 animate-spin" />

                                {isTranslating
                                    ? "Translating..."
                                    : "Creating..."}
                            </>
                        ) : (
                            "Create Cake"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
