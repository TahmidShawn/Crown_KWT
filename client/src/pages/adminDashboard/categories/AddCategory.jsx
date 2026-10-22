import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Languages, Loader2, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import useAutoTranslate from "@/hooks/useAutoTranslate";
import usePost from "@/hooks/usePost";

const categorySchema = z.object({
    nameEn: z
        .string()
        .trim()
        .min(1, "Please enter the English category name.")
        .max(80, "Category name cannot exceed 80 characters."),

    nameAr: z
        .string()
        .trim()
        .min(1, "Please enter the Arabic category name.")
        .max(80, "Category name cannot exceed 80 characters."),

    image: z
        .instanceof(File, {
            message: "Please select a category image.",
        })
        .refine(
            (file) => file.type.startsWith("image/"),
            "Please select a valid image file.",
        ),

    isActive: z.boolean(),

    isPopular: z.boolean(),
});

const formatFileSize = (bytes) => {
    if (!bytes) {
        return "0 KB";
    }

    const sizeInKb = bytes / 1024;

    if (sizeInKb < 1024) {
        return `${sizeInKb.toFixed(1)} KB`;
    }

    return `${(sizeInKb / 1024).toFixed(1)} MB`;
};

export default function AddCategory() {
    const navigate = useNavigate();

    const [imagePreview, setImagePreview] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
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

    const nameEn = watch("nameEn");
    const image = watch("image");
    const isActive = watch("isActive");
    const isPopular = watch("isPopular");

    const {
        translatedValue,
        isTranslating,
        error: translationError,
    } = useAutoTranslate({
        value: nameEn,
        sourceLanguage: "en",
        targetLanguage: "ar",
        delay: 700,
    });

    const { mutate: createCategory, isPending } = usePost({
        url: "/admin/categories",
    });

    useEffect(() => {
        if (!nameEn?.trim()) {
            setValue("nameAr", "", {
                shouldValidate: true,
            });

            return;
        }

        if (translatedValue) {
            setValue("nameAr", translatedValue, {
                shouldValidate: true,
                shouldDirty: true,
            });
        }
    }, [nameEn, translatedValue, setValue]);

    useEffect(() => {
        if (!image) {
            setImagePreview("");
            return;
        }

        const previewUrl = URL.createObjectURL(image);

        setImagePreview(previewUrl);

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [image]);

    useEffect(() => {
        if (translationError) {
            toast.error("Translation failed", {
                description:
                    "Arabic translation could not be generated. You can enter it manually.",
            });
        }
    }, [translationError]);

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith("image/")) {
            toast.error("Invalid image", {
                description: "Please select a valid image file.",
            });

            event.target.value = "";
            return;
        }

        setValue("image", file, {
            shouldValidate: true,
            shouldDirty: true,
        });
    };

    const handleRemoveImage = () => {
        setValue("image", undefined, {
            shouldValidate: true,
            shouldDirty: true,
        });

        setImagePreview("");

        const input = document.getElementById("image");

        if (input) {
            input.value = "";
        }
    };

    const handleCreateCategory = (formData) => {
        const data = new FormData();

        data.append("nameEn", formData.nameEn.trim());
        data.append("nameAr", formData.nameAr.trim());
        data.append("image", formData.image);
        data.append("isActive", String(formData.isActive));
        data.append("isPopular", String(formData.isPopular));

        createCategory(data, {
            onSuccess: (response) => {
                toast.success("Category created", {
                    description:
                        response?.message || "Category created successfully.",
                });

                navigate("/admin/categories");
            },

            onError: (error) => {
                toast.error("Failed to create category", {
                    description:
                        error?.response?.data?.message ||
                        error?.message ||
                        "Something went wrong. Please try again.",
                });
            },
        });
    };

    const isSubmitting = isPending || isTranslating;

    const fieldClasses =
        "!h-12 w-full min-w-0 rounded-xl px-4 text-[15px] shadow-none";

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            
            <div className="flex items-center gap-4">
                <Button
                    asChild
                    variant="outline-asymmetric"
                    size="icon"
                    className="size-11 shrink-0"
                >
                    <Link to="/admin/categories">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Add Category
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create a new cake category.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(handleCreateCategory)} noValidate>
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    
                    <div className="space-y-6">
                        <section className="rounded-2xl border bg-card">
                            <div className="border-b p-6">
                                <h2 className="font-semibold">
                                    Category Information
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add the category name and image.
                                </p>
                            </div>

                            <div className="space-y-6 p-6">
                                
                                <div className="space-y-2">
                                    <Label htmlFor="image">
                                        Category Image
                                    </Label>

                                    <div className="relative">
                                        {imagePreview ? (
                                            <div className="relative h-56 overflow-hidden rounded-2xl border">
                                                <img
                                                    src={imagePreview}
                                                    alt="Category preview"
                                                    className="h-full w-full object-cover"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={handleRemoveImage}
                                                    className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-background/90 shadow-md transition-colors hover:bg-background"
                                                    aria-label="Remove image"
                                                >
                                                    <X className="size-4" />
                                                </button>

                                                <div className="absolute inset-x-0 bottom-0 bg-black/60 px-4 py-3 text-white">
                                                    <p className="truncate text-sm font-medium">
                                                        {image?.name}
                                                    </p>

                                                    <p className="text-xs text-white/70">
                                                        {formatFileSize(
                                                            image?.size,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <label
                                                htmlFor="image"
                                                className="flex h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-colors hover:bg-muted/50"
                                            >
                                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                                    <ImagePlus className="size-6 text-muted-foreground" />
                                                </div>

                                                <p className="mt-3 text-sm font-medium">
                                                    Upload category image
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    PNG, JPG or WEBP
                                                </p>

                                                <input
                                                    id="image"
                                                    type="file"
                                                    accept="image/png,image/jpeg,image/webp"
                                                    className="hidden"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {errors.image && (
                                        <p className="text-sm text-destructive">
                                            {errors.image.message}
                                        </p>
                                    )}
                                </div>

                                
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="nameEn">
                                            English Name
                                        </Label>

                                        <Input
                                            id="nameEn"
                                            placeholder="e.g. Birthday Cakes"
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
                                        <Label htmlFor="nameAr">
                                            Arabic Name
                                        </Label>

                                        <div className="relative">
                                            <Input
                                                id="nameAr"
                                                dir="rtl"
                                                placeholder="مثال: كعك أعياد الميلاد"
                                                className={fieldClasses}
                                                {...register("nameAr")}
                                            />

                                            {isTranslating && (
                                                <Loader2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                                            )}
                                        </div>

                                        {errors.nameAr && (
                                            <p className="text-sm text-destructive">
                                                {errors.nameAr.message}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                
                                <div className="flex items-center justify-between rounded-2xl border p-4">
                                    <div>
                                        <Label
                                            htmlFor="isActive"
                                            className="cursor-pointer"
                                        >
                                            Active Status
                                        </Label>

                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Make this category visible to
                                            customers.
                                        </p>
                                    </div>

                                    <Switch
                                        id="isActive"
                                        checked={isActive}
                                        onCheckedChange={(checked) =>
                                            setValue("isActive", checked, {
                                                shouldDirty: true,
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
                        </section>

                        
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline-asymmetric"
                                asChild
                                className="h-12 px-6"
                            >
                                <Link to="/admin/categories">Cancel</Link>
                            </Button>

                            <Button
                                type="submit"
                                variant="asymmetric"
                                className="h-12 px-6"
                                disabled={isSubmitting}
                            >
                                {isPending && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}

                                {isTranslating
                                    ? "Translating..."
                                    : isPending
                                      ? "Creating..."
                                      : "Create Category"}
                            </Button>
                        </div>
                    </div>

                    
                    <div className="h-fit rounded-2xl border bg-card">
                        <div className="border-b p-6">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                                <Languages className="size-5 text-primary" />
                            </div>
                        </div>

                        <div className="p-6">
                            <h2 className="font-semibold">
                                Multilingual Category
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Enter the category name in English. The Arabic
                                name will be generated automatically and can be
                                edited before creating the category.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
