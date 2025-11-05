import { useState } from "react";
import { Form, Button, Alert, Spinner, Card, InputGroup } from "react-bootstrap";
import { Lock, Eye, EyeOff, Shield } from "lucide-react";
import API from "../api/api";

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
  };

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
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <div className="text-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
          <Shield className="text-primary" size={40} />
        </div>
        <h2 className="fw-bold">Change Password</h2>
        <p className="text-muted">Update your account password</p>
      </div>

      <Card className="shadow-sm border-0">
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
                Current Password
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.old ? "text" : "password"}
                  name="oldpassword"
                  value={formData.oldpassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  size="lg"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => togglePasswordVisibility("old")}
                >
                  {showPasswords.old ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <Lock size={16} className="me-2" />
                New Password
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.new ? "text" : "password"}
                  name="newpassword"
                  value={formData.newpassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  size="lg"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
              <Form.Text className="text-muted">
                Password must be at least 8 characters long
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">
                <Lock size={16} className="me-2" />
                Confirm New Password
              </Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmpassword"
                  value={formData.confirmpassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  size="lg"
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => togglePasswordVisibility("confirm")}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="d-grid">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="fw-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Updating Password...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default ChangePassword;
