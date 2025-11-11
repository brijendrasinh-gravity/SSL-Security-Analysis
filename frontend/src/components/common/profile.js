import { useEffect, useState } from "react";
import { Card, Spinner, Button, Alert, Form, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { User, Mail, Phone, FileText, Calendar, Lock, Save, Shield } from "lucide-react";
import API from "../../api/api";

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login.");
        setLoading(false);
        return;
      }

      const res = await API.get("/sslanalysis/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        setUser(res.data.data);
      } else {
        setError(res.data?.message || "Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const res = await API.put(
        "/sslanalysis/updateprofile",
        {
          user_name: user.user_name,
          phone_number: user.phone_number,
          description: user.description,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setMessage("Profile updated successfully!");
        fetchProfile(); // refresh when data is updated
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

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" /> <p>Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <Alert variant="danger">{error}</Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mt-5">
        <Alert variant="warning">No profile data available.</Alert>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: "900px" }}>
      <div className="text-center mb-4">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
          <Shield className="text-primary" size={40} />
        </div>
        <h2 className="fw-bold">My Profile</h2>
        <p className="text-muted">Manage your account information</p>
      </div>

      <Row>
        <Col lg={4} className="mb-4">
          <Card className="shadow-sm border-0 text-center">
            <Card.Body className="p-4">
              <div 
                className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center text-white mb-3"
                style={{ width: '100px', height: '100px', fontSize: '36px', fontWeight: '600' }}
              >
                {user.user_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <h5 className="fw-bold mb-1">{user.user_name || "User"}</h5>
              <p className="text-muted small mb-3">{user.email || ""}</p>
              <div className="d-flex align-items-center justify-content-center text-muted small">
                <Calendar size={14} className="me-2" />
                <span>
                  Member since {user.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { 
                        month: "short", 
                        year: "numeric" 
                      })
                    : "N/A"}
                </span>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              {message && (
                <Alert variant="success" className="mb-4">
                  {message}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleUpdate}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <User size={16} className="me-2" />
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="user_name"
                    value={user.user_name || ""}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <Mail size={16} className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    value={user.email || ""}
                    readOnly
                    size="lg"
                    className="bg-light"
                  />
                  <Form.Text className="text-muted">
                    Email cannot be changed
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <Phone size={16} className="me-2" />
                    Phone Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="phone_number"
                    value={user.phone_number || ""}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <FileText size={16} className="me-2" />
                    Description
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={user.description || ""}
                    onChange={handleChange}
                    placeholder="Tell us something about yourself"
                    size="lg"
                  />
                </Form.Group>

                <div className="d-flex gap-3">
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={saving}
                    size="lg"
                    className="fw-semibold flex-grow-1"
                  >
                    {saving ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
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
                    onClick={() => navigate("/change-password")}
                    size="lg"
                    className="fw-semibold"
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