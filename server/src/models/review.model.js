import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        cake: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cake",
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        // Optional — kept for a future "verified purchase only" flow.
        // Today any authenticated user may review any cake.
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            default: null,
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            required: [true, "Please provide a rating"],
            min: [1, "Rating must be at least 1"],
            max: [5, "Rating cannot exceed 5"],
        },
        comment: {
            type: String,
            trim: true,
            maxLength: [500, "Comment cannot exceed 500 characters"],
        },
    },
    { timestamps: true },
);

reviewSchema.index({ cake: 1, user: 1 }, { unique: true });

const Review = mongoose.models.Review || mongoose.model("Review", reviewSchema);
export default Review;
