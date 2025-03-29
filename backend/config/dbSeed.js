import mongoose from "mongoose";
import connectDB from "./db.js";
import Quiz from "../models/quizModel.js";
import Step from "../models/stepModel.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";

//change steps or add here
const createSteps = async () => {
  const seedSteps = [
    {
      question: "What is the capital of France?",
      mode: "single-choice",
      options: ["Paris", "London", "Berlin", "Madrid"],
      correctAnswers: ["Paris"],
    },
    {
      question: "Name two programming languages.",
      mode: "multi-choice",
      options: ["JavaScript", "Python", "HTML", "CSS"],
      correctAnswers: ["JavaScript", "Python"],
    },
    {
      question: "Write the chemical formula for oxygen.",
      mode: "input",
      correctAnswers: ["O"],
    },
    {
      question: "What is the boiling point of water in Celsius?",
      mode: "single-choice",
      options: ["90°C", "100°C", "110°C", "120°C"],
      correctAnswers: ["100°C"],
    },
    {
      question: "Which of the following are prime numbers?",
      mode: "multi-choice",
      options: ["2", "4", "5", "9"],
      correctAnswers: ["2", "5"],
    },
    {
      question: "What is 15 divided by 3?",
      mode: "numeric",
      correctAnswers: ["5"],
    },
    {
      question: "Select all the colors in the rainbow.",
      mode: "multi-choice",
      options: ["Red", "Green", "Blue", "Black"],
      correctAnswers: ["Red", "Green", "Blue"],
    },
    {
      question: "What is the square root of 64?",
      mode: "numeric",
      correctAnswers: ["8"],
    },
    {
      question: "What is the largest planet in our solar system?",
      mode: "single-choice",
      options: ["Earth", "Mars", "Jupiter", "Saturn"],
      correctAnswers: ["Jupiter"],
    },
    {
      question: "Name two primary colors.",
      mode: "multi-choice",
      options: ["Red", "Brown", "Blue", "Green"],
      correctAnswers: ["Red", "Blue"],
    },
    {
      question: "What is the chemical symbol for gold?",
      mode: "input",
      correctAnswers: ["Au"],
    },
    {
      question: "What is 7 multiplied by 6?",
      mode: "numeric",
      correctAnswers: ["42"],
    },
    {
      question: "Which country is known as the Land of the Rising Sun?",
      mode: "single-choice",
      options: ["China", "Japan", "Thailand", "India"],
      correctAnswers: ["Japan"],
    },
    {
      question: "Select all mammals from the list below.",
      mode: "multi-choice",
      options: ["Dolphin", "Shark", "Elephant", "Crocodile"],
      correctAnswers: ["Dolphin", "Elephant"],
    },
    {
      question: "What is the freezing point of water in Celsius?",
      mode: "numeric",
      correctAnswers: ["0"],
    },
  ];
  // Insert test steps
  const steps = await Step.insertMany(seedSteps);
  return steps.map((step) => step._id);
};
// Function to generate a random slice of steps
const getRandomSlice = (stepIds, size) => {
  const shuffledSteps = stepIds.sort(() => 0.5 - Math.random()); // Fisher-Yates shuffle algorithm
  return shuffledSteps.slice(0, size);
};
// Function to create quizzes from seed steps ids
const createQuizzes = async (stepIds) => {
  const seedQuizzes = [
    {
      name: "Full General Knowledge Quiz",
      // Full quiz with all steps
      steps: stepIds,
    },
    {
      name: "Sliced Quiz 1",
      // Quiz with a random slice of 8 steps
      steps: getRandomSlice(stepIds, 8),
    },
    {
      name: "Sliced Quiz 2",
      // Another quiz with a different random slice of 8 steps
      steps: getRandomSlice(stepIds, 8),
    },
    {
      name: "Sliced Quiz 3",
      // Another quiz with a different random slice of 6 steps
      steps: getRandomSlice(stepIds, 6),
    },
  ];

  // Insert quizzes into the database
  await Quiz.insertMany(seedQuizzes);
  console.log(`${seedQuizzes.length} quizzes inserted successfully.`);
};
const createUsers = async () => {
  // Create a test user with admin privileges
  const salt = await bcrypt.genSalt(10);
  const users = [
    {
      //admin
      email: "admin@gmail.com",
      password: await bcrypt.hash("admin1", salt), // Note: In a real application, ensure passwords are hashed
      isAdmin: true,
      history: [],
    },
    {
      //simple user
      email: "user@gmail.com",
      password: await bcrypt.hash("password", salt), // Note: In a real application, ensure passwords are hashed
      history: [],
    },
  ];

  // Insert the admin user into the database
  await User.insertMany(users);
};
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Reset the database by dropping it
    await mongoose.connection.db.dropDatabase();
    console.log("Database reset successfully.");

    const stepIds = await createSteps();
    await createQuizzes(stepIds);
    await createUsers();

    console.log("Test data inserted successfully.");
  } catch (error) {
    console.log("Error during database seed:", error.message);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
};

// Execute the function
seedDatabase();
