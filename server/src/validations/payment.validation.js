import { z } from "zod";

export const createPaymentSchema = z.object({
    orderId: z
        .string()
        .trim()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid order ID"),
});

export const paymentCallbackSchema = z.object({
    paymentId: z
        .string()
        .trim()
        .min(1, "Payment ID is required"),
});