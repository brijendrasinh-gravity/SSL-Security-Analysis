// import React, { useState, useEffect, useMemo } from "react";
// import {
//   Modal,
//   Button,
//   Form,
//   Row,
//   Col,
//   Spinner,
//   InputGroup,
// } from "react-bootstrap";
// import { Eye, EyeOff } from "lucide-react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import API from "../../../api/api";

// function EditUserModal({ show, onHide, userId, roles, onUserUpdated }) {
//   const [originalData, setOriginalData] = useState(null);
//   const [imagePreview, setImagePreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [fetching, setFetching] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);

//   // ✅ Fetch user data when modal opens
//   useEffect(() => {
//     if (!userId || !show) return;

//     const fetchUser = async () => {
//       setFetching(true);
//       try {
//         const res = await API.get(`/users/get-user/${userId}`);
//         const user = res.data.data;

//         setOriginalData(user);

//         formik.setValues({
//           user_name: user.user_name || "",
//           email: user.email || "",
//           phone_number: user.phone_number || "",
//           role_id: user.role_id || "",
//           status: user.status,
//           password: "",
//           profile_image: null,
//         });

//         if (user.profile_image) {
//           setImagePreview(`http://localhost:7000${user.profile_image}`);
//         }
//       } catch (error) {
//         console.error("Error fetching user:", error);
//       } finally {
//         setFetching(false);
//       }
//     };

//     fetchUser();
//   }, [userId, show]);

//   // ✅ Formik Setup
//   const formik = useFormik({
//     initialValues: {
//       user_name: "",
//       email: "",
//       password: "",
//       phone_number: "",
//       role_id: "",
//       status: true,
//       profile_image: null,
//     },
//     validationSchema: Yup.object({
//       user_name: Yup.string()
//         .min(3, "User name must be at least 3 characters long")
//         .max(50, "User name cannot exceed 50 characters")
//         .optional(),

//       email: Yup.string()
//         .email("Please provide a valid email address")
//         .optional(),

//       phone_number: Yup.string()
//         .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
//         .optional(),

//       role_id: Yup.number()
//         .typeError("Role ID must be a valid number")
//         .optional(),

//       status: Yup.boolean().optional(),
//     }),

//     onSubmit: async (values, { resetForm }) => {
//       setLoading(true);
//       try {
//         const formData = new FormData();
//         Object.entries(values).forEach(([key, value]) => {
//           if (key !== "profile_image" && key !== "password") {
//             formData.append(key, value);
//           }
//         });
//         if (values.password) {
//           formData.append("password", values.password);
//         }
//         if (values.profile_image) {
//           formData.append("profile_image", values.profile_image);
//         }

//         await API.put(`/users/update-user/${userId}`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });

//         alert("✅ User updated successfully!");
//         resetForm();
//         onHide();
//         onUserUpdated(); // Refresh table
//       } catch (error) {
//         console.error("Error updating user:", error);
//         alert("Failed to update user");
//       } finally {
//         setLoading(false);
//       }
//     },
//   });

//   // ✅ Image upload + revert
//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       formik.setFieldValue("profile_image", file);
//       setImagePreview(URL.createObjectURL(file));
//     }
//   };

//   const handleRevertImage = () => {
//     if (originalData?.profile_image) {
//       setImagePreview(`http://localhost:7000${originalData.profile_image}`);
//       formik.setFieldValue("profile_image", null);
//     } else {
//       setImagePreview(null);
//     }
//   };

//   //  Detect changed fields
//   const isChanged = useMemo(() => {
//     if (!originalData) return false;
//     const { password, profile_image, ...current } = formik.values;
//     const { password: _, profile_image: __, ...original } = originalData;
//     return (
//       JSON.stringify(current) !== JSON.stringify(original) ||
//       !!formik.values.profile_image
//     );
//   }, [formik.values, originalData]);

//   const getFieldHighlight = (field) => {
//     return formik.values[field] !== originalData?.[field]
//       ? { backgroundColor: "#f8f9fa" }
//       : {};
//   };

//   //  Reset modal cleanly on close
//   const handleClose = () => {
//     formik.resetForm();
//     setImagePreview(
//       originalData?.profile_image
//         ? `http://localhost:7000${originalData.profile_image}`
//         : null
//     );
//     onHide();
//   };

