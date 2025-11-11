import React, { useEffect, useState } from "react";
import { Modal, Spinner, Row, Col, Card, Badge } from "react-bootstrap";
import API from "../../../api/api";

function ViewUserModal({ show, onHide, userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch user details
  useEffect(() => {
    if (!userId || !show) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/users/get-user/${userId}`);
        setUser(res.data.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, show]);

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title>User Details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : user ? (
          <Card className="p-3 shadow-sm border-0">
            <div className="text-center mb-4">
              <img
                src={
                  user.profile_image
                    ? `http://localhost:7000${user.profile_image}`
                    : "/default-profile.png"
                }
                alt="User"
                className="rounded-circle border shadow-sm"
                width="120"
                height="120"
                style={{ objectFit: "cover" }}
              />
              <h5 className="mt-3 mb-0 fw-bold text-primary">{user.user_name}</h5>
              <Badge
                bg={user.status ? "success" : "secondary"}
                className="mt-2 px-3 py-2"
              >
                {user.status ? "Active" : "Inactive"}
              </Badge>
            </div>

            <Row>
              <Col xs={12} className="mb-3">
                <strong>Email:</strong>
                <div>{user.email || "-"}</div>
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Phone Number:</strong>
                <div>{user.phone_number || "-"}</div>
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Role:</strong>
                <div>{user.role?.name || "-"}</div>
              </Col>
              <Col xs={12} className="mb-3">
                <strong>Description:</strong>
                <div>{user.description || "No description provided"}</div>
              </Col>
              <Col xs={12}>
                <strong>Created At:</strong>
                <div>{new Date(user.createdAt).toLocaleString()}</div>
              </Col>
            </Row>
          </Card>
        ) : (
          <div className="text-center text-muted">No user data available.</div>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default ViewUserModal;
