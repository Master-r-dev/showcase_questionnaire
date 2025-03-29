import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./backend/config/config.env" });
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.env.NODE_ENV === "init") {
  async function insertTestData() {
    const client = await mongoose.connect(process.env.MONGO_URI);
    try {
      const quizzes = client.collection("quizzes");

      const testData = [
        {
          name: "General Knowledge Quiz",
          steps: [
            {
              stepNumber: 1,
              question: "What is the capital of France?",
              options: ["Paris", "London", "Berlin", "Madrid"],
            },
            {
              stepNumber: 2,
              question: "Which planet is known as the Red Planet?",
              options: ["Earth", "Mars", "Jupiter", "Saturn"],
            },
          ],
        },
        {
          name: "Science Quiz",
          steps: [
            {
              stepNumber: 1,
              question: "What is the chemical symbol for water?",
              options: ["H2O", "O2", "CO2", "NaCl"],
            },
            {
              stepNumber: 2,
              question: "What gas do plants primarily use for photosynthesis?",
              options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"],
            },
          ],
        },
      ];

      const result = await quizzes.insertMany(testData);
      console.log(`${result.insertedCount} documents were inserted.`);
    } finally {
      await client.close();
    }
  }

  await insertTestData().catch(console.log);
}

export default connectDB;
