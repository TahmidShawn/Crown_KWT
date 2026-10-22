import { z } from "zod";

const booleanField = z
    .string()
    .optional()
    .transform((val) =>
        val === undefined ? undefined : val === "true" || val === "1",
    );

const nonNegativeIntegerString = (fieldName) =>
    z
        .string({ error: `${fieldName} is required` })
        .regex(/^\d+$/, `${fieldName} must be a valid integer`)
        .transform(Number);

const kwdPrice = z
    .string({ error: "Price is required" })
    .trim()
    .regex(
        /^\d+(\.\d{1,3})?$/,
        "Price must be a valid KWD amount with up to 3 decimal places",
    )
    .refine((value) => Number(value) >= 0, "Price cannot be negative")
    .transform(Number);

const optionalKwdPrice = z
    .string()
    .trim()
    .regex(
        /^\d+(\.\d{1,3})?$/,
        "Price must be a valid KWD amount with up to 3 decimal places",
    )
    .refine((value) => Number(value) >= 0, "Price cannot be negative")
    .transform(Number)
    .optional();

const percentageString = z
    .string()
    .optional()
    .transform((value) => (value === undefined || value === "" ? 0 : value))
    .refine(
        (value) =>
            /^\d+(\.\d+)?$/.test(String(value)) &&
            Number(value) >= 0 &&
            Number(value) <= 100,
        "Discount must be between 0 and 100",
    )
    .transform(Number);

const FLAVOR_VALUES = [
    "chocolate",
    "vanilla",
    "red-velvet",
    "strawberry",
    "carrot",
    "butterscotch",
    "black-forest",
    "lemon",
    "mango",
    "pistachio",
];

const parseFlavorCsv = (value) =>
    value
        .split(",")
        .map((flavor) => flavor.trim())
        .filter(Boolean);

// The client sends flavor as a comma-joined string via FormData
// (e.g. "chocolate,vanilla"), so validate it as a CSV of 1-5 flavors
// and transform it into an array for downstream consumers.
const flavorCsv = z
    .string({ error: "Flavor is required" })
    .trim()
    .refine(
        (value) => {
            const items = parseFlavorCsv(value);

            return items.length >= 1 && items.length <= 5;
        },
        {
            message: "Please select between 1 and 5 cake flavors",
        },
    )
    .refine(
        (value) =>
            parseFlavorCsv(value).every((flavor) =>
                FLAVOR_VALUES.includes(flavor),
            ),
        {
            message: "Please select a valid cake flavor",
        },
    )
    .transform((value) => parseFlavorCsv(value));

export const createCakeSchema = z.object({
    nameEn: z
        .string({ error: "English name is required" })
        .trim()
        .min(3, "English name must be at least 3 characters")
        .max(150, "English name cannot exceed 150 characters"),

    nameAr: z
        .string({ error: "Arabic name is required" })
        .trim()
        .min(3, "Arabic name must be at least 3 characters")
        .max(150, "Arabic name cannot exceed 150 characters"),

    descriptionEn: z
        .string({ error: "English description is required" })
        .trim()
        .min(10, "English description must be at least 10 characters")
        .max(1000, "English description cannot exceed 1000 characters"),

    descriptionAr: z
        .string({ error: "Arabic description is required" })
        .trim()
        .min(10, "Arabic description must be at least 10 characters")
        .max(1000, "Arabic description cannot exceed 1000 characters"),

    category: z
        .string({ error: "Category is required" })
        .trim()
        .min(1, "Category is required"),

    flavor: flavorCsv,

    weightSize: z.enum(["small", "medium"], {
        error: "Size must be either small or medium",
    }),

    price: kwdPrice,

    discountPercentage: percentageString,

    stock: nonNegativeIntegerString("Stock"),

    isCustomAvailable: booleanField,

    isFeatured: booleanField,

    isActive: booleanField,

    tags: z
        .string()
        .optional()
        .transform((value) => {
            if (!value) return undefined;

            return value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
        }),
});

export const updateCakeSchema = z.object({
    nameEn: z
        .string()
        .trim()
        .min(3, "English name must be at least 3 characters")
        .max(150, "English name cannot exceed 150 characters")
        .optional(),

    nameAr: z
        .string()
        .trim()
        .min(3, "Arabic name must be at least 3 characters")
        .max(150, "Arabic name cannot exceed 150 characters")
        .optional(),

    descriptionEn: z
        .string()
        .trim()
        .min(10, "English description must be at least 10 characters")
        .max(1000, "English description cannot exceed 1000 characters")
        .optional(),

    descriptionAr: z
        .string()
        .trim()
        .min(10, "Arabic description must be at least 10 characters")
        .max(1000, "Arabic description cannot exceed 1000 characters")
        .optional(),

    category: z.string().trim().min(1, "Category cannot be empty").optional(),

    flavor: flavorCsv.optional(),

    weightSize: z.enum(["small", "medium"]).optional(),

    price: optionalKwdPrice,

    discountPercentage: percentageString,

    stock: nonNegativeIntegerString("Stock").optional(),

    isCustomAvailable: booleanField,

    isFeatured: booleanField,

    isActive: booleanField,

    tags: z
        .string()
        .optional()
        .transform((value) => {
            if (!value) return undefined;

            return value
                .split(",")
                .map((tag) => tag.trim())
                .filter(Boolean);
        }),
});
