import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert, Card, Row, Col } from "react-bootstrap";
import { Shield, AlertTriangle, CheckCircle } from "lucide-react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function MaxLoginAttempts() {
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await API.get("/settings/get-settings");
      if (res.data.success) {
        const attempts = parseInt(res.data.data.MAX_LOGIN_ATTEMPTS || 5);
        setMaxAttempts(attempts);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (maxAttempts < 1 || maxAttempts > 20) {
      toast.error("Max attempts must be between 1 and 20");
      return;
    }

    setLoading(true);
    setSaved(false);
    try {
      await API.put("/settings/update-setting", {
        field_name: "MAX_LOGIN_ATTEMPTS",
        field_value: maxAttempts.toString(),
      });
      toast.success("Settings updated successfully!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading settings...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h5 className="fw-bold text-primary d-flex align-items-center gap-2">
          <Shield size={24} />
          Maximum Login Attempts
        </h5>
        <p className="text-muted mb-0">
          Configure the maximum number of failed login attempts before an IP address is automatically blocked.
        </p>
      </div>

      <Row>
        <Col md={8}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Max Failed Login Attempts
                </Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="20"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(parseInt(e.target.value))}
                  className="form-control-lg"
                />
                <Form.Text className="text-muted">
                  Set between 1 and 20 attempts. Default is 5.
                </Form.Text>
              </Form.Group>

              <Alert variant="warning" className="d-flex align-items-start gap-2">
                <AlertTriangle size={20} className="mt-1" />
                <div>
                  <strong>Security Notice:</strong> When a user exceeds the maximum login attempts with incorrect passwords, their IP address will be automatically blocked and added to the Blocked IP list.
                </div>
              </Alert>

              {saved && (
                <Alert variant="success" className="d-flex align-items-center gap-2">
                  <CheckCircle size={20} />
                  Settings saved successfully!
                </Alert>
              )}

              <div className="d-flex gap-2">
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={loading}
                  className="px-4"
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={fetchSettings}
                  disabled={loading}
                >
                  Reset
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <strong>How It Works</strong>
            </Card.Header>
            <Card.Body>
              <ol className="mb-0 ps-3">
                <li className="mb-2">User attempts to login with incorrect password</li>
                <li className="mb-2">System tracks failed attempts by IP address</li>
                <li className="mb-2">After reaching max attempts, IP is automatically blocked</li>
                <li className="mb-2">Blocked IPs cannot access the system</li>
                <li className="mb-0">Admin can unblock IPs from Blocked IP Manager</li>
              </ol>
            </Card.Body>
          </Card>

          <Card className="border-info mt-3">
            <Card.Header className="bg-info text-white">
              <strong>Current Setting</strong>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="display-4 text-primary mb-0">{maxAttempts}</h1>
              <p className="text-muted mb-0">Failed Attempts Allowed</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default MaxLoginAttempts;
