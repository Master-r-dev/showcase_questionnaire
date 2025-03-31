import asyncHandler from "express-async-handler";
import Quiz from "../models/quizModel.js";
import Step from "../models/stepModel.js";
import History from "../models/historyModel.js";
import User from "../models/userModel.js";
import redisClient from "../utils/redisClient.js"; // Assuming you have a Redis client utility
import { validateAnswer } from "../utils/quizTools.js";
import jwt from "jsonwebtoken";

// @desc    Generate a random quiz
// @route   POST /api/quiz/random
// @access  Public
const generateRandomQuiz = asyncHandler(async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    // for logged in users, save the quiz in history
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("x");
      }
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed or user doesnt exist");
    }
  } else {
    // Check if a random quiz already exists for the current IP
    const existingQuiz = await redisClient.get(`temp-quiz-${req.ip}`);
    if (existingQuiz) {
      const ttl = await redisClient.ttl(`temp-quiz-${req.ip}`);
      res.status(400);
      throw new Error(
        `You already have an active random quiz. Please wait ${ttl} seconds for it to expire.`
      );
    }
  }

  let size = parseInt(req.body.size) || 6;
  size = size > 16 ? 16 : size;
  // Randomly select 'size' number of steps from the Step collection.
  const stepObs = await Step.aggregate([{ $sample: { size } }]);
  const steps = stepObs.map((step) => step._id);
  if (req.user) {
    // for logged in users, save the quiz in history
    const quiz = await Quiz.create({
      name: `Random Quiz ${req.user.email}: ${Date.now()}`,
      steps: steps,
    });
    const history = await History.create({
      user: req.user._id,
      quiz: quiz._id,
      quizName: quiz.name,
      progress: [],
    });
    // Save the quiz in the user's history
    req.user.history.push(history._id);
    await req.user.save();
    await redisClient.setex(quiz._id, 1800, JSON.stringify(steps));
    return res.status(200).json({ _id: quiz._id, name: "Temp Quiz", steps });
  }
  // Generate a temporary quiz ID using a UUID-like format.
  const tempQuizId = `temp-quiz-${req.ip}`;

  // Quiz with time limit
  await redisClient.setex(tempQuizId, 1800, JSON.stringify(steps));
  res.status(200).json({ _id: tempQuizId, name: "Temp Quiz", steps });
});

// @desc    Answer a step for a random cached quiz
// @route   POST /api/quiz/random/:quizId/step/:stepId/answer
// @access  Public
const answerRandomQuizStep = asyncHandler(async (req, res) => {
  const { quizId, stepId } = req.params;
  const { answer, mode } = req.body;
  const token = req.cookies.jwt;
  if (token) {
    // for logged in users, save the quiz in history
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      if (!req.user) {
        res.status(401);
        throw new Error("x");
      }
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed or user doesnt exist");
    }
  }
  // Retrieve the cached steps from Redis
  const cachedSteps = await redisClient.get(quizId);

  if (!cachedSteps) {
    res.status(404);
    throw new Error("Quiz not found or expired");
  }

  const steps = JSON.parse(cachedSteps);

  // Check if the stepId exists in the cached steps
  if (!steps.includes(stepId)) {
    res.status(400);
    throw new Error("Step does not belong to the specified quiz");
  }

  const step = await Step.findById(stepId)
    .select("question mode correctAnswers")
    .lean();

  if (!step) {
    res.status(404);
    throw new Error("Step not found");
  }

  if (req.user) {
    // Record the user's answer in the user's quiz history
    const userQuiz = await History.findOne({
      user: req.user._id,
      quiz: quizId,
    });
    if (!userQuiz) {
      res.status(404);
      throw new Error("Quiz not found in user's history");
    }
    if (userQuiz.progress.some((entry) => entry.step.toString() === stepId)) {
      res.status(400);
      throw new Error("You have already submitted an answer for this step");
    }
    // Assuming the Step model has a method to validate the answer
    const isCorrect = validateAnswer(answer, step, mode);

    userQuiz.progress.push({
      step: step._id,
      answer: Array.isArray(answer) ? answer : [answer],
      question: step.question,
      isCorrect,
    });
    userQuiz.score += isCorrect ? 1 : 0;
    userQuiz.lastStep = steps.indexOf(stepId); // to show the last step answered
    if (userQuiz.progress.length === steps.length) {
      userQuiz.completed = true;
    }
    await userQuiz.save();

    return res.status(200).json({ isCorrect });
  }
  // Validate the answer
  const isCorrect = validateAnswer(answer, step, mode);

  res.status(200).json({ isCorrect });
});

// @desc    Create a new quiz
// @route   POST /api/quiz/
// @access  Private
const createQuiz = asyncHandler(async (req, res) => {
  const { name, steps } = req.body;
  const quiz = await Quiz.create({ name, steps });

  res.status(201).json(quiz);
});

