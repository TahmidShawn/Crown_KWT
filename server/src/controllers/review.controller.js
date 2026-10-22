import mongoose from "mongoose";

import Cake from "../models/cake.model.js";
import Review from "../models/review.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ErrorHandler from "../utils/errorHandler.js";

const REVIEW_LIMIT = 10;

const buildDistribution = (reviews) => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    reviews.forEach((review) => {
        const rating = Number(review.rating);

        if (rating >= 1 && rating <= 5) {
            distribution[rating] += 1;
        }
    });

    return distribution;
};

const recalculateCakeRating = async (cakeId) => {
    const [summary] = await Review.aggregate([
        { $match: { cake: new mongoose.Types.ObjectId(String(cakeId)) } },
        {
            $group: {
                _id: "$cake",
                avgRating: { $avg: "$rating" },
                numReviews: { $sum: 1 },
            },
        },
    ]);

    await Cake.findByIdAndUpdate(cakeId, {
        avgRating: summary ? Number(summary.avgRating.toFixed(2)) : 0,
        numReviews: summary ? summary.numReviews : 0,
    });
};

export const getCakeReviews = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const pageNum = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNum = Math.min(
        Math.max(parseInt(req.query.limit, 10) || REVIEW_LIMIT, 1),
        50,
    );

    const cake = await Cake.findOne({ slug, isActive: true });

    if (!cake) {
        throw new ErrorHandler("Cake not found", 404);
    }

    const [reviews, total, allRatings] = await Promise.all([
        Review.find({ cake: cake._id })
            .populate("user", "username avatarUrl")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean(),
        Review.countDocuments({ cake: cake._id }),
        Review.find({ cake: cake._id }).select("rating").lean(),
    ]);

    const avgRating = allRatings.length
        ? Number(
              (
                  allRatings.reduce(
                      (sum, item) => sum + Number(item.rating),
                      0,
                  ) / allRatings.length
              ).toFixed(2),
          )
        : 0;

    res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        data: reviews,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
        summary: {
            avgRating,
            numReviews: total,
            distribution: buildDistribution(allRatings),
        },
    });
});

export const getMyCakeReview = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const cake = await Cake.findOne({ slug, isActive: true });

    if (!cake) {
        throw new ErrorHandler("Cake not found", 404);
    }

    const review = await Review.findOne({
        cake: cake._id,
        user: req.user._id,
    }).lean();

    res.status(200).json({
        success: true,
        message: "Review fetched successfully",
        data: review,
    });
});

export const createReview = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { rating, comment } = req.body;

    const cake = await Cake.findOne({ slug, isActive: true });

    if (!cake) {
        throw new ErrorHandler("Cake not found", 404);
    }

    const existingReview = await Review.findOne({
        cake: cake._id,
        user: req.user._id,
    });

    if (existingReview) {
        throw new ErrorHandler(
            "You have already reviewed this cake. Each review can only be submitted once.",
            409,
        );
    }

    let review;

    try {
        review = await Review.create({
            cake: cake._id,
            user: req.user._id,
            rating,
            comment: comment || "",
        });
    } catch (error) {
        // Unique index { cake, user } — guards against a concurrent double submit.
        if (error.code === 11000) {
            throw new ErrorHandler(
                "You have already reviewed this cake. Each review can only be submitted once.",
                409,
            );
        }

        throw error;
    }

    await recalculateCakeRating(cake._id);

    const populatedReview = await Review.findById(review._id)
        .populate("user", "username avatarUrl")
        .lean();

    res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        data: populatedReview,
    });
});

export const deleteReview = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
        throw new ErrorHandler("Review not found", 404);
    }

    // Reviews are a one-time, one-per-cake record — a user cannot delete
    // their own review and re-submit a different one. Deletion is reserved
    // for admin moderation (abusive or spam content).
    if (req.user.role !== "admin") {
        throw new ErrorHandler(
            "You are not allowed to delete this review",
            403,
        );
    }

    await review.deleteOne();
    await recalculateCakeRating(review.cake);

    res.status(200).json({
        success: true,
        message: "Review deleted successfully",
    });
});

// Public: the latest reviews across all cakes (used by the home page
// testimonial carousel). Capped at a small number so the payload stays light.
export const getLatestReviews = asyncHandler(async (req, res) => {
    const limitNum = Math.min(
        Math.max(parseInt(req.query.limit, 10) || 8, 1),
        24,
    );

    const reviews = await Review.find({})
        .populate("user", "username avatarUrl")
        .populate("cake", "name slug images avgRating")
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .lean();

    res.status(200).json({
        success: true,
        message: "Latest reviews fetched successfully",
        data: reviews,
    });
});

export const getAdminReviews = asyncHandler(async (req, res) => {
    const pageNum = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitNum = Math.min(
        Math.max(parseInt(req.query.limit, 10) || REVIEW_LIMIT, 1),
        50,
    );

    const filter = {};

    if (req.query.cake) {
        const cake = await Cake.findOne({ slug: req.query.cake });

        if (!cake) {
            throw new ErrorHandler("Cake not found", 404);
        }

        filter.cake = cake._id;
    }

    const [reviews, total] = await Promise.all([
        Review.find(filter)
            .populate("user", "username avatarUrl")
            .populate("cake", "name slug")
            .sort({ createdAt: -1 })
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum)
            .lean(),
        Review.countDocuments(filter),
    ]);

    res.status(200).json({
        success: true,
        message: "Reviews fetched successfully",
        data: reviews,
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
        },
    });
});
