import { Router } from "express";

import {
    createCake,
    getCakes,
    getAdminCakes,
    getAdminCake,
    getCake,
    updateCake,
    deleteCake,
} from "../controllers/cake.controller.js";

import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

import { validateRequest } from "../middlewares/validation.middleware.js";

import {
    createCakeSchema,
    updateCakeSchema,
} from "../validations/cake.validation.js";

import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Public cakes
router.route("/cakes").get(getCakes);

// Public single cake
router.route("/cakes/:slug").get(getCake);

// Admin cake management
router
    .route("/admin/cakes")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminCakes)
    .post(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        upload.array("images"),
        validateRequest(createCakeSchema),
        createCake,
    );

// Admin cake update/delete
router
    .route("/admin/cakes/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminCake)
    .put(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        upload.array("images"),
        validateRequest(updateCakeSchema),
        updateCake,
    )
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteCake);

export default router;
