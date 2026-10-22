import { z } from "zod";

const objectId = z
    .string({ error: "ID is required" })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

const extractKuwaitLocalNumber = (value = "") => {
    let digits = String(value).replace(/\D/g, "");

    if (digits.startsWith("00965")) {
        digits = digits.slice(5);
    } else if (digits.startsWith("965") && digits.length === 11) {
        digits = digits.slice(3);
    }

    return digits;
};

const kuwaitPhoneSchema = z
    .string({ error: "Phone number is required" })
    .trim()
    .min(1, "Phone number is required")
    .transform(extractKuwaitLocalNumber)
    .refine((digits) => /^[2-9]\d{7}$/.test(digits), {
        message: "Please enter a valid 8-digit Kuwait phone number",
    })
    .transform((digits) => `+965${digits}`);

const shippingAddressSchema = z
    .object({
        fullName: z
            .string({ error: "Full name is required" })
            .trim()
            .min(4, "Full name must be at least 4 characters")
            .max(30, "Full name cannot exceed 30 characters"),

        phone: kuwaitPhoneSchema,

        governorate: z.enum(
            [
                "Al Asimah",
                "Hawalli",
                "Farwaniya",
                "Mubarak Al-Kabeer",
                "Ahmadi",
                "Jahra",
            ],
            {
                error: "Please select a valid governorate",
            },
        ),

        area: z
            .string({ error: "Area is required" })
            .trim()
            .min(1, "Area is required")
            .max(100, "Area cannot exceed 100 characters"),

        block: z
            .string({ error: "Block is required" })
            .trim()
            .min(1, "Block is required")
            .max(50, "Block cannot exceed 50 characters"),

        street: z
            .string({ error: "Street is required" })
            .trim()
            .min(1, "Street is required")
            .max(150, "Street cannot exceed 150 characters"),

        building: z
            .string({ error: "Building is required" })
            .trim()
            .min(1, "Building is required")
            .max(50, "Building cannot exceed 50 characters"),

        floor: z
            .string()
            .trim()
            .max(50, "Floor cannot exceed 50 characters")
            .optional(),

        apartmentNo: z
            .string()
            .trim()
            .max(50, "Apartment number cannot exceed 50 characters")
            .optional(),

        notes: z
            .string()
            .trim()
            .max(300, "Delivery notes cannot exceed 300 characters")
            .optional(),
    })
    .strict();

const addOnSchema = z
    .object({
        addOnId: objectId,
        quantity: z
            .number({
                error: "Add-on quantity is required",
            })
            .int("Add-on quantity must be a whole number")
            .min(1, "Add-on quantity must be at least 1")
            .max(50, "Add-on quantity cannot exceed 50"),
    })
    .strict();

export const createOrderSchema = z
    .object({
        paymentMethod: z.enum(["online", "cash_on_delivery"], {
            error: "Please select a valid payment method",
        }),

        cakeIds: z
            .array(
                z
                    .string({ error: "Cake ID is required" })
                    .regex(/^[0-9a-fA-F]{24}$/, "Invalid cake ID"),
                {
                    error: "Please select at least one cake",
                },
            )
            .min(1, "Please select at least one cake")
            .max(50, "You cannot order more than 50 items at once")
            .refine((ids) => new Set(ids).size === ids.length, {
                message: "Duplicate cake IDs are not allowed",
            }),

        addOns: z
            .array(addOnSchema)
            .max(50, "You cannot select more than 50 add-ons")
            .refine(
                (items) =>
                    new Set(items.map((item) => item.addOnId)).size ===
                    items.length,
                {
                    message: "Duplicate add-ons are not allowed",
                },
            )
            .default([]),

        shippingAddress: shippingAddressSchema,
    })
    .strict();
