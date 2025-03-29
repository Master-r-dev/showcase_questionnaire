import { Container, Card, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { clearQuizState, setCurrentQuiz } from "../slices/quizSlice";
const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { currentQuiz } = useSelector((state) => state.quiz);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutApiCall, { isLoading: isLogoutLoading }] = useLogoutMutation();
  const result = useSelector((state) => state.quiz.result);
  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/login");
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Something went wrong");
      console.log(err);
    }
  };

  return (
    <div className=" py-5">
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card bg-light w-75">
          <h1 className="text-center mb-4">Showcase Questionnaire</h1>
          <p className="text-center mb-4">
            This is a example for Showcase Questionnaire app.
          </p>
          {userInfo ? (
            <>
              <p className="text-center mb-4">Welcome {userInfo.email}</p>
              {result && (
                <Container className="text-center mt-5">
                  <h1>Quiz "{result.quizName}" Completed!</h1>
                  <p>
                    Your score: {result.score} / {result.total}
                  </p>
                </Container>
              )}
              <div className="d-flex">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/quiz/random`)}
                  className="me-3"
                >
                  Random Quiz
                </Button>
                {/*  {currentQuiz & !result ? (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/quiz/${currentQuiz._id}`)}
                    className="me-3"
                  >
                    Resume Quiz
                  </Button>
                ) : (
                  {}
                )} */}
                {/* <Button
                  variant="primary"
                  onClick={() => navigate("/quizzes")}
                  className="me-3"
                >
                  Choose Quiz
                </Button> */}
                <Button
                  variant="primary"
                  onClick={() => navigate(`/profile`)}
                  className="me-3"
                >
                  See history
                </Button>
              </div>
            </>
          ) : (
            <>
              {result && (
                <Container className="text-center mt-5">
                  <h1>Quiz "{result.quizName}" Completed!</h1>
                  <p>
                    Your score: {result.score} / {result.total}
                  </p>
                </Container>
              )}
              <div className="d-flex">
                <Button
                  variant="primary"
                  onClick={() => navigate("/quiz/random")}
                  className="me-3"
                >
                  Start Random Quiz
                </Button>
              </div>
            </>
          )}
          {isLogoutLoading && <Loader />}
        </Card>
      </Container>
    </div>
  );
};

export default Hero;
