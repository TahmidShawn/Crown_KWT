import mongoose from "mongoose";

export const ORDER_STATUSES = [
    "pending",
    "confirmed",
    "out_for_delivery",
    "delivered",
    "cancelled",
];

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        shippingAddress: {
            fullName: {
                type: String,
                required: true,
                trim: true,
                minLength: [4, "Full name must be at least 4 characters"],
                maxLength: [30, "Full name cannot exceed 30 characters"],
            },

            // Stored in normalized form: +965XXXXXXXX
            phone: {
                type: String,
                required: true,
                match: [/^(\+965)?[2-9]\d{7}$/, "Invalid Kuwait phone number"],
            },

            governorate: {
                type: String,
                enum: [
                    "Al Asimah",
                    "Hawalli",
                    "Farwaniya",
                    "Mubarak Al-Kabeer",
                    "Ahmadi",
                    "Jahra",
                ],
                required: true,
            },

            area: {
                type: String,
                required: true,
                trim: true,
            },

            block: {
                type: String,
                required: true,
                trim: true,
            },

            street: {
                type: String,
                required: true,
                trim: true,
            },

            building: {
                type: String,
                required: true,
                trim: true,
            },

            floor: {
                type: String,
                trim: true,
            },

            apartmentNo: {
                type: String,
                trim: true,
            },

            notes: {
                type: String,
                trim: true,
                maxLength: [300, "Delivery notes cannot exceed 300 characters"],
            },
        },

        items: {
            type: [
                {
                    cake: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Cake",
                        required: true,
                    },

                    name: {
                        en: {
                            type: String,
                            required: true,
                        },

                        ar: {
                            type: String,
                            required: true,
                        },
                    },

                    imageUrl: {
                        type: String,
                    },

                    specialInstructions: {
                        type: String,
                        trim: true,
                        maxLength: [
                            500,
                            "Special instructions cannot exceed 500 characters",
                        ],
                    },

                    price: {
                        type: Number,
                        required: true,
                    },

                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                    },

                    totalPrice: {
                        type: Number,
                        required: true,
                    },

                    _id: false,
                },
            ],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: "Order must contain at least one item",
            },
        },
        addOns: {
            type: [
                {
                    addOn: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "AddOn",
                        required: true,
                    },

                    name: {
                        en: {
                            type: String,
                            required: true,
                        },

                        ar: {
                            type: String,
                            required: true,
                        },
                    },

                    imageUrl: {
                        type: String,
                    },

                    price: {
                        type: Number,
                        required: true,
                        min: 0,
                    },

                    quantity: {
                        type: Number,
                        required: true,
                        min: 1,
                    },

                    totalPrice: {
                        type: Number,
                        required: true,
                        min: 0,
                    },

                    _id: false,
                },
            ],
            default: [],
        },

        paymentMethod: {
            type: String,
            enum: ["online", "cash_on_delivery"],
            required: true,
        },

        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },

        discount: {
            type: Number,
            default: 0,
            min: 0,
        },

        deliveryFee: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0,
        },

        orderStatus: {
            type: String,
            enum: ORDER_STATUSES,
            default: "pending",
        },

        statusHistory: {
            type: [
                {
                    status: {
                        type: String,
                        enum: ORDER_STATUSES,
                        required: true,
                    },

                    note: {
                        type: String,
                        trim: true,
                    },

                    changedAt: {
                        type: Date,
                        default: Date.now,
                    },

                    _id: false,
                },
            ],
            default: [],
        },

        deliveredAt: {
            type: Date,
        },

        adminNotes: {
            type: String,
            trim: true,
        },

        cancelledAt: {
            type: Date,
        },

        cancellationReason: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    },
);

orderSchema.pre("validate", function generateOrderNumber() {
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.floor(100000 + Math.random() * 900000);

        this.orderNumber = `ORD-${timestamp}${random}`;
    }
});

orderSchema.index({
    user: 1,
    createdAt: -1,
});

orderSchema.index({
    orderStatus: 1,
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
