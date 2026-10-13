import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import sendToken from "../utils/sendToken.js";

export const getMe = asyncHandler(async (req, res) => {
    res.status(200).json({
        success: true,
        message: "User found",
        data: req.user,
    });
});

export const updatePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("+password");

    const isPasswordMatched = await user.comparePassword(
        req.body.currentPassword,
    );

    if (!isPasswordMatched) {
        throw new ErrorHandler("Current password is incorrect", 401);
    }

    user.password = req.body.newPassword;

    await user.save();

    await sendToken(user, 200, res, "Password updated successfully");
});

/*
 * Admin: list every registered account together with their order rollups, so
 * the panel can show lifetime value without a request per customer.
 *
 * All roles are returned and flagged with `isStaff`, rather than filtering to
 * role "user" here: staff often place test orders, and silently dropping those
 * accounts made their real orders (and spend) disappear from the page. The UI
 * decides what to emphasise; the API stays truthful about who ordered what.
 */
export const getAllCustomers = asyncHandler(async (req, res) => {
    const customers = await User.aggregate([
        {
            $lookup: {
                from: "orders",
                localField: "_id",
                foreignField: "user",
                as: "orders",
            },
        },

        {
            $addFields: {
                totalOrders: { $size: "$orders" },
                totalSpent: { $sum: "$orders.totalPrice" },
                lastOrderAt: { $max: "$orders.createdAt" },
                deliveredOrders: {
                    $size: {
                        $filter: {
                            input: "$orders",
                            as: "order",
                            cond: {
                                $eq: ["$$order.orderStatus", "delivered"],
                            },
                        },
                    },
                },
                cancelledOrders: {
                    $size: {
                        $filter: {
                            input: "$orders",
                            as: "order",
                            cond: {
                                $eq: ["$$order.orderStatus", "cancelled"],
                            },
                        },
                    },
                },
                isStaff: { $ne: ["$role", "user"] },
            },
        },

        // Never send the joined order documents (or secrets) to the client.
        {
            $project: {
                orders: 0,
                password: 0,
                refreshToken: 0,
                googleId: 0,
                verifyCode: 0,
                resetPasswordToken: 0,
            },
        },

        // Most active first, then newest accounts.
        { $sort: { totalOrders: -1, createdAt: -1 } },
    ]);

    res.status(200).json({
        success: true,
        message: "Customers fetched successfully",
        data: customers,
    });
});


