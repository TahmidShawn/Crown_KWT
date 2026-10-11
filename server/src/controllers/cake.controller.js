import Cake from "../models/cake.model.js";
import Category from "../models/category.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";

const uploadCakeImages = async (files) => {
    const images = [];

    try {
        for (const file of files) {
            const { url, fileId } = await uploadFile(
                file.buffer,
                file.originalname,
                "cakes",
            );

            images.push({
                url,
                fileId,
            });
        }

        return images;
    } catch (error) {
        await Promise.allSettled(
            images.map((image) => deleteFile(image.fileId)),
        );

        throw error;
    }
};

const deleteCakeImages = async (images) => {
    if (!images?.length) return;

    await Promise.allSettled(
        images
            .filter((image) => image.fileId)
            .map((image) => deleteFile(image.fileId)),
    );
};

const parseTags = (tags) => {
    if (!tags) return [];

    if (Array.isArray(tags)) {
        return tags
            .flatMap((tag) => (typeof tag === "string" ? tag.split(",") : []))
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    if (typeof tags === "string") {
        return tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }

    return [];
};

/*
 * MongoDB cannot query or sort a Mongoose virtual directly.
 *
 * This expression calculates the same discounted price as the
 * Cake model's `discountedPrice` virtual.
 */
const discountedPriceExpression = {
    $round: [
        {
            $subtract: [
                "$price",
                {
                    $divide: [
                        {
                            $multiply: [
                                "$price",
                                {
                                    $ifNull: ["$discountPercentage", 0],
                                },
                            ],
                        },
                        100,
                    ],
                },
            ],
        },
        3,
    ],
};

/*
 * Format prices for aggregation results because aggregation returns
 * plain objects and therefore does not run the Mongoose toJSON transform.
 */
const formatCakePrices = (cake) => {
    if (cake.price !== undefined) {
        cake.price = Number(cake.price).toFixed(3);
    }

    if (cake.discountedPrice !== undefined) {
        cake.discountedPrice = Number(cake.discountedPrice).toFixed(3);
    }

    return cake;
};

export const createCake = asyncHandler(async (req, res) => {
    const {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        category,
        flavor,
        weightSize,
        price,
        discountPercentage,
        stock,
        isCustomAvailable,
        isFeatured,
        isActive,
        tags,
    } = req.body;

    const files = req.files;

    if (!files?.length) {
        throw new ErrorHandler("At least one cake image is required", 400);
    }

    const existingCategory = await Category.findById(category);

    if (!existingCategory) {
        throw new ErrorHandler("Category not found", 404);
    }

    const existingCake = await Cake.findOne({
        $or: [{ "name.en": nameEn }, { "name.ar": nameAr }],
    });

    if (existingCake) {
        throw new ErrorHandler("Cake with this name already exists", 409);
    }

    const images = await uploadCakeImages(files);

    const parsedTags = parseTags(tags);

    try {
        const cake = await Cake.create({
            name: {
                en: nameEn,
                ar: nameAr,
            },
            description: {
                en: descriptionEn,
                ar: descriptionAr,
            },
            images,
            category,
            flavor,
            weightSize,
            price,
            discountPercentage,
            stock,
            isCustomAvailable,
            isFeatured,
            isActive,
            tags: parsedTags,
            createdBy: req.user?._id,
        });

        await cake.populate("category", "name slug");

        res.status(201).json({
            success: true,
            message: "Cake created successfully",
            data: cake,
        });
    } catch (error) {
        await deleteCakeImages(images);
        throw error;
    }
});

export const getCakes = asyncHandler(async (req, res) => {
    const { category, price, size, sort = "featured", limit, search } =
        req.query;

    const filter = {
        isActive: true,
    };

    // Text search across English and Arabic names
    if (search && String(search).trim()) {
        const term = String(search).trim();

        filter.$or = [
            { "name.en": { $regex: term, $options: "i" } },
            { "name.ar": { $regex: term, $options: "i" } },
        ];
    }

    // Category filter
    if (category) {
        const existingCategory = await Category.findOne({
            slug: category,
            isActive: true,
        }).select("_id");

        if (!existingCategory) {
            throw new ErrorHandler("Category not found", 404);
        }

        filter.category = existingCategory._id;
    }

    // Price filter
    let priceFilter;

    if (price) {
        const [min, max] = price.split("-").map(Number);

        if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) {
            throw new ErrorHandler("Invalid price range", 400);
        }

        priceFilter = {
            $gte: min,
            $lte: max,
        };
    }

    // Size filter
    if (size) {
        const sizes = size
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        const allowedSizes = ["small", "medium"];

        const hasInvalidSize = sizes.some(
            (item) => !allowedSizes.includes(item),
        );

        if (hasInvalidSize) {
            throw new ErrorHandler("Invalid size", 400);
        }

        if (sizes.length > 0) {
            filter.weightSize = {
                $in: sizes,
            };
        }
    }

    // Sorting
    let sortOption = {
        createdAt: -1,
    };

    if (sort === "price-low") {
        sortOption = {
            discountedPrice: 1,
            createdAt: -1,
        };
    }

    if (sort === "price-high") {
        sortOption = {
            discountedPrice: -1,
            createdAt: -1,
        };
    }

    if (sort === "name") {
        sortOption = {
            "name.en": 1,
        };
    }

    if (sort === "discount") {
        sortOption = {
            discountPercentage: -1,
            createdAt: -1,
        };
    }

    const pipeline = [
        {
            $match: filter,
        },

        {
            $addFields: {
                discountedPrice: discountedPriceExpression,
            },
        },
    ];

    if (priceFilter) {
        pipeline.push({
            $match: {
                discountedPrice: priceFilter,
            },
        });
    }

    const limitNum = parseInt(limit, 10);
    const cappedLimit =
        Number.isFinite(limitNum) && limitNum > 0
            ? Math.min(limitNum, 100)
            : null;

    pipeline.push({
        $sort: sortOption,
    });

    if (cappedLimit) {
        pipeline.push({
            $limit: cappedLimit,
        });
    }

    pipeline.push(
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },

        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $project: {
                __v: 0,
                "images.fileId": 0,
                "category.__v": 0,
            },
        },
    );

    const cakes = await Cake.aggregate(pipeline);

    const formattedCakes = cakes.map(formatCakePrices);

    res.status(200).json({
        success: true,
        message: "Cakes fetched successfully",
        data: formattedCakes,
    });
});

