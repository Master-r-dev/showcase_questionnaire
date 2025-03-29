import { Container, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className=" py-5">
      <Container className="d-flex justify-content-center">
        <Card className="p-5 d-flex flex-column align-items-center hero-card bg-light w-75">
          <h1 className="text-center mb-4">404 - Not Found</h1>
          <p className="text-center mb-4">
            The page you are looking for does not exist.
          </p>
          <p className="text-center mb-4">Please be careful next time.</p>
          <div className="d-flex">
            <Button variant="primary" onClick={() => navigate("/")}>
              Go Home
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default NotFoundPage;
