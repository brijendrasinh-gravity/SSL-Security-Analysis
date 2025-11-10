import React, { useEffect, useState } from "react";
import { Form, Button, Card, Spinner, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { ArrowLeft, Save, ShieldCheck } from "lucide-react";

function AddRole() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [roleData, setRoleData] = useState({
    name: "",
    is_Admin: false,
    permissions: [],
  });

  // Fetch all modules
  const fetchModules = async () => {
    try {
      const res = await API.get("/roles/get-module");
      const modData = res.data.data || [];
      const permissionsArray = modData.map((mod) => ({
        module_name: mod.module_name,
        canList: false,
        canCreate: false,
        canModify: false,
        canDelete: false,
      }));
      setModules(modData);
      setRoleData((prev) => ({ ...prev, permissions: permissionsArray }));
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  // Handle checkbox toggle
  const handlePermissionChange = (moduleIndex, key, value) => {
    const updated = [...roleData.permissions];
    updated[moduleIndex][key] = value;

    // If "All" is clicked, toggle all permissions
    if (key === "all") {
      updated[moduleIndex].canList = value;
      updated[moduleIndex].canCreate = value;
      updated[moduleIndex].canModify = value;
      updated[moduleIndex].canDelete = value;
    }

    setRoleData({ ...roleData, permissions: updated });
  };

  const isAllChecked = (perm) => {
    return perm.canList && perm.canCreate && perm.canModify && perm.canDelete;
  };

  // Submit role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: roleData.name,
        is_Admin: roleData.is_Admin,
        permissions: roleData.permissions,
      };

      await API.post("/roles/create-role", payload);
      alert("Role created successfully!");
      navigate("/role");
    } catch (error) {
      console.error("Error creating role:", error);
      alert("Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <ShieldCheck size={24} className="text-primary" />
          <div>
            <h4 className="mb-0 fw-bold text-primary">Add New Role</h4>
            <small className="text-muted">Assign permissions and admin rights</small>
          </div>
        </div>
        <Button
          variant="outline-secondary"
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px" }}
          onClick={() => navigate("/role")}
          title="Back to Role Manager"
        >
          <ArrowLeft size={18} />
        </Button>
      </div>

      {/* Role Form */}
      <Card className="p-4 shadow-sm border-0">
        <Form onSubmit={handleSubmit}>
          {/* Name & Admin Toggle */}
          <div className="row mb-4">
            <div className="col-md-8">
              <Form.Group>
                <Form.Label className="fw-semibold">Role Name *</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter role name"
                  value={roleData.name}
                  onChange={(e) =>
                    setRoleData({ ...roleData, name: e.target.value })
                  }
                  required
                />
              </Form.Group>
            </div>

            <div className="col-md-4 d-flex align-items-center justify-content-end">
              <Form.Check
                type="switch"
                id="isAdmin"
                label="Is Admin Role?"
                checked={roleData.is_Admin}
                onChange={(e) =>
                  setRoleData({ ...roleData, is_Admin: e.target.checked })
                }
              />
            </div>
          </div>

          {/* Permissions Table */}
          <div className="mt-3">
            <Table bordered hover responsive className="align-middle">
              <thead className="table-light text-center text-dark">
                <tr>
                  <th style={{ width: "35%" }}>Module & Access</th>
                  <th>All</th>
                  <th>List</th>
                  <th>Create</th>
                  <th>Modify</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {modules.length > 0 ? (
                  modules.map((mod, index) => {
                    const perm = roleData.permissions[index];
                    return (
                      <tr key={index} className="text-center">
                        <td className="text-start fw-semibold">
                          {mod.title || mod.module_name}
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={isAllChecked(perm)}
                            onChange={(e) =>
                              handlePermissionChange(index, "all", e.target.checked)
                            }
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={perm.canList}
                            onChange={(e) =>
                              handlePermissionChange(index, "canList", e.target.checked)
                            }
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={perm.canCreate}
                            onChange={(e) =>
                              handlePermissionChange(index, "canCreate", e.target.checked)
                            }
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={perm.canModify}
                            onChange={(e) =>
                              handlePermissionChange(index, "canModify", e.target.checked)
                            }
                          />
                        </td>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={perm.canDelete}
                            onChange={(e) =>
                              handlePermissionChange(index, "canDelete", e.target.checked)
                            }
                          />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">
                      No modules found
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="secondary"
              className="me-2 d-flex align-items-center gap-2"
              onClick={() => navigate("/roles")}
            >
              <ArrowLeft size={16} /> Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="d-flex align-items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> Save Role
                </>
              )}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default AddRole;