export const getCake = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    const cake = await Cake.findOne({
        slug,
        isActive: true,
    }).populate("category", "name slug");

    if (!cake) {
        throw new ErrorHandler("Cake not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Cake fetched successfully",
        data: cake,
    });
});

export const updateCake = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        category,
        flavor,
        weightSize,
        price,
        discountPercentage,
        stock,
        isCustomAvailable,
        isFeatured,
        isActive,
        tags,
    } = req.body;

    const cake = await Cake.findById(id);

    if (!cake) {
        throw new ErrorHandler("Cake not found", 404);
    }

    if (category !== undefined) {
        const existingCategory = await Category.findById(category);

        if (!existingCategory) {
            throw new ErrorHandler("Category not found", 404);
        }
    }

    if (nameEn !== undefined || nameAr !== undefined) {
        const duplicateConditions = [];

        if (nameEn !== undefined) {
            duplicateConditions.push({
                "name.en": nameEn,
            });
        }

        if (nameAr !== undefined) {
            duplicateConditions.push({
                "name.ar": nameAr,
            });
        }

        const duplicate = await Cake.findOne({
            _id: { $ne: id },
            $or: duplicateConditions,
        });

        if (duplicate) {
            throw new ErrorHandler("Cake with this name already exists", 409);
        }
    }

    const updateData = {};

    if (nameEn !== undefined) {
        updateData["name.en"] = nameEn;
    }

    if (nameAr !== undefined) {
        updateData["name.ar"] = nameAr;
    }

    if (descriptionEn !== undefined) {
        updateData["description.en"] = descriptionEn;
    }

    if (descriptionAr !== undefined) {
        updateData["description.ar"] = descriptionAr;
    }

    if (category !== undefined) {
        updateData.category = category;
    }

    if (flavor !== undefined) {
        updateData.flavor = flavor;
    }

    if (weightSize !== undefined) {
        updateData.weightSize = weightSize;
    }

    if (price !== undefined) {
        updateData.price = price;
    }

    if (discountPercentage !== undefined) {
        updateData.discountPercentage = discountPercentage;
    }

    if (stock !== undefined) {
        updateData.stock = stock;
    }

    if (isCustomAvailable !== undefined) {
        updateData.isCustomAvailable = isCustomAvailable;
    }

    if (isFeatured !== undefined) {
        updateData.isFeatured = isFeatured;
    }

    if (isActive !== undefined) {
        updateData.isActive = isActive;
    }

    if (tags !== undefined) {
        updateData.tags = parseTags(tags);
    }

    let newImages;

    if (req.files?.length) {
        newImages = await uploadCakeImages(req.files);
        updateData.images = newImages;
    }

    try {
        const updatedCake = await Cake.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        }).populate("category", "name slug");

        if (!updatedCake) {
            throw new ErrorHandler("Cake not found", 404);
        }

        /*
         * Delete the old images only after the database update succeeds.
         */
        if (newImages) {
            await deleteCakeImages(cake.images);
        }

        res.status(200).json({
            success: true,
            message: "Cake updated successfully",
            data: updatedCake,
        });
    } catch (error) {
        /*
         * New images were uploaded but the database update failed.
         * Remove them because they are no longer referenced.
         */
        if (newImages) {
            await deleteCakeImages(newImages);
        }

        throw error;
    }
});

