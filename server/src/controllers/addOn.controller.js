import AddOn from "../models/addOn.model.js";
import ErrorHandler from "../utils/errorHandler.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadFile, deleteFile } from "../services/storage.service.js";

// FormData always arrives as strings — normalize "true"/"false"/"1"/"0".
const toBoolean = (value, fallback) => {
    if (value === undefined || value === null || value === "") {
        return fallback;
    }

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (["true", "1"].includes(normalized)) {
            return true;
        }

        if (["false", "0"].includes(normalized)) {
            return false;
        }
    }

    return fallback;
};

export const createAddOn = asyncHandler(async (req, res) => {
    const { nameEn, nameAr, price, isActive } = req.body;
    const file = req.file;

    if (!file) {
        throw new ErrorHandler("Add-on image is required", 400);
    }

    const name = {
        en: nameEn,
        ar: nameAr,
    };

    const existing = await AddOn.findOne({
        $or: [{ "name.en": nameEn }, { "name.ar": nameAr }],
    });

    if (existing) {
        throw new ErrorHandler("Add-on with this name already exists", 409);
    }

    const { url, fileId } = await uploadFile(
        file.buffer,
        file.originalname,
        "addons",
    );

    let addOn;

    try {
        addOn = await AddOn.create({
            name,
            imageUrl: url,
            imageFileId: fileId,
            price: Number(price),
            isActive: toBoolean(isActive, true),
        });
    } catch (error) {
        await deleteFile(fileId);
        throw error;
    }

    res.status(201).json({
        success: true,
        message: "Add-on created successfully",
        data: addOn,
    });
});

export const getAddOns = asyncHandler(async (req, res) => {
    const addOns = await AddOn.find({
        isActive: true,
    }).sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        message: "Add-ons fetched successfully",
        data: addOns,
    });
});

export const getAdminAddOns = asyncHandler(async (req, res) => {
    const addOns = await AddOn.find().sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        message: "Add-ons fetched successfully",
        data: addOns,
    });
});

export const getAddOn = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const addOn = await AddOn.findById(id);

    if (!addOn) {
        throw new ErrorHandler("Add-on not found", 404);
    }

    res.status(200).json({
        success: true,
        message: "Add-on fetched successfully",
        data: addOn,
    });
});

export const updateAddOn = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { nameEn, nameAr, price, isActive } = req.body;
    const file = req.file;

    const addOn = await AddOn.findById(id);

    if (!addOn) {
        throw new ErrorHandler("Add-on not found", 404);
    }

    const updateData = {};

    if (nameEn !== undefined || nameAr !== undefined) {
        if (nameEn !== undefined) {
            updateData["name.en"] = nameEn;
        }

        if (nameAr !== undefined) {
            updateData["name.ar"] = nameAr;
        }

        const duplicate = await AddOn.findOne({
            _id: { $ne: id },
            $or: [
                ...(nameEn !== undefined ? [{ "name.en": nameEn }] : []),
                ...(nameAr !== undefined ? [{ "name.ar": nameAr }] : []),
            ],
        });

        if (duplicate) {
            throw new ErrorHandler("Add-on with this name already exists", 409);
        }
    }

    if (price !== undefined) {
        updateData.price = Number(price);
    }

    if (isActive !== undefined) {
        updateData.isActive = toBoolean(isActive, addOn.isActive);
    }

    let newFileId = null;
    const oldFileId = addOn.imageFileId;

    if (file) {
        const { url, fileId } = await uploadFile(
            file.buffer,
            file.originalname,
            "addons",
        );

        updateData.imageUrl = url;
        updateData.imageFileId = fileId;
        newFileId = fileId;
    }

    try {
        const updatedAddOn = await AddOn.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        if (newFileId && oldFileId) {
            await deleteFile(oldFileId);
        }

        res.status(200).json({
            success: true,
            message: "Add-on updated successfully",
            data: updatedAddOn,
        });
    } catch (error) {
        if (newFileId) {
            await deleteFile(newFileId);
        }

        throw error;
    }
});

export const deleteAddOn = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const addOn = await AddOn.findById(id);

    if (!addOn) {
        throw new ErrorHandler("Add-on not found", 404);
    }

    if (addOn.imageFileId) {
        await deleteFile(addOn.imageFileId);
    }

    await addOn.deleteOne();

    res.status(200).json({
        success: true,
        message: "Add-on deleted successfully",
    });
});
