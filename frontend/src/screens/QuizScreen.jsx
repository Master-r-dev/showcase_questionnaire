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
  updateScore,
  setLastStep,
} from "../slices/quizSlice";
import { toast } from "react-toastify";
import StepDisplay from "../components/StepDisplay";
import Loader from "../components/Loader";

const QuizScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  toast.error("In Progress");

  // Get quiz ID from URL parameters using useParams hook.

  const { id: quizId } = useParams();

  // Validate quizId on mount.
  useEffect(() => {
    if (!quizId || !/^[0-9a-fA-F]{24}$/.test(quizId)) {
      toast.error(`Invalid quiz ID: ${quizId}`);
      navigate("/");
    }
  }, [quizId, navigate]);

  // Fetch user's history for this quiz.
  const {
    data: historyData,
    isLoading: historyLoad,
    error: historyErr,
  } = useGetUserHistoryByIdQuery(quizId, { skip: !quizId });

  // Mutation hook for starting a new quiz.
  const [startQuiz] = useStartQuizMutation();

  // Get quiz details if already loaded in state.
  const quizFromState = useSelector((state) => state.quiz.currentQuiz);
  const lastStep = useSelector(
    (state) =>
      state.quiz.lastStep ||
      (state.quiz.currentQuiz && state.quiz.currentQuiz.stepIds[0])
  );

  // Fetch quiz details from backend if not already in state.
  const {
    data: quizFromQuery,
    isLoading: quizLoad,
    error: quizErr,
  } = useGetQuizByIdQuery(quizId, { skip: !!quizFromState });

  const currentQuiz = quizFromState || quizFromQuery;

  // When history data is available, decide whether to use existing history or start a new quiz.
  useEffect(() => {
    if (historyData) {
      if (historyData.progress && historyData.progress.length > 0) {
        // Quiz already started: set lastStep from the last history entry.
        const lastProgress =
          historyData.progress[historyData.progress.length - 1].step;
        dispatch(setLastStep(lastProgress));
      } else {
        // No history exists: start a new quiz.
        startQuiz(quizId)
          .unwrap()
          .then((quizData) => {
            console.log(quizData);
            dispatch(setCurrentQuiz(quizData));
            dispatch(setLastStep(quizData.stepIds[0]));
          })
          .catch((err) => {
            toast.error(err?.data?.message || "Failed to start quiz");
            navigate("/");
          });
      }
    }
  }, [historyData, dispatch, quizId, startQuiz, navigate]);

  // If quizFromState changes to a new value, update it.
  if (
    quizFromState &&
    JSON.stringify(quizFromState) !== JSON.stringify(currentQuiz)
  ) {
    dispatch(setCurrentQuiz(currentQuiz));
  }

  if (quizLoad || historyLoad) return <Loader />;
  if (quizErr)
    return (
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card bg-light w-75">
          <h1 className="text-center mb-4">Error</h1>
          <p className="text-center mb-4">
            Error generating quiz: {quizErr.error || "Unknown error"}
          </p>
        </Card>
      </Container>
    );
  if (!currentQuiz) return null; // Wait for quiz to load

  const { _id, stepIds, score } = currentQuiz;
  const currentStepIndex = stepIds.indexOf(lastStep);

  // Handler to submit an answer for the current step.
  const [answerStep, { isLoading: answerLoad, error: answerErr }] =
    useAnswerStepMutation();
  const handleSubmitAnswer = async (answer, mode, lastQuestion) => {
    try {
      const response = await answerStep({
        quizId: _id,
        stepId: lastStep,
        answer,
        mode,
      }).unwrap();

      if (lastQuestion) {
        dispatch(
          setResult({
            score: response.isCorrect ? score + 1 : score,
            total: stepIds.length,
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
      dispatch(setLastStep(stepIds[currentStepIndex + 1]));
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Container className="mt-5">
      <h2>{currentQuiz.name || "Loading..."}</h2>
      {/* StepDisplay component fetches and shows the step details */}
      <StepDisplay stepId={lastStep} onAnswer={handleSubmitAnswer} />
      {answerLoad && <Loader />}
      {answerErr && (
        <Alert variant="danger" className="mt-3">
          Error: {answerErr.data?.message || "Something went wrong"}
        </Alert>
      )}
    </Container>
  );
};

export default QuizScreen;
