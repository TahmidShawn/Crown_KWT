import { Router } from "express";
import {
    registerUser,
    loginUser,
    googleLogin,
    logout,
    verifyEmail,
    resendVerification,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
} from "../controllers/auth.controller.js";
import { isAuthenticatedUser } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verificationSchema,
} from "../validations/user.validation.js";
import { authLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Register
router
    .route("/auth/register")
    .post(authLimiter, validateRequest(registerSchema), registerUser);

// Login
router
    .route("/auth/login")
    .post(authLimiter, validateRequest(loginSchema), loginUser);

// Google Login
router.route("/auth/google").post(googleLogin);

// Refresh access token
router.route("/auth/refresh-token").post(authLimiter, refreshAccessToken);

// Verify email
router
    .route("/auth/verify-email")
    .post(authLimiter, validateRequest(verificationSchema), verifyEmail);

// Resend verification code
router
    .route("/auth/resend-verification")
    .post(
        authLimiter,
        validateRequest(forgotPasswordSchema),
        resendVerification,
    );

// Forgot password
router
    .route("/password/forgot")
    .post(authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);

// Reset password
router
    .route("/password/reset/:token")
    .put(authLimiter, validateRequest(resetPasswordSchema), resetPassword);

// Logout
router.route("/auth/logout").post(isAuthenticatedUser, logout);

export default router;
