import { Router } from "express";
import { getAdminStats } from "../controllers/stats.controller.js";
import {
    isAuthenticatedUser,
    authorizeRoles,
} from "../middlewares/auth.middleware.js";

const router = Router();

router
    .route("/admin/stats")
    .get(isAuthenticatedUser, authorizeRoles("admin"), getAdminStats);

export default router;
