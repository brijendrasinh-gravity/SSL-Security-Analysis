import React, { useEffect, useState } from "react";
import { Card, Spinner, Button, Alert, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BackButton from "./common/backbutton";

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
    <div className="container mt-4">
      <div className="d-flex justify-content-end mb-3">
        <BackButton label="Back" variant="dark" />
      </div>

      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold mb-0">My Profile</h4>
        </div>

        {message && <Alert variant="success">{message}</Alert>}
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleUpdate}>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="user_name"
              value={user.user_name || ""}
              onChange={handleChange}
              placeholder="Enter your name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={user.email || ""}
              // disabled
              readOnly
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="text"
              name="phone_number"
              value={user.phone_number || ""}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={user.description || ""}
              onChange={handleChange}
              placeholder="Tell us something about yourself"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Member Since</Form.Label>
            <Form.Control
              type="text"
              value={
                user.createdAt
                  ? new Date(user.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "N/A"
              }
              readOnly
              disabled
            />
          </Form.Group>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <Button
              type="submit"
              variant="success"
              disabled={saving}
              className="px-4"
            >
              {saving ? (
                <>
                  <Spinner animation="border" size="sm" /> Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>

            <Button
              variant="warning"
              onClick={() => navigate("/change-password")}
              className="px-4"
            >
              Change Password
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;