import { Router } from "express";
import { getNotifications, deleteNotifications } from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";


const router = Router()

router.get("/", protectRoute, getNotifications)
router.delete("/", protectRoute, deleteNotifications)

export default router