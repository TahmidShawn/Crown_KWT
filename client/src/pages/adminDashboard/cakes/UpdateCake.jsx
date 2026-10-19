import { zodResolver } from "@hookform/resolvers/zod";
import {
    ArrowLeft,
    ImagePlus,
    Loader2,
    Package,
    Tag,
    Upload,
    X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";

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
        .min(3, "English cake name must be at least 3 characters")
        .max(150, "English cake name cannot exceed 150 characters"),

    nameAr: z
        .string()
        .trim()
        .min(3, "Arabic cake name must be at least 3 characters")
        .max(150, "Arabic cake name cannot exceed 150 characters"),

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

    category: z.string().min(1, "Please select a category"),

    flavor: z.string().min(1, "Please select a flavor"),

    weightSize: z.enum(["small", "medium"], {
        message: "Please select a size",
    }),

    price: z
        .string()
        .trim()
        .regex(
            /^\d+(\.\d{1,3})?$/,
            "Enter a valid price with up to 3 decimal places",
        ),

    discountPercentage: z
        .string()
        .trim()
        .regex(
            /^(100|[0-9]{1,2})(\.\d+)?$/,
            "Enter a valid discount percentage",
        )
        .refine(
            (value) => Number(value) >= 0 && Number(value) <= 100,
            "Discount must be between 0 and 100",
        ),

    stock: z.string().trim().regex(/^\d+$/, "Stock must be a whole number"),

    tags: z.array(z.string()).max(3, "You can select up to 3 tags"),

    images: z.array(z.instanceof(File)).max(5, "Maximum 5 images allowed"),
});

const fieldClasses =
    "!h-12 w-full min-w-0 rounded-xl px-4 text-[15px] shadow-none";

const selectClasses =
    "!h-12 !w-full min-w-0 rounded-xl !px-4 !py-0 text-[15px] !leading-none shadow-none";

const sectionClasses = "rounded-2xl border bg-card";

