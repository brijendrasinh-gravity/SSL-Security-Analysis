import { useContext, useState } from "react";
import { Form, Button, Alert, Spinner, Card, Row, Col } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { LogIn, Shield, Mail, Lock } from "lucide-react";
import API from "../../api/api";
import { UserContext } from "../../context/usercontext";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const { setUser } = useContext(UserContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/sslanalysis/login", formData);
      
      // Check if first-time login
      if (response.data?.is_first_time) {
        setMessage({
          type: "info",
          text: "First-time login detected. Redirecting to set password...",
        });
        setTimeout(() => {
          navigate("/set-first-time-password", {
            state: {
              userId: response.data.userId,
              email: response.data.email,
            },
          });
        }, 1500);
        return;
      }

      // Normal login flow
      if (response.data?.token && response.data?.user) {
        localStorage.setItem("token", response.data.token);
        setUser(response.data.user);
        setMessage({ type: "success", text: "Login is successful" });
        setTimeout(() => navigate("/"), 1500);
      } else {
        setMessage({ type: "danger", text: "Invalid login response" });
      }
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data?.error || "Login failed",
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
              <h2 className="fw-bold text-dark">SSL Security Analysis</h2>
              <p className="text-muted">Sign in to your account</p>
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
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      size="lg"
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">
                      <Lock size={16} className="me-2" />
                      Password
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      size="lg"
                      required
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-end mb-3">
                    <Link
                      to="/forgot-password"
                      className="text-primary text-decoration-none"
                    >
                      Forgot Password?
                    </Link>
                  </div>

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
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LogIn size={18} className="me-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <span className="text-muted">Don't have an account? </span>
                  <Link
                    to="/register"
                    className="text-primary text-decoration-none fw-semibold"
                  >
                    Create Account
                  </Link>
                </div>

                <div className="text-center mt-2">
                  <span className="text-muted">First time user? </span>
                  <Link
                    to="/first-time-login"
                    className="text-primary text-decoration-none fw-semibold"
                  >
                    Set Password
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

export default Login;
