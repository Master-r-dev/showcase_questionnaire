import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema.Types;

const progressType = new mongoose.Schema(
  {
    step: {
      type: ObjectId,
      required: true,
      ref: "Step",
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: [String],
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
  },
  { _id: false, id: false, timestamps: false } // Prevents creating an _id for this subdocument
);
const historySchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      required: true,
      ref: "User",
    },
    quiz: {
      type: ObjectId,
      required: true,
      ref: "Quiz",
    },
    quizName: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    progress: {
      type: [progressType],
      required: true,
      default: [],
    },
    completed: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastStep: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const History = mongoose.model("History", historySchema);
export default History;
