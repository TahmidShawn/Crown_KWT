import { z } from "zod";

const objectIdSchema = z
    .string({ error: "ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const quantitySchema = z.preprocess(
    (value) => {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }

        return Number(value);
    },
    z
        .number({
            error: "Quantity is required",
        })
        .int("Quantity must be a whole number")
        .min(1, "Quantity must be at least 1")
        .max(50, "Quantity cannot exceed 50"),
);

export const addCartItemSchema = z.object({
    cakeId: z
        .string({ error: "Cake ID is required" })
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid cake ID"),

    quantity: quantitySchema,
});

export const updateCartItemSchema = z.object({
    quantity: quantitySchema,
});

export const addCartAddOnSchema = z.object({
    addOnId: objectIdSchema,

    quantity: quantitySchema.optional().default(1),
});

export const updateCartAddOnSchema = z.object({
    quantity: quantitySchema,
});
