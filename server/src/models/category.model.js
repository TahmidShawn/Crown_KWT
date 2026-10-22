import mongoose from "mongoose";
import generateSlug from "../utils/generateSlug.js";

const categorySchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, "Please enter category name in English"],
                trim: true,
                maxLength: [80, "Category name cannot exceed 80 characters"],
            },
            ar: {
                type: String,
                required: [true, "Please enter category name in Arabic"],
                trim: true,
                maxLength: [80, "Category name cannot exceed 80 characters"],
            },
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },
        imageUrl: {
            type: String,
            required: [true, "Please provide a category image"],
        },
        imageFileId: {
            type: String,
            required: [true, "Missing image file reference"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isPopular: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

// generate slog from english name only
categorySchema.pre("validate", function generateCategorySlug() {
    if (this.name?.en && (!this.slug || this.isModified("name.en"))) {
        this.slug = generateSlug(this.name.en);
    }
});

categorySchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.imageFileId;
        return ret;
    },
});

const Category =
    mongoose.models.Category || mongoose.model("Category", categorySchema);
export default Category;
