import mongoose from "mongoose";

export const PAYMENT_STATUSES = [
    "pending",
    "paid",
    "failed",
    "cancelled",
    "expired",
    "refunded",
];

const transactionSchema = new mongoose.Schema(
    {
        paymentId: {
            type: String,
            trim: true,
        },

        transactionId: {
            type: String,
            trim: true,
        },

        referenceId: {
            type: String,
            trim: true,
        },

        status: {
            type: String,
            trim: true,
        },

        paymentMethod: {
            type: String,
            trim: true,
        },

        amount: {
            type: Number,
            min: 0,
        },

        errorCode: {
            type: String,
            trim: true,
        },

        errorMessage: {
            type: String,
            trim: true,
        },

        processedAt: {
            type: Date,
        },
    },
    {
        _id: false,
    },
);

const paymentSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
            required: true,
            unique: true,
            index: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        provider: {
            type: String,
            enum: ["myfatoorah"],
            default: "myfatoorah",
            required: true,
        },

        invoiceId: {
            type: String,
            unique: true,
            sparse: true,
            index: true,
        },

        paymentUrl: {
            type: String,
        },

        amount: {
            type: Number,
            required: true,
            min: 0,
        },

        currency: {
            type: String,
            enum: ["KWD"],
            default: "KWD",
            required: true,
        },

        status: {
            type: String,
            enum: PAYMENT_STATUSES,
            default: "pending",
            required: true,
            index: true,
        },

        transactions: {
            type: [transactionSchema],
            default: [],
        },

        paidAt: {
            type: Date,
        },

        lastWebhookAt: {
            type: Date,
        },

        lastWebhookReference: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

paymentSchema.index({
    user: 1,
    createdAt: -1,
});

const Payment =
    mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;
