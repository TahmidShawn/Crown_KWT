import { z } from "zod";

export const createCategorySchema = z.object({
    nameEn: z
        .string({ error: "English name is required" })
        .trim()
        .min(1, "English name cannot be empty")
        .max(80, "English name cannot exceed 80 characters"),
    nameAr: z
        .string({ error: "Arabic name is required" })
        .trim()
        .min(1, "Arabic name cannot be empty")
        .max(80, "Arabic name cannot exceed 80 characters"),
    isActive: z
        .string()
        .optional()
        .transform((val) => val === "true" || val === "1"),
    isPopular: z
        .string()
        .optional()
        .transform((val) => val === "true" || val === "1"),
});

export const updateCategorySchema = z.object({
    nameEn: z
        .string({ error: "English name is required" })
        .trim()
        .min(1, "English name cannot be empty")
        .max(80, "English name cannot exceed 80 characters")
        .optional(),
    nameAr: z
        .string({ error: "Arabic name is required" })
        .trim()
        .min(1, "Arabic name cannot be empty")
        .max(80, "Arabic name cannot exceed 80 characters")
        .optional(),
    isActive: z
        .string()
        .optional()
        .transform((val) => val === "true" || val === "1"),
    isPopular: z
        .string()
        .optional()
        .transform((val) => val === "true" || val === "1"),
});