export const deleteCake = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const cake = await Cake.findById(id);

    if (!cake) {
        throw new ErrorHandler("Cake not found", 404);
    }

    await deleteCakeImages(cake.images);

    await cake.deleteOne();

    res.status(200).json({
        success: true,
        message: "Cake deleted successfully",
    });
});

export const getAdminCakes = asyncHandler(async (req, res) => {
    const {
        search,
        category,
        isActive,
        isFeatured,
        sort = "newest",
        page = 1,
        limit = 20,
    } = req.query;

    const filter = {};

    // Search
    if (search) {
        filter.$or = [
            {
                "name.en": {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                "name.ar": {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    // Category filter
    if (category) {
        const existingCategory = await Category.findOne({
            slug: category,
        }).select("_id");

        if (!existingCategory) {
            throw new ErrorHandler("Category not found", 404);
        }

        filter.category = existingCategory._id;
    }

    // Active filter
    if (isActive !== undefined) {
        filter.isActive = isActive === "true";
    }

    // Featured filter
    if (isFeatured !== undefined) {
        filter.isFeatured = isFeatured === "true";
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortOption = {
        createdAt: -1,
    };

    if (sort === "oldest") {
        sortOption = {
            createdAt: 1,
        };
    }

    if (sort === "price-low") {
        sortOption = {
            discountedPrice: 1,
            createdAt: -1,
        };
    }

    if (sort === "price-high") {
        sortOption = {
            discountedPrice: -1,
            createdAt: -1,
        };
    }

    if (sort === "name") {
        sortOption = {
            "name.en": 1,
        };
    }

    const pipeline = [
        {
            $match: filter,
        },

        {
            $addFields: {
                discountedPrice: discountedPriceExpression,
            },
        },

        {
            $sort: sortOption,
        },

        {
            $skip: skip,
        },

        {
            $limit: limitNum,
        },

        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category",
            },
        },

        {
            $unwind: {
                path: "$category",
                preserveNullAndEmptyArrays: true,
            },
        },

        {
            $project: {
                __v: 0,
                "images.fileId": 0,
                "category.__v": 0,
            },
        },
    ];

    const countPipeline = [
        {
            $match: filter,
        },

        {
            $count: "total",
        },
    ];

    const [cakes, countResult] = await Promise.all([
        Cake.aggregate(pipeline),
        Cake.aggregate(countPipeline),
    ]);

    const total = countResult[0]?.total ?? 0;

    const formattedCakes = cakes.map(formatCakePrices);

    res.status(200).json({
        success: true,
        message: "Admin cakes fetched successfully",
        data: formattedCakes,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            pages: Math.ceil(total / limitNum),
        },
    });
});
