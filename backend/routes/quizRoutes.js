import express from "express";
import {
  editQuiz,
  getStepById,
  answerStep,
  generateRandomQuiz,
  answerRandomQuizStep,
  createQuiz,
  getQuizById,
  getAllQuizzes,
  startQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { isAdmin, protect } from "../middleware/authMiddleware.js";
import {
  createQuizValidation,
  editQuizValidation,
  answerValidation,
  idValidation,
} from "../middleware/dataMiddleware.js";

const router = express.Router();

// Route to generate a random quiz
router.post("/random", generateRandomQuiz);

// Route to answer a random quiz step
router.post(
  "/random/:quizId/step/:stepId/answer",
  answerValidation,
  answerRandomQuizStep
);

// Route to create a new quiz
router.post("/", protect, isAdmin, createQuizValidation, createQuiz);
//Route to start new quiz by ID
router.post("/:id/start", protect, idValidation, startQuiz);

// Route to get all quizzes
router.get("/all", protect, getAllQuizzes);
// Route to get a quiz by ID, delete a quiz, or edit a quiz
router
  .route("/:id")
  .get(protect, idValidation, getQuizById)
  .delete(protect, isAdmin, idValidation, deleteQuiz)
  .patch(protect, isAdmin, editQuizValidation, idValidation, editQuiz);

// Route to get a step by ID
router.get("/step/:id", idValidation, getStepById);

// Route to answer a step
router.post(
  "/:quizId/step/:stepId/answer",
  protect,
  answerValidation,
  answerStep
);

export default router;