//   return (
//     <Modal show={show} onHide={handleClose} centered size="lg">
//       <Modal.Header closeButton>
//         <Modal.Title>Edit User</Modal.Title>
//       </Modal.Header>

//       <Modal.Body>
//         {fetching ? (
//           <div className="text-center p-4">
//             <Spinner animation="border" variant="primary" />
//           </div>
//         ) : (
//           <Form onSubmit={formik.handleSubmit}>
//             <Row className="g-3">
//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Name *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="user_name"
//                     value={formik.values.user_name}
//                     onChange={formik.handleChange}
//                     style={getFieldHighlight("user_name")}
//                     isInvalid={
//                       !!formik.errors.user_name && formik.touched.user_name
//                     }
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {formik.errors.user_name}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Email</Form.Label>
//                   <Form.Control
//                     type="email"
//                     value={formik.values.email}
//                     readOnly
//                   />
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>New Password (Optional)</Form.Label>
//                   <InputGroup>
//                     <Form.Control
//                       type={showPassword ? "text" : "password"}
//                       name="password"
//                       value={formik.values.password}
//                       onChange={formik.handleChange}
//                     />
//                     <Button
//                       variant="outline-secondary"
//                       onClick={() => setShowPassword(!showPassword)}
//                       type="button"
//                     >
//                       {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
//                     </Button>
//                   </InputGroup>
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Phone Number *</Form.Label>
//                   <Form.Control
//                     type="text"
//                     name="phone_number"
//                     value={formik.values.phone_number}
//                     onChange={formik.handleChange}
//                     style={getFieldHighlight("phone_number")}
//                     isInvalid={
//                       !!formik.errors.phone_number &&
//                       formik.touched.phone_number
//                     }
//                   />
//                   <Form.Control.Feedback type="invalid">
//                     {formik.errors.phone_number}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Role *</Form.Label>
//                   <Form.Select
//                     name="role_id"
//                     value={formik.values.role_id}
//                     onChange={formik.handleChange}
//                     style={getFieldHighlight("role_id")}
//                     isInvalid={
//                       !!formik.errors.role_id && formik.touched.role_id
//                     }
//                   >
//                     <option value="">Select Role</option>
//                     {roles.map((role) => (
//                       <option key={role.id} value={role.id}>
//                         {role.name}
//                       </option>
//                     ))}
//                   </Form.Select>
//                   <Form.Control.Feedback type="invalid">
//                     {formik.errors.role_id}
//                   </Form.Control.Feedback>
//                 </Form.Group>
//               </Col>

//               <Col md={6}>
//                 <Form.Group>
//                   <Form.Label>Status</Form.Label>
//                   <Form.Select
//                     name="status"
//                     value={formik.values.status}
//                     onChange={formik.handleChange}
//                     style={getFieldHighlight("status")}
//                   >
//                     <option value={true}>Active</option>
//                     <option value={false}>Inactive</option>
//                   </Form.Select>
//                 </Form.Group>
//               </Col>

//               <Col md={12}>
//                 <Form.Group>
//                   <Form.Label>Profile Image</Form.Label>
//                   <div className="d-flex align-items-center gap-3">
//                     <Form.Control
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                     />
//                     {imagePreview && (
//                       <div className="text-center">
//                         <img
//                           src={imagePreview}
//                           alt="preview"
//                           width="70"
//                           height="70"
//                           className="rounded-circle border"
//                         />
//                         <div>
//                           <Button
//                             variant="link"
//                             size="sm"
//                             className="text-danger p-0 mt-1"
//                             onClick={handleRevertImage}
//                           >
//                             Revert
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </Form.Group>
//               </Col>
//             </Row>

//             <div className="d-flex justify-content-end mt-4">
//               <Button
//                 variant="secondary"
//                 className="me-2"
//                 onClick={handleClose}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 variant="primary"
//                 disabled={!isChanged || loading}
//               >
//                 {loading ? (
//                   <>
//                     <Spinner animation="border" size="sm" /> Saving...
//                   </>
//                 ) : (
//                   "Save Changes"
//                 )}
//               </Button>
//             </div>
//           </Form>
//         )}
//       </Modal.Body>
//     </Modal>
//   );
// }

// export default EditUserModal;
import React, { useState, useEffect, useMemo } from "react";
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
import { toast } from "react-toastify";
import API from "../../../api/api";

