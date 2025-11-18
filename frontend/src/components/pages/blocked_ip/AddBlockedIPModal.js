import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner, Alert } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../../../api/api";
import { toast } from "react-toastify";
import { MapPin } from "lucide-react";
import { detect } from "detect-browser";

function AddBlockedIPModal({ show, onHide, onIPAdded }) {
  const [loading, setLoading] = useState(false);
  const [fetchingIP, setFetchingIP] = useState(false);
  const [currentIPInfo, setCurrentIPInfo] = useState(null);
  const [browserInfo, setBrowserInfo] = useState("");

  const formik = useFormik({
    initialValues: {
      ip_address: "",
      browser_info: "",
      blocked_type: "Manual",
    },
    validationSchema: Yup.object({
      ip_address: Yup.string()
        .matches(
          /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
          "Please enter a valid IP address"
        )
        .required("IP address is required"),
      browser_info: Yup.string(),
      blocked_type: Yup.string()
        .oneOf(["Login", "Manual"], "Invalid blocked type")
        .required("Blocked type is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        // If browser_info is empty, use detected browser name
        const payload = {
          ...values,
          browser_info: values.browser_info.trim() || browserInfo || "Unknown"
        };
        
        console.log("Blocked_ip:", payload);
        
        await API.post("/blocked-ips/create-blockIP", payload);
        toast.success("IP blocked successfully!");
        resetForm();
        onHide();
        onIPAdded();
      } catch (error) {
        console.error("Error blocking IP:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to block IP";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  // Detect browser name on component mount
  useEffect(() => {
    const browser = detect();
    if (browser) {
      // Get only the browser name (chrome, firefox, safari, edge, etc.)
      let browserName = browser.name.toLowerCase();
      
      // Map common browser names to proper capitalized names
      const browserMap = {
        'chrome': 'Chrome',
        'firefox': 'Firefox',
        'safari': 'Safari',
        'edge': 'Edge',
        'edge-chromium': 'Edge',
        'opera': 'Opera',
        'ie': 'Internet Explorer',
        'ios': 'Safari',
        'android': 'Chrome'
      };
      
      browserName = browserMap[browserName] || browserName.charAt(0).toUpperCase() + browserName.slice(1);
      setBrowserInfo(browserName);
      // console.log("Detected Browser Name Only:", browserName);
    }
  }, []);

  const fetchCurrentIP = async () => {
    setFetchingIP(true);
    try {
      const res = await API.get("/blocked-ips/current-ip");
      if (res.data.success) {
        const ipInfo = res.data.data;
        setCurrentIPInfo(ipInfo);
        formik.setFieldValue("ip_address", ipInfo.ip);
        
        // DO NOT auto-fill browser info here - let it be filled on submit
        console.log("Current IP Info:", ipInfo);
        console.log("Browser info will be:", browserInfo);
        toast.info(`Your IP: ${ipInfo.ip} (${ipInfo.city}, ${ipInfo.country})`);
      }
    } catch (error) {
      console.error("Error fetching current IP:", error);
      toast.error("Failed to fetch current IP");
    } finally {
      setFetchingIP(false);
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    setCurrentIPInfo(null);
    onHide();
  };

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      formik.resetForm();
      setCurrentIPInfo(null);
    }
  }, [show]);

  return (
    <Modal
      show={show}
      onHide={handleCancel}
      centered
      size="lg"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Block IP Address</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Form.Label className="mb-0">IP Address *</Form.Label>
                  {/* <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={fetchCurrentIP}
                    disabled={fetchingIP}
                  >
                    {fetchingIP ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-1" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <MapPin size={16} className="me-1" />
                        Use My IP
                      </
                    )}
                  </Button> */}
                </div>
                <Form.Control
                  type="text"
                  name="ip_address"
                  placeholder="e.g., 192.168.1.100"
                  value={formik.values.ip_address}
                  onChange={formik.handleChange}
                  isInvalid={
                    !!formik.errors.ip_address && formik.touched.ip_address
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.ip_address}
                </Form.Control.Feedback>
                {currentIPInfo && (
                  <Alert variant="info" className="mt-2 mb-0 py-2">
                    <small>
                      <strong>Location:</strong> {currentIPInfo.city}, {currentIPInfo.region}, {currentIPInfo.country} | 
                      <strong> ISP:</strong> {currentIPInfo.isp}
                    </small>
                  </Alert>
                )}
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Blocked Type *</Form.Label>
                <Form.Select
                  name="blocked_type"
                  value={formik.values.blocked_type}
                  onChange={formik.handleChange}
                  isInvalid={
                    !!formik.errors.blocked_type && formik.touched.blocked_type
                  }
                >
                  <option value="Manual">Manual</option>
                  <option value="Login">Login</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.blocked_type}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Browser Info (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="browser_info"
                  placeholder="Leave empty for auto-detect"
                  value={formik.values.browser_info}
                  onChange={(e) => {
                    console.log("Browser info changed to:", e.target.value);
                    formik.handleChange(e);
                  }}
                />
                {/* <Form.Text className="text-muted">
                  Leave empty to auto-detect. Detected: <strong>{browserInfo || "Unknown"}</strong>
                </Form.Text> */}
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" className="me-2" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Blocking...
                </>
              ) : (
                "Block IP"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddBlockedIPModal;
