import Category from "../models/category.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { nameEn, nameAr, isActive, isPopular } = req.body;
    const file = req.file;

    if (!file) {
        throw new ErrorHandler("Category image is required", 400);
    }

    const name = { en: nameEn, ar: nameAr };

    const existing = await Category.findOne({
        $or: [{ "name.en": nameEn }, { "name.ar": nameAr }],
    });

    if (existing) {
        throw new ErrorHandler("Category with this name already exists", 409);
    }

    const { url, fileId } = await uploadFile(
        file.buffer,
        file.originalname,
        "categories",
    );

    let category;

    try {
        category = await Category.create({
            name,
            imageUrl: url,
            imageFileId: fileId,
            isActive: isActive !== undefined ? isActive : true,
            isPopular: isPopular !== undefined ? isPopular : false,
        });
    } catch (error) {
        await deleteFile(fileId);
        throw error;
    }

    res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
    });
});

export const getCategories = asyncHandler(async (req, res) => {
    const { page = 1, limit, sort = "newest", isPopular } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);

    // Mirrors the cakes controller: a missing or invalid limit returns every
    // match, while a valid one is capped so a client cannot request the
    // whole table in a single response.
    const parsedLimit = parseInt(limit, 10);
    const limitNum =
        Number.isFinite(parsedLimit) && parsedLimit > 0
            ? Math.min(parsedLimit, 100)
            : null;

    const skip = limitNum ? (pageNum - 1) * limitNum : 0;

    // Popular categories: simple find, no cakeCount aggregation needed.
    // Admins mark categories as popular via the isPopular toggle.
    if (isPopular === "true") {
        const categories = await Category.find({
            isActive: true,
            isPopular: true,
        })
            .sort({ createdAt: -1 })
            .skip(limitNum ? skip : 0)
            .limit(limitNum)
            .select("-imageFileId -__v");

        return res.status(200).json({
            success: true,
            message: "Popular categories fetched successfully",
            data: categories,
        });
    }

    // Sorting
    let sortOption = {
        createdAt: -1,
    };

    if (sort === "newest") {
        sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
        sortOption = { createdAt: 1 };
    } else if (sort === "name") {
        sortOption = { "name.en": 1 };
    }

    const pipeline = [
        {
            $match: {
                isActive: true,
            },
        },
        {
            $lookup: {
                from: "cakes",
                localField: "_id",
                foreignField: "category",
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                        },
                    },
                    {
                        $count: "count",
                    },
                ],
                as: "cakeCount",
            },
        },
        {
            $addFields: {
                cakeCount: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$cakeCount.count", 0],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                imageFileId: 0,
            },
        },
        {
            $sort: sortOption,
        },
    ];

    if (limitNum) {
        pipeline.push({ $skip: skip }, { $limit: limitNum });
    }

    const countPipeline = [
        {
            $match: {
                isActive: true,
            },
        },
        {
            $count: "total",
        },
    ];

    const [categories, countResult] = await Promise.all([
        Category.aggregate(pipeline),
        limitNum ? Category.aggregate(countPipeline) : Promise.resolve([]),
    ]);

    const total = limitNum ? (countResult[0]?.total ?? 0) : categories.length;

    res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum || total,
            pages: limitNum ? Math.ceil(total / limitNum) : 1,
        },
    });
});

export const getAdminCategories = asyncHandler(async (req, res) => {
    const categories = await Category.aggregate([
        {
            $lookup: {
                from: "cakes",
                localField: "_id",
                foreignField: "category",
                pipeline: [
                    {
                        $match: {
                            isActive: true,
                        },
                    },
                    {
                        $count: "count",
                    },
                ],
                as: "cakeCount",
            },
        },
        {
            $addFields: {
                cakeCount: {
                    $ifNull: [
                        {
                            $arrayElemAt: ["$cakeCount.count", 0],
                        },
                        0,
                    ],
                },
            },
        },
        {
            $project: {
                imageFileId: 0,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
    ]);

    res.status(200).json({
        success: true,
        message: "Categories fetched successfully",
        data: categories,
    });
});

export const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        throw new ErrorHandler("Category not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Category fetched successfully",
        data: category,
    });
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nameEn, nameAr, isActive, isPopular } = req.body;
    const file = req.file;

    const category = await Category.findById(id);

    if (!category) {
        throw new ErrorHandler("Category not found", 404);
    }

    const updateData = {};

    if (nameEn || nameAr) {
        if (nameEn) updateData["name.en"] = nameEn;
        if (nameAr) updateData["name.ar"] = nameAr;

        const duplicate = await Category.findOne({
            _id: { $ne: id },
            $or: [
                ...(nameEn ? [{ "name.en": nameEn }] : []),
                ...(nameAr ? [{ "name.ar": nameAr }] : []),
            ],
        });

        if (duplicate) {
            throw new ErrorHandler(
                "Category with this name already exists",
                409,
            );
        }
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }

    if (isPopular !== undefined) {
        updateData.isPopular = isPopular;
    }

    let newFileId = null;
    const oldFileId = category.imageFileId;

    if (file) {
        const { url, fileId } = await uploadFile(
            file.buffer,
            file.originalname,
            "categories",
        );

        updateData.imageUrl = url;
        updateData.imageFileId = fileId;
        newFileId = fileId;
    }

    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            {
                new: true,
                runValidators: true,
            },
        );

        if (newFileId && oldFileId) {
            await deleteFile(oldFileId);
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
        });
    } catch (error) {
        if (newFileId) {
            await deleteFile(newFileId);
        }

        throw error;
    }
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
        throw new ErrorHandler("Category not found", 404);
    }

    if (category.imageFileId) {
        await deleteFile(category.imageFileId);
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: "Category deleted successfully",
    });
});
