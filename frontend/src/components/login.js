import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/sslanalysis/login", formData);
      localStorage.setItem("token", response.data.token);
      setMessage({ type: "success", text: "Login successful!" });
      setTimeout(() => navigate("/"), 1500);
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
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h3 className="mb-4 text-center fw-bolder">User Login</h3>

      {message.text && <Alert variant={message.type}>{message.text}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            required
          />
        </Form.Group>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <Link
            to="/forgot-password"
            className="text-decoration-underline text-light"
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
          className="w-100"
        >
          {loading ? <Spinner animation="border" size="sm" /> : "Login"}
        </Button>

        <div className="text-center mt-3">
          <small>
            New user?{" "}
            <Link
              to="/register"
              className="text-decoration-underline text-light"
            >
              Register here
            </Link>
          </small>
        </div>
      </Form>
    </div>
  );
}

export default Login;
