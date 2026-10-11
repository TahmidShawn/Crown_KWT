import asyncHandler from "../utils/asyncHandler.js";
import Order from "../models/order.model.js";
import Cake from "../models/cake.model.js";
import Category from "../models/category.model.js";

export const getAdminStats = asyncHandler(async (req, res) => {
    const [
        totalOrders,
        pendingOrders,
        totalProducts,
        totalCategories,
        customerIds,
    ] = await Promise.all([
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: "pending" }),
        Cake.countDocuments(),
        Category.countDocuments(),
        // Unique customers who have placed at least one order
        Order.distinct("user"),
    ]);

    res.status(200).json({
        success: true,
        message: "Stats fetched successfully",
        data: {
            totalOrders,
            pendingOrders,
            totalProducts,
            totalCategories,
            totalCustomers: customerIds.length,
        },
    });
});
