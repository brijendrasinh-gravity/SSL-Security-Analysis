import React, { useState } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import API from "../api/api";

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // basic validation
    if (formData.newpassword !== formData.confirmpassword) {
      setMessage({ type: "danger", text: "New passwords do not match!" });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await API.post("/sslanalysis/changepassword", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage({ type: "success", text: response.data.message });
      setFormData({ oldpassword: "", newpassword: "", confirmpassword: "" });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.response?.data || "Failed to change password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h3 className="text-center mb-4 text-white fw-bold">Change Password</h3>

      {message.text && <Alert variant={message.type}>{message.text}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Old Password</Form.Label>
          <Form.Control
            type="password"
            name="oldpassword"
            value={formData.oldpassword}
            onChange={handleChange}
            placeholder="Enter your old password"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            name="newpassword"
            value={formData.newpassword}
            onChange={handleChange}
            placeholder="Enter new password"
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            name="confirmpassword"
            value={formData.confirmpassword}
            onChange={handleChange}
            placeholder="Confirm new password"
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
          {loading ? <Spinner animation="border" size="sm" /> : "Update Password"}
        </Button>
      </Form>
    </div>
  );
}

export default ChangePassword;
