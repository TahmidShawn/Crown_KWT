import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Please enter your name"],
            maxLength: [30, "Name cannot exceed 30 characters"],
            minLength: [4, "Name should have more than 4 characters"],
            trim: true,
        },

        email: {
            type: String,
            required: [true, "Please enter your email"],
            unique: true,
            lowercase: true,
            trim: true,
            maxLength: [200, "Email cannot exceed 200 characters"],
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
        },

        phone: {
            type: String,
            trim: true,
            match: [
                /^(\+965)?[569]\d{7}$/,
                "Please enter a valid Kuwait phone number",
            ],
        },

        password: {
            type: String,
            required: function () {
                return this.authProvider === "local";
            },
            maxLength: [100, "Password cannot exceed 100 characters"],
            minLength: [8, "Password should have a minimum of 8 characters"],
            select: false,
        },

        authProvider: {
            type: String,
            enum: ["local", "google"],
            default: "local",
        },

        googleId: {
            type: String,
            unique: true,
            sparse: true,
            select: false,
        },

        avatarUrl: {
            type: String,
            default: null,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "admin",  // will change later to user
        },

        isVerified: {
            type: Boolean,
            default: false,
        },

        verifyCode: {
            type: String,
            select: false,
        },

        verifyCodeExpiry: {
            type: Date,
            select: false,
        },

        resetPasswordToken: {
            type: String,
            select: false,
        },

        resetPasswordExpire: {
            type: Date,
            select: false,
        },

        refreshToken: {
            type: String,
            select: false,
        },

        preferredLanguage: {
            type: String,
            enum: ["en", "ar"],
            default: "en",
        },
    },
    {
        timestamps: true,
    },
);

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.googleId;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.verifyCode;
        delete ret.verifyCodeExpiry;
        delete ret.refreshToken;
        delete ret.__v;

        return ret;
    },
});

userSchema.pre("save", async function hashPassword() {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.getJwtToken = function getJwtToken() {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
};

userSchema.methods.getRefreshToken = function getRefreshToken() {
    return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRE,
    });
};

userSchema.methods.comparePassword = async function comparePassword(password) {
    if (!this.password) return false;

    return bcrypt.compare(password, this.password);
};

userSchema.methods.getResetPasswordToken = function getResetPasswordToken() {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
};

userSchema.methods.getVerificationCode = function getVerificationCode() {
    const plainCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.verifyCode = crypto
        .createHash("sha256")
        .update(plainCode)
        .digest("hex");

    this.verifyCodeExpiry = Date.now() + 10 * 60 * 1000;

    return plainCode;
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
