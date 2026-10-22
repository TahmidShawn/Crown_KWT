import { Router } from "express";
import {
    getAddOns,
    getAdminAddOns,
    getAddOn,
    updateAddOn,
    deleteAddOn,
    createAddOn,
} from "../controllers/addOn.controller.js";
import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
    createAddOnSchema,
    updateAddOnSchema,
} from "../validations/addOn.validation.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

// Public add-ons (active only) — used by storefront/cart
router.route("/add-ons").get(getAddOns);

// Public single add-on
router.route("/add-ons/:id").get(getAddOn);

// Admin add-on management (all incl. inactive) — like /admin/categories
router
    .route("/admin/add-ons")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminAddOns)
    .post(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        upload.single("image"),
        validateRequest(createAddOnSchema),
        createAddOn,
    );

// Admin add-on update/delete
router
    .route("/admin/add-ons/:id")
    .put(
        isAuthenticatedUser,
        authorizeRoles("admin"),
        upload.single("image"),
        validateRequest(updateAddOnSchema),
        updateAddOn,
    )
    .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteAddOn);

export default router;
