import { Router } from "express";
import {
    cancelMyOrder,
    createOrder,
    getAllOrders,
    getMyOrder,
    getMyOrders,
    getOrder,
    trackOrder,
    updateOrderNotes,
    updateOrderStatus,
} from "../controllers/order.controller.js";
import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validation.middleware.js";
import { createOrderSchema } from "../validations/order.validation.js";

const router = Router();

router
    .route("/order")
    .post(isAuthenticatedUser, validateRequest(createOrderSchema), createOrder)
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router.route("/orders").get(isAuthenticatedUser, getMyOrders);

// Public order tracking by order number (must come before /order/:id)
router.route("/order/track/:orderNumber").get(trackOrder);

router
    .route("/order/:id")
    .get(isAuthenticatedUser, getMyOrder)
    .patch(isAuthenticatedUser, cancelMyOrder);

router
    .route("/admin/orders")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrders);

router
    .route("/admin/orders/:id")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getOrder);

router
    .route("/admin/orders/:id/status")
    .patch(isAuthenticatedUser, authorizeRoles("admin"), updateOrderStatus);

router
    .route("/admin/orders/:id/notes")
    .patch(isAuthenticatedUser, authorizeRoles("admin"), updateOrderNotes);

export default router;
