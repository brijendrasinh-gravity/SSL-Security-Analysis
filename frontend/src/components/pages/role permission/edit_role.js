import React, { useEffect, useState } from "react";
import { Form, Button, Card, Spinner, Table } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../../api/api";

function EditRole() {
    const { id } = useParams();
    const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [modules, setModules] = useState([]);
  const [roleData, setRoleData] = useState({
    name: "",
    is_Admin: false,
    permissions: [],
  });

  // Fetch role details + modules
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesRes, roleRes] = await Promise.all([
          API.get("roles/get-module"),
          API.get(`/roles/get-role/${id}`),
        ]);

        const moduleList = modulesRes.data.data || [];
        const { role, modulePermissions } = roleRes.data.data || {};

        // Merge backend permissions with module list
        const mergedPermissions = moduleList.map((mod) => {
          const existing = modulePermissions?.find(
            (p) => p.module_name.toLowerCase() === mod.module_name.toLowerCase()
          );
          return {
            module_name: mod.module_name,
            canList: existing ? !!existing.canList : false,
            canCreate: existing ? !!existing.canCreate : false,
            canModify: existing ? !!existing.canModify : false,
            canDelete: existing ? !!existing.canDelete : false,
          };
        });

        setModules(moduleList);
        setRoleData({
          name: role?.name || "",
          is_Admin: role?.is_Admin || false,
          permissions: mergedPermissions,
        });
      } catch (err) {
        console.error("Error loading role data:", err);
      }
    };

    fetchData();
  }, [id]);

  // Handle checkbox toggle
  const handlePermissionChange = (moduleIndex, key, value) => {
    const updated = [...roleData.permissions];
    updated[moduleIndex][key] = value;

    if (key === "all") {
      updated[moduleIndex].canList = value;
      updated[moduleIndex].canCreate = value;
      updated[moduleIndex].canModify = value;
      updated[moduleIndex].canDelete = value;
    }

    setRoleData({ ...roleData, permissions: updated });
  };

  const isAllChecked = (perm) =>
    perm.canList && perm.canCreate && perm.canModify && perm.canDelete;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: roleData.name,
        is_Admin: roleData.is_Admin,
        permissions: roleData.permissions,
      };

      await API.put(`/roles/update/${id}`, payload);
      alert("Role updated successfully!");
      navigate("/role");
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <Card className="p-4 shadow-sm">
        <h4 className="fw-bold mb-4">Edit Role</h4>

        <Form onSubmit={handleSubmit}>
          {/* Role Name + Is Admin Switch */}
          <div className="row mb-4">
            <div className="col-md-8">
              <Form.Group>
                <Form.Label>Name *</Form.Label>
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
          <Table bordered hover responsive className="align-middle">
            <thead className="table-dark text-center">
              <tr>
                <th style={{ width: "25%" }}>Module & Access</th>
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
                            handlePermissionChange(
                              index,
                              "canList",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={perm.canCreate}
                          onChange={(e) =>
                            handlePermissionChange(
                              index,
                              "canCreate",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={perm.canModify}
                          onChange={(e) =>
                            handlePermissionChange(
                              index,
                              "canModify",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={perm.canDelete}
                          onChange={(e) =>
                            handlePermissionChange(
                              index,
                              "canDelete",
                              e.target.checked
                            )
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

          {/* Buttons */}
          <div className="d-flex justify-content-end mt-3">
            <Button
              variant="secondary"
              className="me-2"
              onClick={() => navigate("/role")}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
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
      </Card>
    </div>
  );
}

export default EditRole;