import { Router } from "express";

import {
    getCakeReviews,
    getMyCakeReview,
    createReview,
    deleteReview,
    getAdminReviews,
    getLatestReviews,
} from "../controllers/review.controller.js";
import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { createReviewSchema } from "../validations/review.validation.js";
import { reviewLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = Router();

// Public: latest reviews across all cakes (home page testimonial carousel)
router.route("/reviews/latest").get(getLatestReviews);

// Public reviews list for a cake
router.route("/cakes/:slug/reviews").get(getCakeReviews);

// Authenticated: the current user's own review for this cake
router
    .route("/cakes/:slug/reviews/me")
    .get(isAuthenticatedUser, getMyCakeReview);

// Authenticated: submit a review (one review per user per cake)
router
    .route("/cakes/:slug/reviews")
    .post(
        isAuthenticatedUser,
        reviewLimiter,
        validateRequest(createReviewSchema),
        createReview,
    );

// Delete a review (admin moderation only — reviews are one-time records
// and owners cannot delete their own to re-submit a different one)
router
    .route("/reviews/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

// Admin moderation
router
    .route("/admin/reviews")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminReviews);

router
    .route("/admin/reviews/:id")
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteReview);

export default router;
