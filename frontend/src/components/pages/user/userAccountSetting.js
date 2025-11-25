import React, { useEffect, useState } from "react";
import { Card, Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import API from "../../../api/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AccountSetting() {
  const { id } = useParams(); // user id from URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  const [settings, setSettings] = useState({
    api_limit_enabled: false,
    daily_limit: 0,
    api_used_today: 0,
    api_last_used_date: "",
    user_name: "",
  });

  // Fetch settings for this user
  const getSettings = async () => {
    try {
      const res = await API.get(`/users/account-setting/${id}`);
      const data = res.data.data;

      setSettings({
        api_limit_enabled: data.api_limit_enabled,
        daily_limit: data.daily_limit,
        api_used_today: data.api_used_today,
        api_last_used_date: data.api_last_used_date,
        user_name: data.user_name,
      });

      // Check if logged-in user is admin
      const loggedUser = JSON.parse(localStorage.getItem("user"));
      if (loggedUser?.role?.is_Admin === true) {
        setIsAdminUser(true);
        setIsEditable(true);
      } else {
        setIsAdminUser(false);
        setIsEditable(false);
      }

    } catch (err) {
      toast.error("Failed to load account settings");
    }
    setLoading(false);
  };

  useEffect(() => {
    getSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    if (!isEditable) return;

    // Validation
    if (settings.api_limit_enabled && settings.daily_limit <= 0) {
      toast.error("Daily limit must be greater than 0 when API limit is enabled");
      return;
    }

    setSaving(true);
    try {
      await API.put(`/users/account-setting/${id}`, {
        api_limit_enabled: settings.api_limit_enabled,
        daily_limit: parseInt(settings.daily_limit) || 0,
      });

      toast.success("Account settings updated successfully");
      
      // Refresh data after save
      setTimeout(() => {
        getSettings();
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update settings");
    }
    setSaving(false);
  };

  const handleResetUsage = async () => {
    if (!isEditable) return;

    if (!window.confirm("Are you sure you want to reset today's API usage count to 0?")) {
      return;
    }

    try {
      await API.patch(`/users/reset-api-usage/${id}`);
      toast.success("API usage count reset successfully");
      getSettings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset usage");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <ToastContainer />
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="mb-0 fw-bold text-primary">Account Settings</h4>
          <small className="text-muted">{settings.user_name}</small>
        </div>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate("/user")}
          className="d-flex align-items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Users
        </Button>
      </div>

      <Card className="p-4 shadow-sm border-0">

      <Row className="mb-3">
        <Col sm={4}>
          <Form.Label>Enable API Limit</Form.Label>
        </Col>
        <Col sm={8}>
          <Form.Check
            type="switch"
            checked={settings.api_limit_enabled}
            disabled={!isEditable}
            onChange={(e) =>
              setSettings({ ...settings, api_limit_enabled: e.target.checked })
            }
          />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={4}>
          <Form.Label>Daily Limit</Form.Label>
        </Col>
        <Col sm={8}>
          <Form.Control
            type="number"
            placeholder="0"
            disabled={!isEditable || !settings.api_limit_enabled}
            value={settings.daily_limit}
            min={0}
            onChange={(e) =>
              setSettings({ ...settings, daily_limit: parseInt(e.target.value) || 0 })
            }
          />
          <Form.Text className="text-muted">
            Set the maximum number of API calls allowed per day
          </Form.Text>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col sm={4}>
          <Form.Label>API Used Today</Form.Label>
        </Col>
        <Col sm={8}>
          <Form.Control
            type="text"
            disabled
            value={
              settings.api_limit_enabled
                ? `${settings.api_used_today} / ${settings.daily_limit}`
                : "Unlimited"
            }
          />
          {settings.api_limit_enabled && (
            <div className="mt-2">
              <div className="progress" style={{ height: "8px" }}>
                <div
                  className={`progress-bar ${
                    (settings.api_used_today / settings.daily_limit) * 100 >= 90
                      ? "bg-danger"
                      : (settings.api_used_today / settings.daily_limit) * 100 >= 70
                      ? "bg-warning"
                      : "bg-success"
                  }`}
                  role="progressbar"
                  style={{
                    width: `${Math.min(
                      (settings.api_used_today / settings.daily_limit) * 100,
                      100
                    )}%`,
                  }}
                  aria-valuenow={settings.api_used_today}
                  aria-valuemin="0"
                  aria-valuemax={settings.daily_limit}
                />
              </div>
              <Form.Text className="text-muted">
                {settings.daily_limit - settings.api_used_today > 0
                  ? `${settings.daily_limit - settings.api_used_today} calls remaining`
                  : "Limit reached"}
              </Form.Text>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mb-4">
        <Col sm={4}>
          <Form.Label>Last Used Date</Form.Label>
        </Col>
        <Col sm={8}>
          <Form.Control
            type="text"
            disabled
            value={
              settings.api_last_used_date
                ? new Date(settings.api_last_used_date).toLocaleString()
                : "-"
            }
          />
        </Col>
      </Row>

      {isEditable && (
        <div className="d-flex gap-2">
          <Button variant="primary" disabled={saving} onClick={handleSave}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
          {settings.api_used_today > 0 && (
            <Button
              variant="outline-warning"
              onClick={handleResetUsage}
              title="Reset today's API usage count"
            >
              Reset Usage Count
            </Button>
          )}
        </div>
      )}

      {!isEditable && (
        <p className="text-muted">You do not have permission to edit these settings.</p>
      )}
      </Card>
    </div>
  );
}

export default AccountSetting;