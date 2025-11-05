import React, { useEffect, useState } from "react";
import { Card, Spinner, Button, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import BackButton from "./common/backbutton";

function Profile({ backButton }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.success) {
        setUser(res.data.data);
      } else if (res.data) {
        setError(res.data.message || "Failed to load profile");
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.response?.data?.message || err.message || "Server error");
    } finally {
      setLoading(false);
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

        <div className="mb-3">
          <strong>Username:</strong>
          <div>{user.user_name || user.username || "N/A"}</div>
        </div>

        <div className="mb-3">
          <strong>Email:</strong>
          <div>{user.email || "N/A"}</div>
        </div>

        <div className="mb-3">
          <strong>Member since:</strong>
          <div>
            {user.createdAt
              ? new Date(user.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "N/A"}
          </div>
        </div>

        <div className="d-flex gap-2">
          <Button
            variant="warning"
            onClick={() => navigate("/change-password")}
          >
            Change Password
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default Profile;
