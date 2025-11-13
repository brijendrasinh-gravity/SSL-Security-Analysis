import { useState } from "react";
import { Form, Button, Alert, Spinner, Card, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Shield, ArrowRight } from "lucide-react";
import API from "../../api/api";

function FirstTimeLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/sslanalysis/first-login-check", { email });

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Email verified! Redirecting to set password...",
        });
        setTimeout(() => {
          navigate("/set-first-time-password", {
            state: {
              userId: response.data.userId,
              email: response.data.email,
            },
          });
        }, 1500);
      }
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <Row className="justify-content-center">
          <Col lg={5} md={7}>
            <div className="text-center mb-4">
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
                <Shield className="text-primary" size={40} />
              </div>
              <h2 className="fw-bold text-dark">First Time Login</h2>
              <p className="text-muted">Verify your email to set a new password</p>
            </div>

            <Card className="shadow border-0">
              <Card.Body className="p-4">
                {message.text && (
                  <Alert variant={message.type} className="mb-4">
                    {message.text}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <Mail size={16} className="me-2" />
                      Email Address
                    </Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your registered email"
                      size="lg"
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      size="lg"
                      className="fw-semibold"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ArrowRight size={18} className="me-2" />
                          Continue
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted">Already set your password? </span>
                  <Link
                    to="/login"
                    className="text-primary text-decoration-none fw-semibold"
                  >
                    Sign In
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default FirstTimeLogin;
