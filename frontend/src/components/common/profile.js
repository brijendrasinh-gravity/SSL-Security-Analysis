import { useContext, useState, useEffect } from "react";
import {
  Card,
  Spinner,
  Button,
  Alert,
  Form,
  Row,
  Col,
  Toast,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  FileText,
  Calendar,
  Lock,
  Save,
  Shield,
} from "lucide-react";
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

  //  Prefill formData when context user becomes available
  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  // Show loader if user context not ready yet
  if (!user || !formData.user_name) {
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
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <div className="text-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
          <Shield className="text-primary" size={40} />
        </div>
        <h2 className="fw-bold">My Profile</h2>
        <p className="text-muted">Manage your account information</p>
      </div>

      <Row className="g-4">
        {/* LEFT PROFILE CARD */}
        <Col lg={4}>
          <Card className="shadow-sm border-0 text-center p-4">
            <div>
              {previewImage ||
              (formData.profile_image && formData.profile_image !== "null") ? (
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

            {/* Upload Input */}
            <div className="mt-3">
              <Form.Label className="fw-semibold">
                Change Profile Photo
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewImage(file);
                    setPreviewImage(URL.createObjectURL(file));
                  }
                }}
              />
            </div>

            <h5 className="fw-bold mt-3 mb-0">{formData.user_name}</h5>
            <p className="text-muted small mb-2">{formData.email}</p>

            <div className="text-muted small">
              <Calendar size={14} className="me-1" />
              Member since{" "}
              {formData.createdAt
                ? new Date(formData.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })
                : "N/A"}
            </div>
          </Card>
        </Col>

        {/* RIGHT FORM CARD */}
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {message && <Alert variant="success">{message}</Alert>}
              {error && <Alert variant="danger">{error}</Alert>}

              <h5 className="fw-bold mb-3">Profile Information</h5>

              <Form onSubmit={handleUpdate}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold">Username</Form.Label>
                      <Form.Control
                        type="text"
                        name="user_name"
                        value={formData.user_name || ""}
                        onChange={handleChange}
                        size="lg"
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
                        size="lg"
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
                        value={formData.phone_number || ""}
                        onChange={handleChange}
                        size="lg"
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
                        rows={3}
                        size="lg"
                        name="description"
                        value={formData.description || ""}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Buttons */}
                <div className="d-flex justify-content-end mt-4 gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={saving}
                    className="fw-semibold px-4"
                  >
                    {saving ? (
                      <>
                        <Spinner
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save size={18} className="me-2" />
                        Save Changes
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline-primary"
                    size="lg"
                    className="fw-semibold px-4"
                    onClick={() => navigate("/change-password")}
                  >
                    <Lock size={18} className="me-2" />
                    Change Password
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
