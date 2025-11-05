import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../api/api";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // We receive the email from VerifyOtp page
  const email = location.state?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      return setError("Please fill all fields");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      const response = await API.post("/sslanalysis/forgotresetpassword", {
        email,
        newpassword: newPassword,
      });

      if (response.data.success) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setError(response.data.error || "Error resetting password");
      }
    } catch (err) {
      console.error("Reset Password Error:", err);
      setError("Server error while resetting password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 col-md-6">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">Reset Password</h3>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              placeholder="Enter your email"
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            className="w-100"
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : "Reset Password"}
          </Button>
        </Form>
      </div>
    </div>
  );
}

export default ResetPassword;