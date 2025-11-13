// AddUserModal.js
import React, { useState } from "react";
import {
  Modal,
  Button,
  Form,
  Row,
  Col,
  Spinner,
  InputGroup,
} from "react-bootstrap";
import { Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../../../api/api";

function AddUserModal({ show, onHide, roles, onUserAdded }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      user_name: "",
      email: "",
      password: "",
      confirm_password: "",
      phone_number: "",
      role_id: "",
      status: true,
      profile_image: null,
    },
    validationSchema: Yup.object({
      user_name: Yup.string()
        .min(3, "User name must be at least 3 characters long")
        .max(50, "User name cannot exceed 50 characters")
        .required("User name is required"),

      email: Yup.string()
        .email("Please provide a valid email address")
        .required("Email is required"),

      password: Yup.string()
        .min(6, "Password must be at least 6 characters long")
        .matches(
          /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])/,
          "Password must include at least one uppercase letter, one lowercase letter, and one number"
        )
        .required("Password is required"),

      confirm_password: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),

      phone_number: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),

      role_id: Yup.number()
        .typeError("Role ID must be a valid number")
        .required("Role is required"),

      status: Yup.boolean().default(true),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== "profile_image" && key !== "confirm_password") {
            formData.append(key, value);
          }
        });
        if (values.profile_image) {
          formData.append("profile_image", values.profile_image);
        }

        await API.post("/users/create-user", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("User created successfully!");
        resetForm();
        setImagePreview(null);
        onHide();
        onUserAdded(); // Refresh user list in parent
      } catch (error) {
        console.error("Error creating user:", error);
        alert("Failed to create user");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("profile_image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
  formik.resetForm();
  setImagePreview(null);
  onHide();
};


  return (
    <Modal show={show} onHide={handleCancel} centered size="lg" backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="user_name"
                  value={formik.values.user_name}
                  onChange={formik.handleChange}
                  isInvalid={
                    !!formik.errors.user_name && formik.touched.user_name
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.user_name}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Email *</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  isInvalid={!!formik.errors.email && formik.touched.email}
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.email}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Password Fields */}
            <Col md={6}>
              <Form.Group>
                <Form.Label>Password *</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    isInvalid={
                      !!formik.errors.password && formik.touched.password
                    }
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                    type="button"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.password}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Confirm Password *</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    value={formik.values.confirm_password}
                    onChange={formik.handleChange}
                    isInvalid={
                      !!formik.errors.confirm_password &&
                      formik.touched.confirm_password
                    }
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    type="button"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </Button>
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.confirm_password}
                  </Form.Control.Feedback>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Phone Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="phone_number"
                  value={formik.values.phone_number}
                  onChange={formik.handleChange}
                  isInvalid={
                    !!formik.errors.phone_number && formik.touched.phone_number
                  }
                />
                <Form.Control.Feedback type="invalid">
                  {formik.errors.phone_number}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Role *</Form.Label>
                <Form.Select
                  name="role_id"
                  value={formik.values.role_id}
                  onChange={formik.handleChange}
                  isInvalid={!!formik.errors.role_id && formik.touched.role_id}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {formik.errors.role_id}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formik.values.status}
                  onChange={formik.handleChange}
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label>Profile Image (Optional)</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="preview"
                      width="60"
                      height="60"
                      className="rounded-circle border"
                    />
                  )}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" className="me-2" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                "Save User"
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
}

export default AddUserModal;
