import { apiSlice } from "./apiSlice";

const QUIZ_URL = "/api/quiz";

export const quizApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllQuizzes: builder.query({
      query: (page = 1) => ({
        url: `${QUIZ_URL}/all?size=${page}`,
        method: "GET",
      }),
    }),
    getQuizById: builder.query({
      query: (id) => ({
        url: `${QUIZ_URL}/${id}`,
        method: "GET",
      }),
    }),
    startQuiz: builder.mutation({
      query: (id) => ({
        url: `${QUIZ_URL}/${id}/start`,
        method: "POST",
      }),
    }),
    /* createQuiz: builder.mutation({
      query: (data) => ({
        url: `${QUIZ_URL}`,
        method: "POST",
        body: data,
      }),
    }),
    editQuiz: builder.mutation({
      query: ({ id, data }) => ({
        url: `${QUIZ_URL}/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Quiz", id }],
    }),
    deleteQuiz: builder.mutation({
      query: (id) => ({
        url: `${QUIZ_URL}/${id}`,
        method: "DELETE",
      }),
    }), */
    generateRandomQuiz: builder.mutation({
      query: (data) => ({
        url: `${QUIZ_URL}/random`,
        method: "POST",
        body: data,
      }),
    }),
    answerStep: builder.mutation({
      query: ({ quizId, stepId, answer, mode }) => ({
        url: `${QUIZ_URL}/${quizId}/step/${stepId}/answer`,
        method: "POST",
        body: { answer, mode },
      }),
    }),
    answerRandomQuizStep: builder.mutation({
      query: ({ quizId, stepId, answer, mode }) => ({
        url: `${QUIZ_URL}/random/${quizId}/step/${stepId}/answer`,
        method: "POST",
        body: { answer, mode },
      }),
    }),
    getStepById: builder.query({
      query: (id) => ({
        url: `${QUIZ_URL}/step/${id}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useGetAllQuizzesQuery,
  useGetQuizByIdQuery,
  useStartQuizMutation,
  /* useCreateQuizMutation,
  useEditQuizMutation,
  useDeleteQuizMutation, */
  useGenerateRandomQuizMutation,
  useAnswerStepMutation,
  useAnswerRandomQuizStepMutation,
  useGetStepByIdQuery,
} = quizApiSlice;
