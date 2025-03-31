import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentQuiz: null,
  lastStep: null, // id of last step answered
  steps: {}, // array of step objects
  score: 0,
  result: null, // result object to be used in quiz result page
};

const quizSlice = createSlice({
  name: "quiz",
  initialState,
  reducers: {
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload || null;
      state.lastStep = state.currentQuiz.steps[0] || null;
      state.result = null;
    },
    setLastStep: (state, action) => {
      if (state.currentQuiz?.name) {
        state.lastStep = action.payload || null;
      }
    },
    updateScore(state, action) {
      if (state.currentQuiz?.name) {
        state.score += action.payload.score; // assuming +1 for a correct answer
        state.steps[action.payload._id] = {
          ...state.steps[action.payload._id],
          answer: action.payload.answer,
        };
      }
    },
    addStep: (state, action) => {
      if (!state.currentQuiz?.name || !!state.steps[action.payload._id]) return;
      state.steps[action.payload._id] = {
        ...action.payload,
        answer: state.steps[action.payload._id]?.answer,
      };
    },
    setSteps: (state, action) => {
      console.log(action.payload);
      if (state.currentQuiz?.name || Object.values(state.steps).length > 0)
        return;
      state.steps = action.payload;
    },
    setResult: (state, action) => {
      state.result = action.payload;
    },
    clearQuizState: (state) => {
      state.currentQuiz = null;
      state.lastStep = null;
      state.score = 0;
      // clear provided aswers for each step
      state.steps = {};
    },
  },
});

export const {
  setCurrentQuiz,
  clearQuizState,
  addStep,
  setSteps,
  updateScore,
  setLastStep,
  setResult,
} = quizSlice.actions;

export default quizSlice.reducer;
