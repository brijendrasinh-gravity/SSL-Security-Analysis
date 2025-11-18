import React, { useState, useEffect } from "react";
import { Form, Button, Spinner, Alert, Card, Row, Col } from "react-bootstrap";
import { Clock, AlertTriangle, CheckCircle, Calendar } from "lucide-react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function PasswordExpiry() {
  const [expiryDays, setExpiryDays] = useState(90);
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
        const days = parseInt(res.data.data.PASSWORD_EXPIRY_DAYS || 90);
        setExpiryDays(days);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async () => {
    if (expiryDays < 30 || expiryDays > 365) {
      toast.error("Password expiry must be between 30 and 365 days");
      return;
    }

    setLoading(true);
    setSaved(false);
    try {
      await API.put("/settings/update-setting", {
        field_name: "PASSWORD_EXPIRY_DAYS",
        field_value: expiryDays.toString(),
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
          <Clock size={24} />
          Password Expiration Policy
        </h5>
        <p className="text-muted mb-0">
          Configure how often users must change their passwords for enhanced security.
        </p>
      </div>

      <Row>
        <Col md={8}>
          <Card className="border-0 bg-light">
            <Card.Body>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  Password Expiry Period (Days)
                </Form.Label>
                <Form.Control
                  type="number"
                  min="30"
                  max="365"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  className="form-control-lg"
                />
                <Form.Text className="text-muted">
                  Set between 30 and 365 days. Default is 90 days.
                </Form.Text>
              </Form.Group>

              <Alert variant="info" className="d-flex align-items-start gap-2">
                <Calendar size={20} className="mt-1" />
                <div>
                  <strong>Reminder Policy:</strong> Users will receive a reminder 7 days before their password expires. Reminders are shown once per day.
                </div>
              </Alert>

              <Alert variant="warning" className="d-flex align-items-start gap-2">
                <AlertTriangle size={20} className="mt-1" />
                <div>
                  <strong>Expiration Policy:</strong> When a password expires, users will be forced to change it before they can access the system.
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
                <li className="mb-2">Password age is tracked from last change date</li>
                <li className="mb-2">Users get reminder 7 days before expiry</li>
                <li className="mb-2">Reminder shown once per day</li>
                <li className="mb-2">Expired passwords force password change</li>
                <li className="mb-0">Users redirected to change password page</li>
              </ol>
            </Card.Body>
          </Card>

          <Card className="border-info mt-3">
            <Card.Header className="bg-info text-white">
              <strong>Current Setting</strong>
            </Card.Header>
            <Card.Body className="text-center">
              <h1 className="display-4 text-primary mb-0">{expiryDays}</h1>
              <p className="text-muted mb-0">Days Until Expiry</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default PasswordExpiry;
