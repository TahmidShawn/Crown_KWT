import mongoose from "mongoose";

const addOnSchema = new mongoose.Schema(
    {
        name: {
            en: {
                type: String,
                required: [true, "Please enter add-on name in English"],
                trim: true,
                maxLength: [100, "Add-on name cannot exceed 100 characters"],
            },
            ar: {
                type: String,
                required: [true, "Please enter add-on name in Arabic"],
                trim: true,
                maxLength: [100, "Add-on name cannot exceed 100 characters"],
            },
        },

        imageUrl: {
            type: String,
            required: [true, "Please provide an add-on image"],
        },

        imageFileId: {
            type: String,
            required: [true, "Missing image file reference"],
        },

        price: {
            type: Number,
            required: [true, "Please enter add-on price"],
            min: [0, "Price cannot be negative"],
            validate: {
                validator: (value) =>
                    Number.isFinite(value) &&
                    Number(value.toFixed(3)) === value,
                message:
                    "Price must be a valid KWD amount with up to 3 decimal places",
            },
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    },
);

addOnSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.imageFileId;

        ret.price = ret.price.toFixed(3);

        return ret;
    },
});

const AddOn = mongoose.models.AddOn || mongoose.model("AddOn", addOnSchema);

export default AddOn;
