import { useEffect, useState } from "react";
import { Container, Button, Card, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";
import {
  useGenerateRandomQuizMutation,
  useAnswerRandomQuizStepMutation,
} from "../slices/quizApiSlice";
import {
  setCurrentQuiz,
  clearQuizState,
  addStep,
  setResult,
  updateScore,
  setLastStep,
} from "../slices/quizSlice";
import { toast } from "react-toastify";
import StepDisplay from "../components/StepDisplay";
import Loader from "../components/Loader";

const RandomQuizScreen = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [generateRandomQuiz, { isLoading: quizLoad, error: quizErr }] =
    useGenerateRandomQuizMutation();
  const [answerRandomQuizStep, { isLoading: answerLoad, error: answerErr }] =
    useAnswerRandomQuizStepMutation();
  const randomQuiz = useSelector((state) => state.quiz.currentQuiz);
  const lastStep = useSelector((state) => state.quiz.lastStep);
  const score = useSelector((state) => state.quiz.score);
  // On mount, if there's no quiz, generate one.
  useEffect(() => {
    if (!randomQuiz) {
      generateRandomQuiz({ size: 6 })
        .then((response) => {
          if (response.data) {
            //clear prev state
            dispatch(setCurrentQuiz(response.data));
          } else {
            console.log(response);
            toast.error(
              response?.error?.data.message || "Something went wrong"
            );
            navigate("/");
          }
        })
        .catch((err) => {
          toast.error(err?.message || "Something went wrong");
          console.log({ err });
        });
    }
    /*  return () => {
      // Cleanup function to clear quiz state when component unmounts
      dispatch(clearQuizState());
    }; */
  }, []);

  if (quizLoad) return <Loader />;
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

  if (!randomQuiz) return null; // Wait for quiz to load

  const { _id, steps } = randomQuiz;
  const currentStep =
    steps.indexOf(lastStep) == 0 ? 1 : steps.indexOf(lastStep) + 1;
  // Handler to submit an answer for the current step.
  const handleSubmitAnswer = async (answer, mode, lastQuestion) => {
    try {
      const response = await answerRandomQuizStep({
        quizId: _id,
        stepId: lastStep,
        answer,
        mode,
      }).unwrap();
      // Move to next step.
      if (lastQuestion) {
        dispatch(
          setResult({
            score: response.isCorrect ? score + 1 : score,
            //asnwers: Object.values(steps).map((step) => step.answer),
            total: steps.length,
            quizName: randomQuiz.name,
          })
        );
        //save in history of user if userInfo
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
      console.log(steps[currentStep]);
      dispatch(setLastStep(steps[currentStep]));
      //toast.dismiss();
      toast.success(response.isCorrect ? "Correct!" : "Incorrect!");
    } catch (err) {
      toast.error(err?.message || "Something went wrong");
    }
  };

  return (
    <Container className="mt-5">
      <h2>{randomQuiz.name || "Loading..."}</h2>
      {/* StepDisplay component fetches and shows the step details */}
      <StepDisplay stepId={lastStep} onAnswer={handleSubmitAnswer} />
      {answerLoad && <Loader />}
      {/* {answerErr && (
        <Alert variant="danger" className="mt-3">
          Error: {answerErr.data?.message || "Something went wrong"}
        </Alert>
      )} */}
    </Container>
  );
};

export default RandomQuizScreen;
