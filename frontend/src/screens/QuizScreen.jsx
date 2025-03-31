import { useEffect } from "react";
import { Container, Button, Card, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  useAnswerStepMutation,
  useStartQuizMutation,
  useGetQuizByIdQuery,
} from "../slices/quizApiSlice";
import { useGetUserHistoryByIdQuery } from "../slices/usersApiSlice";
import {
  setCurrentQuiz,
  clearQuizState,
  setResult,
  setSteps,
  updateScore,
  setLastStep,
} from "../slices/quizSlice";
import { toast } from "react-toastify";
import StepDisplay from "../components/StepDisplay";
import Loader from "../components/Loader";

const QuizScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: quizId } = useParams();

  // Validate quizId on mount.

  // Fetch user's history for this quiz.
  const {
    data: historyData,
    isLoading: historyLoad,
    error: historyErr,
  } = useGetUserHistoryByIdQuery(quizId);
  // Handler to submit an answer for the current step.
  const [answerStep, { isLoading: answerLoad, error: answerErr }] =
    useAnswerStepMutation();
  // Mutation hook for starting a new quiz.
  const [startQuiz] = useStartQuizMutation();
  // **Always call this hook unconditionally!**
  const {
    data: quizFromQuery,
    isLoading: quizLoad,
    error: quizErr,
  } = useGetQuizByIdQuery(quizId);

  // Get quiz details if already loaded in state.
  const currentQuiz = useSelector((state) => state.quiz.currentQuiz);
  const lastStep = useSelector((state) => state.quiz.lastStep);
  const stepsFetched = useSelector((state) => state.quiz.steps);
  const score = useSelector((state) => state.quiz.score);

  // When history data is available, decide whether to use existing history or start a new quiz.
  useEffect(() => {
    if (!quizId || !/^[0-9a-fA-F]{24}$/.test(quizId)) {
      toast.error(`Invalid quiz ID: ${quizId}`);
      navigate("/");
      return;
    }

    if (quizErr || historyErr) {
      toast.error(
        quizErr?.data?.message ||
          historyErr?.data?.message ||
          "Failed to start quiz"
      );
      navigate("/");
      return;
    }

    if (quizLoad || historyLoad) return;

    if (historyData) {
      //need to fill state.steps=history.progress
      // (to each [history.progress.step]={answer,... and other step fields})
      // last step is last entry in history.progress - should be muted
      const lastProgress =
        historyData.progress.length > 0
          ? historyData.progress[historyData.progress.length - 1].step
          : null;
      //clear prev state
      dispatch(setCurrentQuiz(quizFromQuery));
      if (lastProgress && Object.values(stepsFetched).length > 0) {
        dispatch(setLastStep(lastProgress));
        console.log(historyData.progress);
        const formattedSteps = historyData.progress.reduce(
          (acc, { step, ...rest }) => {
            acc[step] = { answer: rest.answer };
            return acc;
          },
          {}
        );
        console.log(formattedSteps);
        dispatch(setSteps(formattedSteps));
      } else {
        dispatch(setLastStep(quizFromQuery.steps[0]));
      }
    } else if (quizId) {
      // Ensure quizId is valid before calling startQuiz
      const startNewQuiz = async () => {
        try {
          const quizData = await startQuiz(quizId).unwrap(); // Always use `.unwrap()` for mutations
          //clear prev state
          dispatch(setCurrentQuiz(quizData));
          dispatch(setLastStep(quizData.steps[0]));
        } catch (err) {
          toast.error(err?.data?.message || "Failed to start quiz");
        }
      };

      startNewQuiz();
    }
  }, [
    quizId,
    quizErr,
    historyErr,
    historyData,
    historyLoad,
    quizFromQuery,
    dispatch,
    navigate,
    startQuiz, // Ensure it's tracked properly
  ]);

  // If quizFromState changes to a new value, update it.
  /* if (
    quizFromState &&
    JSON.stringify(quizFromState) !== JSON.stringify(currentQuiz)
  ) {
    dispatch(setCurrentQuiz(currentQuiz));
  }
 */

  if (quizLoad || historyLoad) return <Loader />;
  if (!currentQuiz) return null; // Wait for quiz to load
  const { steps } = currentQuiz;
  console.log(currentQuiz);
  const currentStepIndex = steps.indexOf(lastStep);

  const handleSubmitAnswer = async (answer, mode, lastQuestion) => {
    try {
      const response = await answerStep({
        quizId: quizId,
        stepId: lastStep,
        answer,
        mode,
      }).unwrap();

      if (lastQuestion) {
        dispatch(
          setResult({
            score: response.isCorrect ? score + 1 : score,
            total: steps.length,
            quizName: currentQuiz.name,
          })
        );
        dispatch(clearQuizState());
        navigate("/");
        return;
      }
      dispatch(
        updateScore({
          _id: lastStep,
          score: response.isCorrect ? 1 : 0,
          answer,
        })
      );
      toast.success(response.isCorrect ? "Correct!" : "Incorrect!");
      //console.log(steps[currentStepIndex + 1]);
      dispatch(setLastStep(steps[currentStepIndex + 1]));
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Container className="mt-5">
      <h2>{currentQuiz.name || "Loading..."}</h2>
      <StepDisplay stepId={lastStep} onAnswer={handleSubmitAnswer} />
      {answerLoad && <Loader />}
      {/*  {answerErr && (
        <Alert variant="danger" className="mt-3">
          Error: {answerErr.data?.message || "Something went wrong"}
        </Alert>
      )} */}
    </Container>
  );
};

export default QuizScreen;
