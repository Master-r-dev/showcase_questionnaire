import mongoose from "mongoose";

const stepSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ["input", "multi-choice", "single-choice", "numeric"],
      required: true,
    },
    // Only required for multi-choice and single-choice types.
    options: {
      type: [String],
      required() {
        return this.type === "multi-choice" || this.type === "single-choice";
      },
    },
    // Optionally, an order field if steps are meant to be sequential.
    /* order: {
      type: Number,
      required: true,
    }, */
    // Field to store the correct answers for validation purposes.
    correctAnswers: {
      type: [String],
      required: true,
      select: false,
    },
  },
  { timestamps: false }
);

const Step = mongoose.model("Step", stepSchema);

export default Step;
