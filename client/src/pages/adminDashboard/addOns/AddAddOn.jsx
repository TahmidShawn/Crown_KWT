import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ImagePlus, Languages, Loader2, X } from "lucide-react";
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

const addOnSchema = z.object({
    nameEn: z
        .string()
        .trim()
        .min(1, "Please enter the English add-on name.")
        .max(100, "Add-on name cannot exceed 100 characters."),

    nameAr: z
        .string()
        .trim()
        .min(1, "Please enter the Arabic add-on name.")
        .max(100, "Add-on name cannot exceed 100 characters."),

    image: z
        .instanceof(File, {
            message: "Please select an add-on image.",
        })
        .refine(
            (file) => file.type.startsWith("image/"),
            "Please select a valid image file.",
        ),

    price: z.string().trim().min(1, "Please enter the add-on price.").regex(/^\d+(\.\d{1,3})?$/, "Enter a valid KWD amount (up to 3 decimals).").refine((v) => Number(v) >= 0, "Price cannot be negative."),

    isActive: z.boolean(),
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

export default function AddAddOn() {
    const navigate = useNavigate();

    const [imagePreview, setImagePreview] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(addOnSchema),
        defaultValues: {
            nameEn: "",
            nameAr: "",
            image: undefined,
            price: "",
            isActive: true,
        },
    });

    const nameEn = watch("nameEn");
    const image = watch("image");
    const isActive = watch("isActive");

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

    const { mutate: createAddOn, isPending } = usePost({
        url: "/admin/add-ons",
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

    const handleCreateAddOn = (formData) => {
        const data = new FormData();

        data.append("nameEn", formData.nameEn.trim());
        data.append("nameAr", formData.nameAr.trim());
        data.append("image", formData.image);
        data.append("price", formData.price.trim());
        data.append("isActive", String(formData.isActive));

        createAddOn(data, {
            onSuccess: (response) => {
                toast.success("Add-on created", {
                    description:
                        response?.message || "Add-on created successfully.",
                });

                navigate("/admin/add-ons");
            },

            onError: (error) => {
                toast.error("Failed to create add-on", {
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
                    <Link to="/admin/add-ons">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>

                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Add Add-on
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Create a new cake add-on.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit(handleCreateAddOn)} noValidate>
                <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
                    
                    <div className="space-y-6">
                        <section className="rounded-2xl border bg-card">
                            <div className="border-b p-6">
                                <h2 className="font-semibold">
                                    Add-on Information
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Add the add-on name and image.
                                </p>
                            </div>

                            <div className="space-y-6 p-6">
                                
                                <div className="space-y-2">
                                    <Label htmlFor="image">
                                        Add-on Image
                                    </Label>

                                    <div className="relative">
                                        {imagePreview ? (
                                            <div className="relative h-56 overflow-hidden rounded-2xl border">
                                                <img
                                                    src={imagePreview}
                                                    alt="Add-on preview"
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
                                                    Upload add-on image
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
                                            placeholder="e.g. Extra Candles"
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
                                                placeholder="مثال: شمعة إضافية"
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

                                
                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Price (KWD)
                                    </Label>

                                    <Input
                                        id="price"
                                        inputMode="decimal"
                                        placeholder="e.g. 2.500"
                                        className={fieldClasses}
                                        {...register("price")}
                                    />

                                    {errors.price && (
                                        <p className="text-sm text-destructive">
                                            {errors.price.message}
                                        </p>
                                    )}
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
                                            Make this add-on visible to
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
                        </section>

                        
                        <div className="flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline-asymmetric"
                                asChild
                                className="h-12 px-6"
                            >
                                <Link to="/admin/add-ons">Cancel</Link>
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
                                      : "Create Add-on"}
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
                                Multilingual Add-on
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Enter the add-on name in English. The Arabic
                                name will be generated automatically and can be
                                edited before creating the add-on.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
