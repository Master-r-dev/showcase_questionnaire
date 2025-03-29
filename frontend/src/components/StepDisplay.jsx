import { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ProgressBar,
  Card,
  Spinner,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { FaArrowLeft, FaArrowRight, FaLeaf } from "react-icons/fa";
import Loader from "../components/Loader";
import { useGetStepByIdQuery } from "../slices/quizApiSlice"; // Adjust the import path as needed
import { addStep, setLastStep } from "../slices/quizSlice";
import { toast } from "react-toastify";
//import PropTypes from "prop-types";
const StepDisplay = ({ stepId, onAnswer }) => {
  const dispatch = useDispatch();

  const steps = useSelector((state) => state.quiz.steps);
  const stepDataFromState = steps[stepId];
  const {
    data: stepDataFromQuery,
    isLoading,
    isError,
  } = useGetStepByIdQuery(stepId, {
    skip: !!stepDataFromState, // Skip the query if stepDataFromState exists
  });

  const stepData = stepDataFromState || stepDataFromQuery; // Use stepDataFromState if available, otherwise use fetched data
  if (isError) {
    toast.error("Error loading step data");
  }
  // case : user pressed on random quiz button (on that prev page he will get temp quiz id and steps)
  // thre it would be added to state and then we can use it to fetch step data
  const { stepIds } = useSelector((state) => state.quiz?.currentQuiz);

  // case : user pressed on start quiz button with quizId
  //const dispatch = useDispatch();
  // Optionally, if stepData is not loaded and not provided, dispatch an action to fetch it.
  // useEffect(() => {
  //   if (!stepData) {
  //     dispatch(fetchStepData());
  //   }
  // }, [stepData, dispatch]);
  // Retrieve quiz data from Redux state (or fall back to defaults)
  const lastStep = useSelector((state) => state.quiz?.lastStep);
  const currentStep =
    stepIds.indexOf(lastStep) == 0 ? 1 : stepIds.indexOf(lastStep) + 1;

  const totalSteps = stepIds.length;

  // Local state for answer; for multi-choice, initialize with an array.
  const [answer, setAnswer] = useState("");

  // Reset answer when stepData changes.
  useEffect(() => {
    if (stepData && !steps[lastStep]?.answer) {
      dispatch(setLastStep(stepData._id)); // Update last step in Redux state
      dispatch(addStep(stepData)); // Add step data to Redux state
      setAnswer(stepData.mode === "multi-choice" ? [] : "");
    }
  }, [stepData]);

  // Input handlers.
  const handleInputChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleRadioChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleCheckboxChange = (option) => {
    if (answer.includes(option)) {
      setAnswer(answer.filter((item) => item !== option));
    } else {
      setAnswer([...answer, option]);
    }
  };

  // Handler for clicking the Next button.
  const handleNext = () => {
    if (currentStep !== totalSteps) {
      // isAnswered is true if the answer is already given
      // Logic to go to the next step.
      const nextStepId = stepIds[currentStep]; // Get the previous step ID
      dispatch(setLastStep(nextStepId)); // Update last step in Redux state
      return;
    }
  };

  //Handler for clicking the Sent button.
  const handleSent = () => {
    if (!!steps[lastStep]?.answer) {
      toast.error("You already gave answer");
      return;
    }
    if (
      ((stepData.mode === "input" || stepData.mode === "numeric") &&
        answer.trim() !== "") ||
      (stepData.mode === "single-choice" && answer !== "") ||
      (stepData.mode === "multi-choice" && answer.length > 0)
    ) {
      onAnswer(answer, stepData.mode, currentStep == totalSteps); // Call the onAnswer function with the answer and mode
    } else {
      toast.error("Provide answer first");
    }
    console.log("Answer submitted:", answer);
  };

  // Handler for clicking the Back button.
  const handleBack = () => {
    // Logic to go back to the previous step.
    if (currentStep > 1) {
      const previousStepId = stepIds[currentStep - 2]; // Get the previous step ID
      dispatch(setLastStep(previousStepId)); // Update last step in Redux state
      console.log("Going back to the previous step:", previousStepId);
    }
  };

  const isAnswered = !!steps[lastStep]?.answer;
  // Render input based on question type.
  const renderInput = () => {
    const givenAnswer = steps[lastStep]?.answer; // Get the answer from Redux state
    switch (stepData.mode) {
      case "input":
        return (
          <Form.Control
            type="text"
            placeholder="Type your answer here..."
            value={givenAnswer ?? answer}
            onChange={handleInputChange}
            disabled={isAnswered}
            style={
              isAnswered
                ? { backgroundColor: "#e9ecef", cursor: "not-allowed" }
                : {}
            }
          />
        );
      case "numeric":
        return (
          <Form.Control
            type="number"
            placeholder="Enter a number..."
            value={givenAnswer ?? answer}
            onChange={handleInputChange}
            disabled={isAnswered}
            style={
              isAnswered
                ? { backgroundColor: "#e9ecef", cursor: "not-allowed" }
                : {}
            }
          />
        );
      case "single-choice":
        return stepData.options.map((option, idx) => (
          <Form.Check
            type="radio"
            key={idx}
            label={option}
            name="singleChoice"
            value={option}
            checked={givenAnswer ? givenAnswer == option : answer == option}
            onChange={handleRadioChange}
            disabled={isAnswered}
            className={`mb-2 ${isAnswered ? "text-muted" : ""}`}
          />
        ));
      case "multi-choice":
        return stepData.options.map((option, idx) => (
          <Form.Check
            type="checkbox"
            key={idx}
            label={option}
            name="multiChoice"
            value={option}
            checked={
              givenAnswer
                ? givenAnswer.includes(option)
                : answer.includes(option)
            }
            onChange={() => handleCheckboxChange(option)}
            disabled={isAnswered}
            className={`mb-2 ${isAnswered ? "text-muted" : ""}`}
          />
        ));
      default:
        return null;
    }
  };

  return (
    <Container className="my-4">
      <Card className="shadow p-4">
        <Card.Body>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <Row>
                <Col>
                  <h4>{stepData.question}</h4>
                </Col>
              </Row>

              <Row className="my-3">
                <Col>
                  <Form>
                    {renderInput()}
                    <input type="hidden" />
                    <Button
                      type="submit"
                      variant="primary"
                      onClick={(e) => {
                        if (isAnswered) return;
                        e.preventDefault();
                        handleSent();
                      }}
                      onSubmit={(e) => {
                        if (isAnswered) return;
                        e.preventDefault();
                        handleSent();
                      }}
                      disabled={isAnswered}
                      className="ms-2"
                    >
                      {currentStep === totalSteps ? "Finish" : "Answer"}{" "}
                      <FaLeaf className="me-2" />
                    </Button>
                  </Form>
                </Col>
              </Row>

              <Row className="align-items-center">
                <Col xs={8}>
                  <ProgressBar
                    now={(currentStep / totalSteps) * 100}
                    className="mb-2"
                  />
                  <p className="mb-0">
                    Step {currentStep} of {totalSteps}
                  </p>
                </Col>
                <Col xs={4} className="text-end">
                  {currentStep !== 1 && (
                    <Button variant="secondary" onClick={handleBack}>
                      <FaArrowLeft className="ms-2" /> Back
                    </Button>
                  )}
                  {currentStep !== totalSteps && (
                    <Button
                      variant="primary"
                      onClick={handleNext}
                      className="ms-2"
                    >
                      Next
                      <FaArrowRight className="me-2" />
                    </Button>
                  )}
                </Col>
              </Row>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default StepDisplay;