export default function UpdateCake() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [existingImages, setExistingImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
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
            flavor: "",
            weightSize: "small",
            price: "",
            discountPercentage: "0",
            stock: "0",
            tags: [],
            images: [],
        },
    });

    const selectedImages = watch("images") || [];
    const selectedTags = watch("tags") || [];

    const {
        data: cakeResponse,
        isLoading: isLoadingCake,
        isError: isCakeError,
    } = useGet({
        url: `/cakes/${id}`,
        queryKey: ["cake", id],
        enabled: Boolean(id),
    });

    const { data: categoriesResponse, isLoading: isLoadingCategories } = useGet(
        {
            url: "/categories",
            queryKey: ["categories"],
        },
    );

    const cake = cakeResponse?.data;
    const categories = categoriesResponse?.data || [];

    const { mutate: updateCake, isPending: isUpdating } = usePut({
        url: `/admin/cakes/${id}`,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    });

    useEffect(() => {
        if (!cake) {
            return;
        }

        const cakeTags = Array.isArray(cake.tags) ? cake.tags : [];

        const categoryId =
            typeof cake.category === "object"
                ? cake.category?._id || ""
                : cake.category || "";

        reset({
            nameEn: cake.name?.en || "",
            nameAr: cake.name?.ar || "",

            descriptionEn: cake.description?.en || "",
            descriptionAr: cake.description?.ar || "",

            category: categoryId,

            flavor: cake.flavor || "",

            weightSize: cake.weightSize || "small",

            price:
                cake.price !== undefined && cake.price !== null
                    ? String(cake.price)
                    : "",

            discountPercentage:
                cake.discountPercentage !== undefined &&
                cake.discountPercentage !== null
                    ? String(cake.discountPercentage)
                    : "0",

            stock:
                cake.stock !== undefined && cake.stock !== null
                    ? String(cake.stock)
                    : "0",

            tags: cakeTags.slice(0, 3),

            images: [],
        });

        const currentImages = Array.isArray(cake.images) ? cake.images : [];

        setExistingImages(
            currentImages
                .map((image) => {
                    if (typeof image === "string") {
                        return {
                            id: image,
                            url: image,
                        };
                    }

                    return {
                        id: image?._id || image?.fileId || image?.url,

                        url: image?.url,
                    };
                })
                .filter((image) => image.url),
        );

        setImagePreviews([]);
    }, [cake, reset]);

    useEffect(() => {
        if (!selectedImages.length) {
            setImagePreviews([]);
            return;
        }

        const previews = selectedImages.map((file) => ({
            file,
            url: URL.createObjectURL(file),
        }));

        setImagePreviews(previews);

        return () => {
            previews.forEach((preview) => {
                URL.revokeObjectURL(preview.url);
            });
        };
    }, [selectedImages]);

    const handleImageChange = (event) => {
        const files = Array.from(event.target.files || []);

        if (!files.length) {
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        const invalidFiles = files.filter(
            (file) => !allowedTypes.includes(file.type),
        );

        if (invalidFiles.length > 0) {
            toast.error("Only JPG, PNG or WEBP images are allowed");
        }

        const validTypeFiles = files.filter((file) =>
            allowedTypes.includes(file.type),
        );

        const oversizedFiles = validTypeFiles.filter(
            (file) => file.size > 5 * 1024 * 1024,
        );

        if (oversizedFiles.length > 0) {
            toast.error("Each image must be 5MB or smaller");
        }

        const validFiles = validTypeFiles.filter(
            (file) => file.size <= 5 * 1024 * 1024,
        );

        const currentFiles = selectedImages;

        const remainingSlots = Math.max(0, 5 - existingImages.length);

        const nextImages = [...currentFiles, ...validFiles].slice(
            0,
            remainingSlots,
        );

        if (currentFiles.length + validFiles.length > remainingSlots) {
            toast.error("Maximum 5 images allowed");
        }

        setValue("images", nextImages, {
            shouldDirty: true,
            shouldValidate: true,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeNewImage = (index) => {
        const nextImages = selectedImages.filter(
            (_, imageIndex) => imageIndex !== index,
        );

        setValue("images", nextImages, {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const removeExistingImage = (index) => {
        setExistingImages((currentImages) =>
            currentImages.filter((_, imageIndex) => imageIndex !== index),
        );
    };

    const toggleTag = (tag) => {
        if (selectedTags.includes(tag)) {
            setValue(
                "tags",
                selectedTags.filter((item) => item !== tag),
                {
                    shouldDirty: true,
                    shouldValidate: true,
                },
            );

            return;
        }

        if (selectedTags.length >= 3) {
            toast.error("You can select up to 3 tags");
            return;
        }

        setValue("tags", [...selectedTags, tag], {
            shouldDirty: true,
            shouldValidate: true,
        });
    };

    const onSubmit = (values) => {
        const formData = new FormData();

        formData.append("nameEn", values.nameEn.trim());
        formData.append("nameAr", values.nameAr.trim());

        formData.append("descriptionEn", values.descriptionEn.trim());

        formData.append("descriptionAr", values.descriptionAr.trim());

        formData.append("category", values.category);
        formData.append("flavor", values.flavor);
        formData.append("weightSize", values.weightSize);

        formData.append("price", values.price);

        formData.append("discountPercentage", values.discountPercentage || "0");

        formData.append("stock", values.stock);

        formData.append("tags", values.tags.join(","));

        values.images.forEach((file) => {
            formData.append("images", file);
        });

        formData.append("existingImages", JSON.stringify(existingImages));

        updateCake(formData, {
            onSuccess: (response) => {
                toast.success(response?.message || "Cake updated successfully");

                navigate("/admin/cakes");
            },

            onError: (error) => {
                toast.error(
                    error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        "Failed to update cake",
                );
            },
        });
    };

    const onInvalid = (formErrors) => {

    };

    if (isLoadingCake || isLoadingCategories) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    if (isCakeError || !cake) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-2xl border bg-background p-8 text-center">
                    <h2 className="text-lg font-semibold">Cake not found</h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        The cake you're trying to edit could not be found.
                    </p>

                    <Button
                        asChild
                        variant="outline-asymmetric"
                        className="mt-6"
                    >
                        <Link to="/admin/cakes">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Cakes
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    const totalImages = existingImages.length + imagePreviews.length;

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">

            <div className="flex items-center gap-4">
                <Button
                    asChild
                    variant="outline-asymmetric"
                    size="icon"
                    className="size-10 shrink-0"
                >
                    <Link to="/admin/cakes">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Edit Cake
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the information and images for this cake.
                    </p>
                </div>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="space-y-6"
            >

                <div className={`${sectionClasses} overflow-hidden`}>
                    <div className="border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <Package className="size-5 text-primary" />
                            </div>

                            <div>
                                <h2 className="font-semibold">
                                    Cake Information
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Update the cake name, description, category,
                                    and product details.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 p-6 lg:grid-cols-2">

                        <div className="space-y-2">
                            <Label htmlFor="nameEn">English Cake Name</Label>

                            <Input
                                id="nameEn"
                                placeholder="e.g. Chocolate Celebration Cake"
                                className={fieldClasses}
                                {...register("nameEn")}
                            />

                            {errors.nameEn && (
                                <p className="text-sm text-destructive">
                                    {errors.nameEn.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nameAr">Arabic Cake Name</Label>

                            <Input
                                id="nameAr"
                                dir="rtl"
                                placeholder="مثال: كعكة الشوكولاتة"
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
                                English Description
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
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="descriptionAr">
                                Arabic Description
                            </Label>

                            <Textarea
                                id="descriptionAr"
                                dir="rtl"
                                placeholder="وصف الكعكة..."
                                className="min-h-32 rounded-xl px-4 py-3 text-[15px] shadow-none"
                                {...register("descriptionAr")}
                            />

                            {errors.descriptionAr && (
                                <p className="text-sm text-destructive">
                                    {errors.descriptionAr.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Category</Label>

                            <Controller
                                name="category"
                                control={control}
                                render={({ field }) => {
                                    const selectedCategory = categories.find(
                                        (category) =>
                                            category._id === field.value,
                                    );

                                    return (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                className={selectClasses}
                                            >
                                                <span className="truncate">
                                                    {selectedCategory?.name
                                                        ?.en ||
                                                        "Select category"}
                                                </span>
                                            </SelectTrigger>

                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category._id}
                                                        value={category._id}
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
                            <Label>Flavor</Label>

                            <Controller
                                name="flavor"
                                control={control}
                                render={({ field }) => {
                                    const selectedFlavor = flavors.find(
                                        (flavor) =>
                                            flavor.value === field.value,
                                    );

                                    return (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger
                                                className={selectClasses}
                                            >
                                                <span className="truncate">
                                                    {selectedFlavor?.label ||
                                                        "Select flavor"}
                                                </span>
                                            </SelectTrigger>

                                            <SelectContent>
                                                {flavors.map((flavor) => (
                                                    <SelectItem
                                                        key={flavor.value}
                                                        value={flavor.value}
                                                    >
                                                        {flavor.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    );
                                }}
                            />

                            {errors.flavor && (
                                <p className="text-sm text-destructive">
                                    {errors.flavor.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Weight / Size</Label>

                            <Controller
                                name="weightSize"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger
                                            className={selectClasses}
                                        >
                                            <span className="capitalize">
                                                {field.value || "Select size"}
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
                                placeholder="e.g. 12.500"
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
                                Discount Percentage
                            </Label>

                            <Input
                                id="discountPercentage"
                                type="text"
                                inputMode="decimal"
                                placeholder="e.g. 10"
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
                                placeholder="e.g. 20"
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
                </div>

                <div className={`${sectionClasses} overflow-hidden`}>
                    <div className="border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <ImagePlus className="size-5 text-primary" />
                            </div>

                            <div>
                                <h2 className="font-semibold">Cake Images</h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Manage the current images or upload new
                                    ones.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                        />

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

                            {existingImages.map((image, index) => (
                                <div
                                    key={image.id || `existing-${index}`}
                                    className="group relative aspect-square overflow-hidden rounded-2xl border bg-muted/20"
                                >
                                    <img
                                        src={image.url}
                                        alt={`Cake image ${index + 1}`}
                                        className="size-full object-cover"
                                    />

                                    {index === 0 && (
                                        <div className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur">
                                            Main Image
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeExistingImage(index)
                                        }
                                        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}

                            {imagePreviews.map((preview, index) => (
                                <div
                                    key={preview.url}
                                    className="relative aspect-square overflow-hidden rounded-2xl border bg-muted/20"
                                >
                                    <img
                                        src={preview.url}
                                        alt={`New cake image ${index + 1}`}
                                        className="size-full object-cover"
                                    />

                                    <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                                        New Image
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(index)}
                                        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            ))}

                            {totalImages < 5 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="group flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-6 text-center transition-all hover:border-primary/40 hover:bg-primary/[0.03]"
                                >
                                    <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm transition-transform group-hover:-translate-y-1">
                                        <Upload className="size-6 text-primary" />
                                    </div>

                                    <p className="mt-5 text-sm font-semibold">
                                        Add images
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                        Upload additional cake images
                                    </p>
                                </button>
                            )}
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                            <p className="text-xs text-muted-foreground">
                                Upload up to 5 product images.
                            </p>

                            <p className="text-xs font-medium text-muted-foreground">
                                {totalImages} / 5 images
                            </p>
                        </div>

                        {errors.images && (
                            <p className="mt-2 text-sm text-destructive">
                                {errors.images.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className={`${sectionClasses} overflow-hidden`}>
                    <div className="border-b p-6">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <Tag className="size-5 text-primary" />
                            </div>

                            <div>
                                <h2 className="font-semibold">SEO Tags</h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Select up to 3 tags that describe this cake.
                                </p>
                            </div>
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
                                        onClick={() => toggleTag(tag)}
                                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                                            isSelected
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "bg-background hover:bg-muted"
                                        }`}
                                    >
                                        {tag}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-4 text-xs text-muted-foreground">
                            {selectedTags.length} of 3 tags selected
                        </p>

                        {errors.tags && (
                            <p className="mt-2 text-sm text-destructive">
                                {errors.tags.message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <Button
                        asChild
                        variant="outline-asymmetric"
                        size="lg"
                        disabled={isUpdating}
                    >
                        <Link to="/admin/cakes">Cancel</Link>
                    </Button>

                    <Button
                        type="submit"
                        variant="asymmetric"
                        size="lg"
                        disabled={isUpdating}
                    >
                        {isUpdating ? (
                            <>
                                <Loader2 className="mr-2 size-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Cake"
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
