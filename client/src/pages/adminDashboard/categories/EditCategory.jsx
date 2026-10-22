import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Loader2, TrendingUp, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import useGet from "@/hooks/useGet";
import usePut from "@/hooks/usePut";

const categorySchema = z.object({
    nameEn: z
        .string()
        .trim()
        .min(1, "Please enter English category name")
        .max(100, "Category name cannot exceed 100 characters"),

    nameAr: z
        .string()
        .trim()
        .min(1, "Please enter Arabic category name")
        .max(100, "Category name cannot exceed 100 characters"),

    image: z
        .instanceof(File)
        .refine(
            (file) =>
                ["image/jpeg", "image/png", "image/webp"].includes(file.type),
            "Only JPG, PNG or WEBP images are allowed",
        )
        .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            "Image size cannot exceed 5MB",
        )
        .optional(),

    isActive: z.boolean(),

    isPopular: z.boolean(),
});

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [imagePreview, setImagePreview] = useState(null);
    const [isNewImage, setIsNewImage] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            nameEn: "",
            nameAr: "",
            image: undefined,
            isActive: true,
            isPopular: false,
        },
    });

    const image = watch("image");
    const isActive = watch("isActive");
    const isPopular = watch("isPopular");

    const {
        data: categoryResponse,
        isLoading: isLoadingCategory,
        isError: isCategoryError,
    } = useGet({
        url: `/categories/${id}`,
        queryKey: ["category", id],
        enabled: Boolean(id),
    });

    const category = categoryResponse?.data;

    const {
        mutate: updateCategory,
        isPending: isUpdating,
    } = usePut({
        url: `/admin/categories/${id}`,
        config: {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        },
    });

    useEffect(() => {
        if (!category) {
            return;
        }

        reset({
            nameEn: category.name?.en || "",
            nameAr: category.name?.ar || "",
            image: undefined,
            isActive: category.isActive ?? true,
            isPopular: category.isPopular ?? false,
        });

        setImagePreview(category.imageUrl || null);
        setIsNewImage(false);
    }, [category, reset]);

    useEffect(() => {
        if (!(image instanceof File)) {
            return;
        }

        const previewUrl = URL.createObjectURL(image);

        setImagePreview(previewUrl);
        setIsNewImage(true);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [image]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setValue("image", file, {
            shouldValidate: true,
            shouldDirty: true,
        });

        // Reset the file input so selecting the same file again triggers onChange.
        // Without this, re-selecting the same image does not fire a change event
        // and the upload button appears to stop working.
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = () => {
        setValue("image", undefined, {
            shouldValidate: true,
            shouldDirty: true,
        });

        setImagePreview(category?.imageUrl || null);
        setIsNewImage(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onSubmit = (values) => {

        const formData = new FormData();

        formData.append("nameEn", values.nameEn.trim());
        formData.append("nameAr", values.nameAr.trim());
        formData.append("isActive", String(values.isActive));
        formData.append("isPopular", String(values.isPopular));

        if (values.image instanceof File) {
            formData.append("image", values.image);
        }

        updateCategory(formData, {
            onSuccess: (response) => {

                toast.success(
                    response?.message || "Category updated successfully",
                );

                navigate("/admin/categories");
            },

            onError: (error) => {

                toast.error(
                    error?.response?.data?.message ||
                        error?.response?.data?.error ||
                        "Failed to update category",
                );
            },
        });
    };

    const onInvalid = () => {};

    if (isLoadingCategory) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        );
    }

    if (isCategoryError || !category) {
        return (
            <div className="mx-auto max-w-5xl">
                <div className="rounded-2xl border bg-background p-8 text-center">
                    <h2 className="text-lg font-semibold">
                        Category not found
                    </h2>

                    <p className="mt-2 text-sm text-muted-foreground">
                        The category you're trying to edit could not be found.
                    </p>

                    <Button
                        asChild
                        variant="outline"
                        className="mt-6 rounded-tl-2xl rounded-br-2xl"
                    >
                        <Link to="/admin/categories">
                            <ArrowLeft className="mr-2 size-4" />
                            Back to Categories
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">

            <div className="flex items-center gap-4">
                <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="size-10 shrink-0 rounded-xl"
                >
                    <Link to="/admin/categories">
                        <ArrowLeft className="size-4" />
                    </Link>
                </Button>

                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Edit Category
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Update the information for this category.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onInvalid)}>
                <div className="overflow-hidden rounded-2xl border bg-background">

                    <div className="border-b px-6 py-5">
                        <h3 className="font-semibold">
                            Category Information
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Update the category name, image, and status.
                        </p>
                    </div>

                    <div className="grid gap-8 p-6 lg:grid-cols-[1fr_1.15fr]">

                        <div className="space-y-3">
                            <div>
                                <Label>Category Image</Label>

                                <p className="mt-1 text-xs text-muted-foreground">
                                    Upload a new image to replace the current
                                    one.
                                </p>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                className="hidden"
                                onChange={handleImageChange}
                            />

                            {imagePreview && (
                                <div className="relative overflow-hidden rounded-2xl border bg-muted/20">
                                    <img
                                        src={imagePreview}
                                        alt={
                                            category.name?.en ||
                                            "Category preview"
                                        }
                                        className="aspect-square w-full object-cover"
                                    />

                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-sm backdrop-blur transition-colors hover:bg-background"
                                    >
                                        <X className="size-4" />
                                    </button>

                                    <div className="absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-background/90 px-3 py-2 backdrop-blur">
                                        <p className="text-xs font-medium">
                                            {isNewImage
                                                ? "New category image"
                                                : "Current category image"}
                                        </p>

                                        {image instanceof File && (
                                            <p className="max-w-[55%] truncate text-xs text-muted-foreground">
                                                {image.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                className="group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-muted/20 px-6 text-center transition-all hover:border-primary/40 hover:bg-primary/[0.03]"
                            >
                                <div className="flex size-14 items-center justify-center rounded-2xl bg-background shadow-sm transition-transform group-hover:-translate-y-1">
                                    <ImagePlus className="size-6 text-primary" />
                                </div>

                                <p className="mt-5 text-sm font-semibold">
                                    {imagePreview
                                        ? "Change category image"
                                        : "Upload category image"}
                                </p>

                                <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                                    Choose an image for this category
                                </p>

                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                                    <Upload className="size-3.5" />
                                    Choose image
                                </div>

                                <p className="mt-4 text-[11px] text-muted-foreground">
                                    JPG, PNG or WEBP · Maximum 5MB
                                </p>
                            </button>

                            {errors.image && (
                                <p className="text-sm text-destructive">
                                    {errors.image.message}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col space-y-6">

                            <div className="space-y-2">
                                <Label htmlFor="nameEn">
                                    English Category Name
                                </Label>

                                <Input
                                    id="nameEn"
                                    placeholder="e.g. Birthday Cakes"
                                    className="h-11"
                                    {...register("nameEn")}
                                />

                                <div className="min-h-5">
                                    {errors.nameEn ? (
                                        <p className="text-sm text-destructive">
                                            {errors.nameEn.message}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Choose a short and recognizable
                                            English name.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nameAr">
                                    Arabic Category Name
                                </Label>

                                <Input
                                    id="nameAr"
                                    dir="rtl"
                                    placeholder="مثال: كعكات أعياد الميلاد"
                                    className="h-11"
                                    {...register("nameAr")}
                                />

                                <div className="min-h-5">
                                    {errors.nameAr ? (
                                        <p className="text-sm text-destructive">
                                            {errors.nameAr.message}
                                        </p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">
                                            Enter the Arabic name for this
                                            category.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-2xl border bg-muted/20 p-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold">
                                            Category Status
                                        </p>

                                        <p className="text-xs leading-5 text-muted-foreground">
                                            {isActive
                                                ? "This category is currently visible to customers."
                                                : "This category is currently hidden from customers."}
                                        </p>
                                    </div>

                                    <Switch
                                        checked={isActive}
                                        onCheckedChange={(value) =>
                                            setValue("isActive", value, {
                                                shouldDirty: true,
                                                shouldValidate: true,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="mb-4 p-4 rounded-lg border border-border bg-muted/50">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                            <TrendingUp className="size-5 text-primary" />
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor="isPopular"
                                                className="cursor-pointer"
                                            >
                                                Popular Category
                                            </Label>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Feature this category in the
                                                popular section on the home
                                                page.
                                            </p>
                                        </div>
                                    </div>

                                    <Switch
                                        id="isPopular"
                                        checked={isPopular}
                                        onCheckedChange={(value) =>
                                            setValue("isPopular", value, {
                                                shouldDirty: true,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="rounded-2xl bg-primary/[0.04] p-5">
                                <p className="text-sm font-semibold">
                                    Updating this category
                                </p>

                                <ul className="mt-3 space-y-2 text-xs leading-5 text-muted-foreground">
                                    <li>
                                        • Keep the category name clear and
                                        recognizable.
                                    </li>

                                    <li>
                                        • Upload a new image only if you want
                                        to replace the current one.
                                    </li>

                                    <li>
                                        • Inactive categories will be hidden
                                        from customers.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col-reverse gap-3 border-t bg-muted/10 px-6 py-4 sm:flex-row sm:justify-end">
                        <Button
                            asChild
                            variant="outline"
                            size="lg"
                            disabled={isUpdating}
                            className="rounded-tl-2xl rounded-br-2xl"
                        >
                            <Link to="/admin/categories">Cancel</Link>
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
                                "Update Category"
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