function EditUserModal({ show, onHide, userId, roles, onUserUpdated }) {
  const [originalData, setOriginalData] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  //  Fetch user data when modal opens
  useEffect(() => {
    if (!userId || !show) return;

    const fetchUser = async () => {
      setFetching(true);
      try {
        const res = await API.get(`/users/get-user/${userId}`);
        const user = res.data.data;

        setOriginalData(user);
        formik.setValues({
          user_name: user.user_name || "",
          email: user.email || "",
          phone_number: user.phone_number || "",
          role_id: user.role_id || "",
          status: user.status,
          password: "",
          profile_image: null,
        });

        if (user.profile_image) {
          setImagePreview(`http://localhost:7000${user.profile_image}`);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setFetching(false);
      }
    };

    fetchUser();
  }, [userId, show]);

  //  Formik Setup
  const formik = useFormik({
    initialValues: {
      user_name: "",
      email: "",
      password: "",
      phone_number: "",
      role_id: "",
      status: true,
      profile_image: null,
    },
    validationSchema: Yup.object({
      user_name: Yup.string()
        .min(3, "User name must be at least 3 characters long")
        .max(50, "User name cannot exceed 50 characters")
        .optional(),
      email: Yup.string().email("Please provide a valid email address").optional(),
      phone_number: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .optional(),
      role_id: Yup.number()
        .typeError("Role ID must be a valid number")
        .optional(),
      status: Yup.boolean().optional(),
    }),

    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const formData = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (key !== "profile_image" && key !== "password") {
            formData.append(key, value);
          }
        });
        if (values.password) {
          formData.append("password", values.password);
        }
        if (values.profile_image) {
          formData.append("profile_image", values.profile_image);
        }

        await API.put(`/users/update-user/${userId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success("User updated successfully!");
        resetForm();
        onHide();
        onUserUpdated(); // Refresh table
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error("Failed to update user");
      } finally {
        setLoading(false);
      }
    },
  });

  // ✅ Image upload + revert
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      formik.setFieldValue("profile_image", file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRevertImage = () => {
    if (originalData?.profile_image) {
      setImagePreview(`http://localhost:7000${originalData.profile_image}`);
      formik.setFieldValue("profile_image", null);
    } else {
      setImagePreview(null);
    }
  };

  // ✅ Detect changed fields
  const isChanged = useMemo(() => {
    if (!originalData) return false;
    const { password, profile_image, ...current } = formik.values;
    const { password: _, profile_image: __, ...original } = originalData;
    return (
      JSON.stringify(current) !== JSON.stringify(original) ||
      !!formik.values.profile_image
    );
  }, [formik.values, originalData]);

  const getFieldHighlight = (field) => {
    return formik.values[field] !== originalData?.[field]
      ? { backgroundColor: "#f8f9fa" }
      : {};
  };

  // ✅ Reset modal on Cancel
  const handleClose = () => {
    formik.resetForm();
    setImagePreview(
      originalData?.profile_image
        ? `http://localhost:7000${originalData.profile_image}`
        : null
    );
    onHide();
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      size="lg"
      backdrop="static"  // prevent closing by clicking outside
      keyboard={false}   // prevent ESC close
    >
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {fetching ? (
          <div className="text-center p-4">
            <Spinner animation="border" variant="primary" />
          </div>
        ) : (
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
                    style={getFieldHighlight("user_name")}
                    isInvalid={!!formik.errors.user_name && formik.touched.user_name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.user_name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" value={formik.values.email} readOnly />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>New Password (Optional)</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                      type="button"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
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
                    style={getFieldHighlight("phone_number")}
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
                    style={getFieldHighlight("role_id")}
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
                    style={getFieldHighlight("status")}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={12}>
                <Form.Group>
                  <Form.Label>Profile Image</Form.Label>
                  <div className="d-flex align-items-center gap-3">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    {imagePreview && (
                      <div className="text-center">
                        <img
                          src={imagePreview}
                          alt="preview"
                          width="70"
                          height="70"
                          className="rounded-circle border"
                        />
                        <div>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-danger p-0 mt-1"
                            onClick={handleRevertImage}
                          >
                            Revert
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" className="me-2" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={!isChanged || loading}>
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" /> Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default EditUserModal;
