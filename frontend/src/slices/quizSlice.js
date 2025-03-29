import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentQuiz: localStorage.getItem("currentQuiz")
    ? JSON.parse(localStorage.getItem("currentQuiz"))
    : null,
  lastStep: localStorage.getItem("lastStep")
    ? JSON.parse(localStorage.getItem("lastStep"))
    : null, // id of last step answered
  steps: {}, // array of step objects
  result: localStorage.getItem("result")
    ? JSON.parse(localStorage.getItem("result"))
    : null, // result object to be used in quiz result page
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload ?? null;
      localStorage.setItem("currentQuiz", JSON.stringify(action.payload));
      state.lastStep = state.currentQuiz.stepIds[0]; // set the first step as the last step
      localStorage.setItem(
        "lastStep",
        JSON.stringify(state.currentQuiz.stepIds[0])
      );
      state.result = null;
      localStorage.removeItem("result");
    },
    setLastStep: (state, action) => {
      if (state.currentQuiz) {
        state.lastStep = action.payload ?? null;
        localStorage.setItem("lastStep", JSON.stringify(action.payload));
      }
    },
    updateScore(state, action) {
      if (state.currentQuiz) {
        state.currentQuiz.score += action.payload.score; // assuming +1 for a correct answer
        state.steps[action.payload._id] = {
          ...state.steps[action.payload._id],
          answer: action.payload.answer,
        };
      }
    },
    addStep: (state, action) => {
      if (!state.currentQuiz || state.steps[action.payload._id]) return;
      state.steps[action.payload._id] = action.payload;
    },
    setResult: (state, action) => {
      state.result = action.payload;
      localStorage.setItem("result", JSON.stringify(action.payload));
    },
    clearQuizState: (state) => {
      state.currentQuiz = null;
      localStorage.removeItem("currentQuiz");
      state.lastStep = null;
      localStorage.removeItem("lastStep");
      // clear provided aswers for each step
      state.steps = {};
    },
  },
});

export const {
  setCurrentQuiz,
  clearQuizState,
  addStep,
  updateScore,
  setLastStep,
  setResult,
} = quizSlice.actions;

export default quizSlice.reducer;
