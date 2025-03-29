import { Card, Button, Row, Col, Container } from "react-bootstrap";
import { FaPlay } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useGetAllQuizzesQuery } from "../slices/quizApiSlice";
import { useState } from "react";
import Pagination from "react-bootstrap/Pagination";
import { toast } from "react-toastify";
/* const quizzes = [
  {
    id: 1,
    title: "JavaScript Basics",
    description: "Test your JavaScript fundamentals knowledge.",
  },
  {
    id: 2,
    title: "React Essentials",
    description: "Assess your understanding of React and state management.",
  },
  {
    id: 3,
    title: "Redux Toolkit Mastery",
    description: "Deep dive into Redux Toolkit with hands-on questions.",
  },
]; */

const QuizList = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const { data: quizzes, isLoading } = useGetAllQuizzesQuery(currentPage);
  console.log(quizzes);
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  toast.error("In Progress");
  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Available Quizzes</h2>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <Row className="justify-content-center">
            {quizzes &&
              quizzes.quizzes.map((quiz) => (
                <Col
                  key={quiz._id}
                  xs={12}
                  sm={6}
                  md={4}
                  lg={3}
                  className="mb-4"
                >
                  <Card className="shadow-lg rounded border-0">
                    <Card.Body>
                      <Card.Title>{quiz.name}</Card.Title>
                      <Button
                        variant="primary"
                        className="w-100 d-flex align-items-center justify-content-center"
                        onClick={() => navigate(`/quiz/${quiz._id}`)}
                      >
                        <FaPlay className="me-2" /> Start Quiz
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </Row>
          <Pagination className="justify-content-center mt-4">
            {Array.from({ length: quizzes.totalPages }, (_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === quizzes.page}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </>
      )}
    </Container>
  );
};

export default QuizList;
