import mongoose from "mongoose";
import generateSlug from "../utils/generateSlug.js";
const cakeSchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, "Please enter product name in English"],
                trim: true,
                minLength: [3, "Product name must be at least 3 characters"],
                maxLength: [150, "Product name cannot exceed 150 characters"],
            },
            ar: {
                type: String,
                required: [true, "Please enter product name in Arabic"],
                trim: true,
                minLength: [3, "Product name must be at least 3 characters"],
                maxLength: [150, "Product name cannot exceed 150 characters"],
            },
        },
        slug: { type: String, unique: true, lowercase: true, trim: true },
        description: {
            en: {
                type: String,
                required: [true, "Please enter product description in English"],
                minLength: [10, "Description must be at least 10 characters"],
                maxLength: [1000, "Description cannot exceed 1000 characters"],
            },
            ar: {
                type: String,
                required: [true, "Please enter product description in Arabic"],
                minLength: [10, "Description must be at least 10 characters"],
                maxLength: [1000, "Description cannot exceed 1000 characters"],
            },
        },
        images: {
            type: [
                {
                    url: { type: String, required: true },
                    fileId: { type: String, required: true },
                    _id: false,
                },
            ],
            required: [true, "Please upload at least one product image"],
            validate: {
                validator: (images) => images && images.length > 0,
                message: "At least one image is required",
            },
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Please select a category"],
            index: true,
        },
        flavor: {
            type: [String],
            required: [true, "Please select at least one cake flavor"],
            validate: {
                validator: function (flavors) {
                    return Array.isArray(flavors) && flavors.length >= 1 && flavors.length <= 5;
                },
                message: "Please select between 1 and 5 cake flavors",
            },
            enum: [
                "chocolate",
                "vanilla",
                "red-velvet",
                "strawberry",
                "carrot",
                "butterscotch",
                "black-forest",
                "lemon",
                "mango",
                "pistachio",
            ],
        },
        weightSize: {
            type: String,
            required: [true, "Please select the cake size"],
            enum: {
                values: ["small", "medium"],
                message: "Size must be either small or medium",
            },
        },
        price: {
            type: Number,
            required: [true, "Please enter product price"],
            min: [0, "Price cannot be negative"],
            validate: {
                validator: (value) =>
                    Number.isFinite(value) &&
                    Number(value.toFixed(3)) === value,
                message:
                    "Price must be a valid KWD amount with up to 3 decimal places",
            },
        },
        discountPercentage: {
            type: Number,
            default: 0,
            min: [0, "Discount cannot be negative"],
            max: [100, "Discount cannot exceed 100%"],
        },
        stock: {
            type: Number,
            required: [true, "Please enter product stock"],
            min: [0, "Stock cannot be negative"],
            default: 0,
        },
        isCustomAvailable: { type: Boolean, default: false },
        isFeatured: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        avgRating: { type: Number, default: 0, min: 0, max: 5 },
        numReviews: { type: Number, default: 0 },
        salesCount: { type: Number, default: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        tags: [String],
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (doc, ret) => {
                delete ret.__v;
                delete ret.id;

                ret.price = ret.price.toFixed(3);

                if (ret.discountedPrice !== undefined) {
                    ret.discountedPrice = ret.discountedPrice.toFixed(3);
                }

                return ret;
            },
        },
        toObject: { virtuals: true },
    },
);

cakeSchema.pre("validate", function generateCakeSlug() {
    if (this.name?.en && (!this.slug || this.isModified("name.en"))) {
        this.slug = generateSlug(this.name.en);
    }
});

cakeSchema.virtual("discountedPrice").get(function () {
    if (!this.discountPercentage) {
        return Number(this.price.toFixed(3));
    }
    return Number(
        (this.price - (this.price * this.discountPercentage) / 100).toFixed(3),
    );
});

cakeSchema.virtual("servings").get(function () {
    if (this.weightSize === "small") return "3-4";
    if (this.weightSize === "medium") return "8-12";
    return null;
});

cakeSchema.index({ "name.en": "text", "name.ar": "text" });

const Cake = mongoose.models.Cake || mongoose.model("Cake", cakeSchema);
export default Cake;
