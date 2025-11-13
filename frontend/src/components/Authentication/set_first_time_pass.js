import { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner, Card, Row, Col } from "react-bootstrap";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Shield, CheckCircle } from "lucide-react";
import API from "../../api/api";

function SetFirstTimePassword() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();
  const location = useLocation();

  const userId = location.state?.userId;
  const email = location.state?.email;

  useEffect(() => {
    if (!userId || !email) {
      setMessage({
        type: "danger",
        text: "Invalid access. Please verify your email first.",
      });
      setTimeout(() => navigate("/first-time-login"), 2000);
    }
  }, [userId, email, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "danger", text: "Passwords do not match!" });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage({
        type: "danger",
        text: "Password must be at least 6 characters long",
      });
      setLoading(false);
      return;
    }

    // Check password pattern (uppercase, lowercase, number)
    const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/;
    if (!passwordPattern.test(formData.password)) {
      setMessage({
        type: "danger",
        text: "Password must include uppercase, lowercase, and a number",
      });
      setLoading(false);
      return;
    }

    try {
      const response = await API.post(
        `/sslanalysis/set-new-password/${userId}`,
        {
          email: email,
          newPassword: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: "Password set successfully! Redirecting to login...",
        });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.message || "Failed to set password",
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
              <h2 className="fw-bold text-dark">Set Your Password</h2>
              <p className="text-muted">Create a secure password for your account</p>
              {email && (
                <small className="text-muted d-block">
                  Setting password for: <strong>{email}</strong>
                </small>
              )}
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
                      <Lock size={16} className="me-2" />
                      New Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      size="lg"
                      required
                    />
                    <Form.Text className="text-muted">
                      Password must be at least 6 characters with uppercase, lowercase, and a number
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <Lock size={16} className="me-2" />
                      Confirm Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
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
                          Setting Password...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={18} className="me-2" />
                          Set Password
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

export default SetFirstTimePassword;