// @desc    Get quiz by ID
// @route   GET /api/quiz/:id
// @access  Public
const getQuizById = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id).lean(); //.populate("steps");

  if (quiz) {
    res.status(200).json(quiz);
  } else {
    res.status(404);
    throw new Error("Quiz not found");
  }
});

// @desc    Get all quizzes with pagination
// @route   GET /api/quiz/all
// @access  Public
const getAllQuizzes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.size) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  const totalQuizzes = await Quiz.countDocuments();
  const quizzes = await Quiz.find().select("-steps").skip(skip).limit(limit);

  res.status(200).json({
    quizzes,
    page,
    totalPages: Math.ceil(totalQuizzes / limit),
    totalQuizzes,
  });
});

// @desc    Delete a quiz
// @route   DELETE /api/quiz/:id
// @access  Private
const deleteQuiz = asyncHandler(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id);

  if (quiz) {
    await quiz.remove();
    res.status(200).json({ message: "Quiz removed" });
  } else {
    res.status(404);
    throw new Error("Quiz not found");
  }
});

// @desc    Edit a quiz
// @route   PATCH /api/quiz/:id
// @access  Private
const editQuiz = asyncHandler(async (req, res) => {
  const { name, steps } = req.body;

  const quiz = await Quiz.findById(req.params.id);

  if (quiz) {
    quiz.name = name || quiz.name;
    quiz.steps = steps;
    const updatedQuiz = await quiz.save();
    res.status(200).json(updatedQuiz);
  } else {
    res.status(404);
    throw new Error("Quiz not found");
  }
});

// @desc    Get step by ID
// @route   GET /api/quiz/step/:id
// @access  Public
const getStepById = asyncHandler(async (req, res) => {
  const step = await Step.findById(req.params.id).lean();

  if (step) {
    res.status(200).json(step);
  } else {
    res.status(404);
    throw new Error("Step not found");
  }
});

// @desc    Start a quiz for the current user
// @route   POST /api/quiz/:id/start
// @access  Private
const startQuiz = asyncHandler(async (req, res) => {
  const { id: quizId } = req.params;

  if (!quizId) {
    res.status(400);
    throw new Error("Quiz ID is required");
  }

  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    res.status(404);
    throw new Error("Quiz not found");
  }

  // Check if the user already has a quiz entry with this ID by query to History collection
  const history = await History.findOne({
    user: req.user._id,
    quiz: quizId,
  }).lean();
  if (history) {
    res.status(400);
    throw new Error("This Quiz already started");
  }
  // Create a new history entry for the user
  const newHistory = await History.create({
    user: req.user._id,
    quiz: quizId,
    quizName: quiz.name,
    progress: [],
  });

  // Save the quiz in the user's history
  req.user.history.push(newHistory._id);
  await req.user.save();
  res.status(200).json({
    name: quiz.name,
    steps: quiz.steps,
    history: newHistory._id,
  });
});

// @desc    Answer a step (with history tracking)
// @route   POST /api/quiz/:quizId/step/:stepId/answer
// @access  Private
const answerStep = asyncHandler(async (req, res) => {
  const { answer, mode } = req.body;
  const { quizId, stepId } = req.params;
  if (!answer) {
    res.status(400);
    throw new Error("Answer is required");
  }

  const step = await Step.findById(stepId)
    .select("question mode correctAnswers")
    .lean();

  if (!step) {
    res.status(404);
    throw new Error("Step not found");
  }
  // Check if the quiz exists and contains the step
  if (!quizId) {
    res.status(400);
    throw new Error("Quiz ID is required");
  }

  const quiz = await Quiz.findById(quizId);
  if (!quiz || !quiz.steps.includes(step._id)) {
    res.status(400);
    throw new Error(
      "Quiz does not exist or does not contain the specified step"
    );
  }

  // Record the user's answer in the user's quiz history
  const userQuiz = await History.findOne({ user: req.user._id, quiz: quizId });
  if (!userQuiz) {
    res.status(404);
    throw new Error("Quiz not found in user's history");
  }
  if (userQuiz.progress.some((entry) => entry.step.toString() === stepId)) {
    res.status(400);
    throw new Error("You have already submitted an answer for this step");
  }
  // Assuming the Step model has a method to validate the answer
  const isCorrect = validateAnswer(answer, step, mode);

  userQuiz.progress.push({
    step: step._id,
    answer: Array.isArray(answer) ? answer : [answer],
    question: step.question,
    isCorrect,
  });
  userQuiz.score += isCorrect ? 1 : 0;
  userQuiz.lastStep = quiz.steps.indexOf(stepId); // to show the last step answered
  if (userQuiz.progress.length === quiz.steps.length) {
    userQuiz.completed = true;
  }
  await userQuiz.save();

  res.status(200).json({ isCorrect });
});

export {
  editQuiz,
  getStepById,
  getAllQuizzes,
  startQuiz,
  answerStep,
  generateRandomQuiz,
  answerRandomQuizStep,
  createQuiz,
  getQuizById,
  deleteQuiz,
};
