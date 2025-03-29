import { useState, useEffect } from "react";
// import { Link, useNavigate } from 'react-router-dom';
import { Form, Container, Card, Button, Row, Col } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import FormContainer from "../components/FormContainer";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import {
  useUpdateUserMutation,
  useGetUserHistoryQuery,
} from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";

const ProfileScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { data: historyData, isLoading: historyLoading } =
    useGetUserHistoryQuery();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading: updateLoading }] = useUpdateUserMutation();

  useEffect(() => {
    setEmail(userInfo.email);
  }, [userInfo.email, userInfo.name]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
    } else {
      try {
        const res = await updateProfile({
          _id: userInfo._id,
          name,
          email,
          password,
        }).unwrap();
        console.log(res);
        dispatch(setCredentials(res));
        toast.success("Profile updated successfully");
      } catch (err) {
        toast.error(
          err?.data?.message || err?.message || "Something went wrong"
        );
      }
    }
  };
  console.log(historyData);
  return (
    <>
      <FormContainer>
        <h1>Update Profile</h1>

        <Form onSubmit={submitHandler}>
          <Form.Group className="my-2" controlId="email">
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <Form.Group className="my-2" controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group className="my-2" controlId="confirmPassword">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button type="submit" variant="primary" className="mt-3">
            Update
          </Button>

          {(updateLoading || historyLoading) && <Loader />}
        </Form>
      </FormContainer>
      <Container className="mt-4">
        <h2 className="text-center mb-4">My Quizzes</h2>
        {historyLoading ? (
          <Loader />
        ) : (
          <Row className="justify-content-center">
            {historyData?.quizzes?.length > 0 &&
              historyData.quizzes.map((quiz) => (
                <Col
                  key={`${quiz.name}_${quiz._id}`}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  className="mb-4"
                >
                  <Card className="shadow rounded border-0">
                    <Card.Body>
                      <Card.Title className="mb-3">{quiz.quizName}</Card.Title>
                      <Card.Text className="text-muted">
                        <p>
                          <strong>Score:</strong> {quiz.score}
                        </p>
                        <p>
                          <strong>Progress:</strong>
                        </p>
                        <ul className="list-unstyled">
                          {quiz.progress.map((p, index) => (
                            <li
                              key={index}
                              style={{
                                backgroundColor: p.isCorrect
                                  ? "rgba(0, 128, 0, 0.2)"
                                  : "rgba(255, 0, 0, 0.2)",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                marginBottom: "4px",
                                transition: "background-color 0.3s ease",
                              }}
                            >
                              <small>
                                Question {p.question}: {p.answer}
                              </small>
                            </li>
                          ))}
                        </ul>
                        <p>
                          <strong>Completed:</strong>{" "}
                          {quiz.completed ? "Yes" : "No"}
                        </p>
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
        )}
      </Container>
    </>
  );
};

export default ProfileScreen;
