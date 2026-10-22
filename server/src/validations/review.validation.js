import { z } from "zod";

export const createReviewSchema = z.object({
    rating: z.coerce
        .number({ error: "Please provide a rating" })
        .int("Rating must be a whole number")
        .min(1, "Rating must be at least 1")
        .max(5, "Rating cannot exceed 5"),

    comment: z
        .string({ error: "Comment must be a string" })
        .trim()
        .max(500, "Comment cannot exceed 500 characters")
        .optional()
        .default(""),
});