import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserQuizzes,
  getQuizHistoryById,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import { idValidation } from "../middleware/dataMiddleware.js";
const router = express.Router();

router.post("/", registerUser);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router
  .route("/profile")
  .get(protect, getUserProfile)
  .patch(protect, updateUserProfile);
router.get("/history", protect, getUserQuizzes);
router.get("/history/:id", protect, idValidation, getQuizHistoryById);
export default router;
