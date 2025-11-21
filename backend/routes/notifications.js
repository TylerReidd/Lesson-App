import express from "express";
import { isAuthenticated } from "../middleware/auth.js";
import {
  getNotificationSummary,
  markNotificationsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotificationSummary);
router.post("/read", isAuthenticated, markNotificationsRead);

export default router;
