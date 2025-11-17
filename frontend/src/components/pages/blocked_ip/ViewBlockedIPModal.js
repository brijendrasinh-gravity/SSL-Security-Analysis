import React, { useState, useEffect } from "react";
import { Modal, Button, Spinner, Badge, Row, Col } from "react-bootstrap";
import { Shield, ShieldOff, Calendar, Info } from "lucide-react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function ViewBlockedIPModal({ show, onHide, ipId }) {
  const [ipData, setIPData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && ipId) {
      fetchIPData();
    }
  }, [show, ipId]);

  const fetchIPData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/blocked-ips/getblockIP/${ipId}`);
      if (res.data.success) {
        setIPData(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching IP data:", error);
      toast.error("Failed to load IP details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Blocked IP Details</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {loading ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading IP details...</p>
          </div>
        ) : ipData ? (
          <div className="p-3">
            <Row className="g-4">
              <Col md={12}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <h5 className="mb-0 text-primary">{ipData.ip_address}</h5>
                  <Badge
                    bg={ipData.blocked_type === "Login" ? "warning" : "info"}
                  >
                    {ipData.blocked_type}
                  </Badge>
                </div>
              </Col>

              <Col md={6}>
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    {ipData.login_access ? (
                      <Shield size={20} className="text-success" />
                    ) : (
                      <ShieldOff size={20} className="text-danger" />
                    )}
                    <strong>Login Access:</strong>
                  </div>
                  <Badge
                    bg={ipData.login_access ? "success" : "danger"}
                    className="px-3 py-2"
                  >
                    {ipData.login_access ? "Allowed" : "Blocked"}
                  </Badge>
                </div>
              </Col>

              <Col md={6}>
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Calendar size={20} className="text-primary" />
                    <strong>Created At:</strong>
                  </div>
                  <p className="mb-0">
                    {new Date(ipData.createdAt).toLocaleString()}
                  </p>
                </div>
              </Col>

              {ipData.browser_info && (
                <Col md={12}>
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Info size={20} className="text-info" />
                      <strong>Browser/System Information:</strong>
                    </div>
                    <p className="mb-0 text-muted">{ipData.browser_info}</p>
                  </div>
                </Col>
              )}

              {ipData.updatedAt && (
                <Col md={12}>
                  <div className="border rounded p-3 bg-light">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Calendar size={20} className="text-secondary" />
                      <strong>Last Updated:</strong>
                    </div>
                    <p className="mb-0">
                      {new Date(ipData.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-muted">No data available</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ViewBlockedIPModal;
