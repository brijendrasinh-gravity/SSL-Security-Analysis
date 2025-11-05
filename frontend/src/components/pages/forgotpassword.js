import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import API from "../../api/api";
import { useNavigate } from "react-router-dom";

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
    <div className="container mt-5 col-md-6">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">Forgot Password</h3>
        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Enter your registered Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              placeholder="Enter email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading} className="w-100">
            {loading ? <Spinner size="sm" animation="border" /> : "Send OTP"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default ForgotPassword;
