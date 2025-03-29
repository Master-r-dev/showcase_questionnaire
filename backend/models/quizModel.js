import mongoose from "mongoose";

const QuizSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    // An array of pre-defined Step IDs. This allows you to create an initial quiz.
    steps: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Step",
      },
    ],
  },
  { timestamps: true }
);
const Quiz = mongoose.model("Quiz", QuizSchema);
export default Quiz;
