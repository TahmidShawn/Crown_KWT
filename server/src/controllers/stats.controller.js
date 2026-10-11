import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
import Cake from "../models/cake.model.js";
import Category from "../models/category.model.js";
import User from "../models/user.model.js";

export const getAdminStats = asyncHandler(async (req, res) => {
    const [
        totalOrders,
        pendingOrders,
        totalProducts,
        totalCategories,
        orderingUserIds,
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        Cake.countDocuments(),
        Category.countDocuments(),
        Order.distinct("user"),
    ]);

    // Customers are real shoppers only (role "user"). Staff/admin accounts
    // never count, even when they place test orders themselves.
    const totalCustomers = await User.countDocuments({
        _id: { $in: orderingUserIds },
        role: "user",
    });

    res.status(200).json({
        success: true,
        message: "Stats fetched successfully",
        data: {
            totalOrders,
            pendingOrders,
            totalProducts,
            totalCategories,
            totalCustomers,
        },
    });
});
