import { Router } from "express";
import {
    createPayment,
    paymentCallback,
    myFatoorahWebhook,
} from "../controllers/payment.controller.js";
import { isAuthenticatedUser } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { createPaymentSchema } from "../validations/payment.validation.js";
import { webhookLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

router
    .route("/payments")
    .post(
        isAuthenticatedUser,
        validateRequest(createPaymentSchema),
        createPayment,
    );

// GET callback: used by the client-side redirect flow (kept for backward
// compatibility with the existing paymentResult pages). It is not the
// primary completion channel; the webhook is.
router.route("/payments/callback").get(paymentCallback);

// POST webhook: MyFatoorah server-to-server notification of payment status.
// Rate-limited via webhookLimiter to prevent duplicate order confirmation.
router.route("/payments/webhook").post(webhookLimiter, myFatoorahWebhook);

export default router;