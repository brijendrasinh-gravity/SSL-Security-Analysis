import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import API from "../api/api";

function Register() {
  const [formData, setFormData] = useState({
    user_name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await API.post("/sslanalysis/registration", formData);
      setMessage({ type: "success", text: response.data.message });
      setFormData({ user_name: "", email: "", password: "" });
    } catch (err) {
      setMessage({ type: "danger", text: err.response?.data?.error || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4" style={{ maxWidth: "500px" }}>
      <h3 className="mb-4 text-center">User Registration</h3>
      {message.text && <Alert variant={message.type}>{message.text}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>User Name</Form.Label>
          <Form.Control
            type="text"
            name="user_name"
            value={formData.user_name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </Form.Group>

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

        <Button type="submit" variant="primary" disabled={loading} className="w-100">
          {loading ? <Spinner animation="border" size="sm" /> : "Register"}
        </Button>
      </Form>
    </div>
  );
}

export default Register;
