import { z } from "zod";

const email = z
    .string({ error: "Email is required" })
    .trim()
    .toLowerCase()
    .max(200, "Email cannot exceed 200 characters")
    .pipe(z.email("Please enter a valid email address"));

export const registerSchema = z.object({
    username: z
        .string({ error: "Please enter your username" })
        .trim()
        .min(4, "Username must be at least 4 characters")
        .max(30, "Username cannot exceed 30 characters"),
    email,
    password: z
        .string({ error: "Please enter your password" })
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password cannot exceed 100 characters"),
});

export const loginSchema = z.object({
    email,
    password: z
        .string({ error: "Please enter your password" })
        .min(1, "Please enter your password"),
});

export const forgotPasswordSchema = z.object({
    email,
});

export const resetPasswordSchema = z
    .object({
        password: z
            .string({ error: "Please enter your password" })
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password cannot exceed 100 characters"),
        confirmPassword: z.string({ error: "Please confirm your password" }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const updatePasswordSchema = z
    .object({
        currentPassword: z
            .string({ error: "Please enter your current password" })
            .min(1, "Please enter your current password"),
        newPassword: z
            .string({ error: "Please enter your new password" })
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password cannot exceed 100 characters"),
        confirmPassword: z.string({
            error: "Please confirm your new password",
        }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const verificationSchema = z.object({
    email,
    code: z
        .string({ error: "Please enter the verification code" })
        .length(6, "Verification code must be exactly 6 digits")
        .regex(/^\d+$/, "Verification code must contain only numbers"),
});
