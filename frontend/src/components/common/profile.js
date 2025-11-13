import { useContext, useState, useEffect } from "react";
import { Card, Spinner, Button, Alert, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { User, Calendar, Lock, Save } from "lucide-react";
import { UserContext } from "../../context/usercontext";
import API from "../../api/api";

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  //  Prefill formData when context user becomes available
  useEffect(() => {
    if (user) {
      setFormData(user);
      setIsLoading(false);
    }
  }, [user]);

  // Show loader if user context not ready yet
  if (isLoading || !user) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading profile...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");

      const formDataToSend = new FormData();
      formDataToSend.append("user_name", formData.user_name);
      formDataToSend.append("phone_number", formData.phone_number);
      formDataToSend.append("description", formData.description);

      if (newImage) {
        formDataToSend.append("profile_image", newImage);
      }

      const res = await API.put("/sslanalysis/updateprofile", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        setMessage("Profile updated successfully!");

        const updatedUser = {
          ...user,
          ...formData,
          profile_image:
            res.data.updatedData.profile_image || user.profile_image,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        setNewImage(null);
      } else {
        setError(res.data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.response?.data?.message || "Server error during update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <User size={24} className="text-primary" />
          <div>
            <h4 className="mb-0 fw-bold text-primary">My Profile</h4>
            <small className="text-muted">
              Manage your account information
            </small>
          </div>
        </div>
        <Button
          variant="outline-primary"
          className="d-flex align-items-center gap-2"
          onClick={() => navigate("/change-password")}
        >
          <Lock size={18} />
          Change Password
        </Button>
      </div>

      {/* Alerts */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage("")}>
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Row className="g-4">
        {/* LEFT PROFILE CARD */}
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Body className="text-center p-4">
              <div className="d-flex justify-content-center mb-3">
                {previewImage ||
                (formData.profile_image &&
                  formData.profile_image !== "null") ? (
                  <img
                    src={
                      previewImage ||
                      `http://localhost:7000${formData.profile_image}`
                    }
                    alt="Profile"
                    className="rounded-circle border shadow-sm"
                    style={{
                      width: "140px",
                      height: "140px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary d-flex justify-content-center align-items-center text-white shadow-sm"
                    style={{
                      width: "140px",
                      height: "140px",
                      fontSize: "48px",
                      fontWeight: "600",
                    }}
                  >
                    {formData.user_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
              </div>

              <h5 className="fw-bold mb-1">{formData.user_name}</h5>
              <p className="text-muted small mb-3">{formData.email}</p>

              <div className="text-muted small mb-3">
                <Calendar size={14} className="me-1" />
                Member since{" "}
                {formData.createdAt
                  ? new Date(formData.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </div>

              <hr />

              {/* Upload Input */}
              <div className="mt-3">
                <Form.Label className="fw-semibold small">
                  Change Profile Photo
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  size="sm"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setNewImage(file);
                      setPreviewImage(URL.createObjectURL(file));
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT FORM CARD */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4">Profile Information</h5>

              <Form onSubmit={handleUpdate}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Username *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="user_name"
                        placeholder="Enter username"
                        value={formData.user_name || ""}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={formData.email || ""}
                        readOnly
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="phone_number"
                        placeholder="Enter phone number"
                        value={formData.phone_number || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Member Since
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={
                          formData.createdAt
                            ? new Date(formData.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )
                            : "N/A"
                        }
                        readOnly
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">
                        Description
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={4}
                        name="description"
                        placeholder="Tell us about yourself..."
                        value={formData.description || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Buttons */}
                <div className="d-flex justify-content-end mt-4 gap-2">
                  <Button
                    variant="secondary"
                    className="d-flex align-items-center gap-2"
                    onClick={() => {
                      setFormData(user);
                      setNewImage(null);
                      setPreviewImage(null);
                    }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    className="d-flex align-items-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Profile;
