import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import History from "../models/historyModel.js";
import generateToken from "../utils/generateToken.js";

// @desc    Auth user & get token
// @route   POST /api/users/auth
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.json({
      _id: user._id,
      history: user.history,
      email: user.email,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    email,
    password,
    history: [],
  });

  if (user) {
    generateToken(res, user._id);

    res.status(201).json({
      _id: user._id,
      email: user.email,
      history: user.history,
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    email: req.user.email,
    history: req.user.history,
  });
});

// @desc    Get user quizzes with pagination
// @route   GET /api/users/history
// @access  Private
const getUserQuizzes = asyncHandler(async (req, res) => {
  const pageSize = 5; // can be env var
  const page = parseInt(req.query.size) || 1;

  const quizzes = await History.find({ user: req.user._id })
    .skip((page - 1) * pageSize)
    .limit(pageSize);

  res.json({
    quizzes,
    page,
    pages: Math.ceil(quizzes.length / pageSize),
  });
});

// @desc    Get quiz history by quiz ID
// @route   GET /api/users/history/:id
// @access  Private
const getQuizHistoryById = asyncHandler(async (req, res) => {
  const quizId = req.params.id;

  const quizHistory = await History.findOne({
    user: req.user._id,
    quiz: quizId,
  });

  res.json(quizHistory);
});

// @desc    Update user profile
// @route   PATCH /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  req.user.email = req.body.email || req.user.email;

  if (req.body.password) {
    req.user.password = req.body.password;
  }

  try {
    const updatedUser = await req.user.save();

    res.json({
      _id: updatedUser._id,
      email: updatedUser.email,
    });
  } catch (error) {
    res.status(400);
    throw new Error("Error updating user profile");
  }
});
export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserQuizzes,
  getQuizHistoryById,
};
