import { Router } from "express";
import {
    addCartAddOn,
    addCartItem,
    clearCart,
    getCart,
    removeCartAddOn,
    removeCartItem,
    updateCartAddOn,
    updateCartItem,
} from "../controllers/cart.controller.js";
import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
    addCartAddOnSchema,
    addCartItemSchema,
    updateCartAddOnSchema,
    updateCartItemSchema,
} from "../validations/cart.validation.js";

const router = Router();

router
    .route("/cart")
    .get(isAuthenticatedUser, authorizeRoles("user"), getCart)
    .delete(isAuthenticatedUser, authorizeRoles("user"), clearCart);

router
    .route("/cart/items")
    .post(
        isAuthenticatedUser,
        authorizeRoles("user"),
        validateRequest(addCartItemSchema),
        addCartItem,
    );

router
    .route("/cart/items/:cakeId")
    .patch(
        isAuthenticatedUser,
        authorizeRoles("user"),
        validateRequest(updateCartItemSchema),
        updateCartItem,
    )
    .delete(isAuthenticatedUser, authorizeRoles("user"), removeCartItem);

router
    .route("/cart/add-ons")
    .post(
        isAuthenticatedUser,
        authorizeRoles("user"),
        validateRequest(addCartAddOnSchema),
        addCartAddOn,
    );

router
    .route("/cart/add-ons/:addOnId")
    .patch(
        isAuthenticatedUser,
        authorizeRoles("user"),
        validateRequest(updateCartAddOnSchema),
        updateCartAddOn,
    )
    .delete(isAuthenticatedUser, authorizeRoles("user"), removeCartAddOn);

export default router;