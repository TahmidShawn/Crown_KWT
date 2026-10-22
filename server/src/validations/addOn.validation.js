import { z } from "zod";

const priceSchema = z
    .string({ error: "Price is required" })
    .trim()
    .regex(/^\d+(\.\d{1,3})?$/, "Price must be a valid KWD amount")
    .refine((value) => Number(value) >= 0, "Price cannot be negative");

export const createAddOnSchema = z.object({
    nameEn: z
        .string({ error: "English name is required" })
        .trim()
        .min(1, "English name cannot be empty")
        .max(100, "English name cannot exceed 100 characters"),

    nameAr: z
        .string({ error: "Arabic name is required" })
        .trim()
        .min(1, "Arabic name cannot be empty")
        .max(100, "Arabic name cannot exceed 100 characters"),

    price: priceSchema,

    isActive: z
        .string()
        .optional()
        .transform((val) => val === "true" || val === "1"),
});

export const updateAddOnSchema = z.object({
    nameEn: z
        .string({ error: "English name is required" })
        .trim()
        .min(1, "English name cannot be empty")
        .max(100, "English name cannot exceed 100 characters")
        .optional(),

    nameAr: z
        .string({ error: "Arabic name is required" })
        .trim()
        .min(1, "Arabic name cannot be empty")
        .max(100, "Arabic name cannot exceed 100 characters")
        .optional(),

    price: priceSchema.optional(),

    isActive: z
        .string()
        .optional()
        .transform((val) => val === "true" || val === "1"),
});
