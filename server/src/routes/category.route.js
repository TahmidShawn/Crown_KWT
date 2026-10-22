import { Router } from "express";

import {
    createCategory,
    getCategories,
    getAdminCategories,
    getCategory,
    updateCategory,
    deleteCategory,
} from "../controllers/category.controller.js";

import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
    createCategorySchema,
    updateCategorySchema,
} from "../validations/category.validation.js";

import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Public categories
router.route("/categories").get(getCategories);

// Public single category
router.route("/categories/:id").get(getCategory);

// Admin category management
router
    .route("/admin/categories")
    .get(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        getAdminCategories,
    )
    .post(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        upload.single("image"),
        validateRequest(createCategorySchema),
        createCategory,
    );

// Admin category update/delete
router
    .route("/admin/categories/:id")
    .put(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        upload.single("image"),
        validateRequest(updateCategorySchema),
        updateCategory,
    )
    .delete(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        deleteCategory,
    );

export default router;