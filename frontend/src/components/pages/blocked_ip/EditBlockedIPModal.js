import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../../../api/api";
import { toast } from "react-toastify";

function EditBlockedIPModal({ show, onHide, ipId, onIPUpdated }) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

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
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await API.put(`/blocked-ips/updateblock/${ipId}`, values);
        toast.success("IP updated successfully!");
        onHide();
        onIPUpdated();
      } catch (error) {
        console.error("Error updating IP:", error);
        const errorMsg =
          error.response?.data?.message || "Failed to update IP";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (show && ipId) {
      fetchIPData();
    }
  }, [show, ipId]);

  const fetchIPData = async () => {
    setFetching(true);
    try {
      const res = await API.get(`/blocked-ips/getblockIP/${ipId}`);
      if (res.data.success) {
        const data = res.data.data;
        formik.setValues({
          ip_address: data.ip_address || "",
          browser_info: data.browser_info || "",
          blocked_type: data.blocked_type || "Manual",
        });
      }
    } catch (error) {
      console.error("Error fetching IP data:", error);
      toast.error("Failed to load IP data");
    } finally {
      setFetching(false);
    }
  };

  const handleCancel = () => {
    formik.resetForm();
    onHide();
  };

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
        <Modal.Title>Edit Blocked IP</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {fetching ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Loading IP data...</p>
          </div>
        ) : (
          <Form onSubmit={formik.handleSubmit}>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>IP Address *</Form.Label>
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
                      !!formik.errors.blocked_type &&
                      formik.touched.blocked_type
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
                  <Form.Label>Browser/System Info</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="browser_info"
                    placeholder="e.g., Chrome 120, Windows 10"
                    value={formik.values.browser_info}
                    onChange={formik.handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                className="me-2"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Updating...
                  </>
                ) : (
                  "Update IP"
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default EditBlockedIPModal;
