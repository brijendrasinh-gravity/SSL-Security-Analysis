import { useState } from "react";
import { Form, Button, Alert, Spinner, Card, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Shield, ArrowLeft, Send } from "lucide-react";
import API from "../../api/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await API.post("/sslanalysis/forgotpassword", { email });

      if (response.data.success) {
        setMessage("OTP has been sent to your registered email address.");
        setTimeout(() => {
          navigate("/verify-otp", { state: { email } }); // send email to next page
        }, 2000);
      } else {
        setError(response.data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Forgot password error:", err);
      setError("Server error while sending OTP");
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
              <h2 className="fw-bold text-dark">SSL Security Analysis</h2>
              <p className="text-muted">Reset your password</p>
            </div>

            <Card className="shadow border-0">
              <Card.Body className="p-4">
                <div className="mb-4">
                  <Link
                    to="/login"
                    className="text-primary text-decoration-none d-inline-flex align-items-center"
                  >
                    <ArrowLeft size={16} className="me-2" />
                    Back to Sign In
                  </Link>
                </div>

                {message && (
                  <Alert variant="success" className="mb-4">
                    {message}
                  </Alert>
                )}
                {error && (
                  <Alert variant="danger" className="mb-4">
                    {error}
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
                      placeholder="Enter your registered email"
                      onChange={(e) => setEmail(e.target.value)}
                      size="lg"
                      required
                    />
                    <Form.Text className="text-muted">
                      We'll send a verification code to this email address
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading}
                      size="lg"
                      className="fw-semibold"
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <Send size={18} className="me-2" />
                          Send OTP
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted">Remember your password? </span>
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

export default ForgotPassword;
