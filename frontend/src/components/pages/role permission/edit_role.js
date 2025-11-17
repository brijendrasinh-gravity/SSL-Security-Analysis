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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [modulesRes, roleRes] = await Promise.all([
          API.get("/roles/get-module"),
          API.get(`/roles/get-role/${id}`),
        ]);

        const moduleList = modulesRes.data.data || [];
        const { role, modulePermissions } = roleRes.data.data || {};

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

  // All checkbox logic
  const handlePermissionChange = (moduleIndex, key, value) => {
    const updated = [...roleData.permissions];
    
    // Ensure the permission object exists
    if (!updated[moduleIndex]) {
      updated[moduleIndex] = {
        module_name: modules[moduleIndex]?.module_name,
        canList: false,
        canCreate: false,
        canModify: false,
        canDelete: false,
      };
    }
    
    updated[moduleIndex][key] = value;

    if (key === "all") {
      updated[moduleIndex].canList = value;
      updated[moduleIndex].canCreate = value;
      updated[moduleIndex].canModify = value;
      updated[moduleIndex].canDelete = value;
    }

    setRoleData({ ...roleData, permissions: updated });
  };

  const isAllChecked = (perm) => {
    if (!perm) return false;
    return perm.canList && perm.canCreate && perm.canModify && perm.canDelete;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: roleData.name,
        is_Admin: roleData.is_Admin,
        permissions: roleData.permissions,
      };

      await API.put(`/roles/update-role/${id}`, payload);
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
                  
                  // Extract available permissions from permissions_list
                  const available = mod.permissions_list?.map((p) => {
                    const parts = p.name.split("-");
                    return parts[parts.length - 1]; // Get last part (list, create, modify, delete)
                  }) || [];

                  // console.log(`Module: ${mod.module_name}, Available:`, available);

                  return (
                    <tr key={index} className="text-center">
                      <td className="text-start fw-semibold">
                        {mod.title || mod.module_name}
                      </td>

                      <td>
                        {available.length > 0 ? (
                          <Form.Check
                            type="checkbox"
                            checked={isAllChecked(perm)}
                            onChange={(e) =>
                              handlePermissionChange(
                                index,
                                "all",
                                e.target.checked
                              )
                            }
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>
                        {available.includes("list") ? (
                          <Form.Check
                            type="checkbox"
                            checked={perm?.canList || false}
                            onChange={(e) =>
                              handlePermissionChange(
                                index,
                                "canList",
                                e.target.checked
                              )
                            }
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>
                        {available.includes("create") ? (
                          <Form.Check
                            type="checkbox"
                            checked={perm?.canCreate || false}
                            onChange={(e) =>
                              handlePermissionChange(
                                index,
                                "canCreate",
                                e.target.checked
                              )
                            }
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>
                        {available.includes("modify") ? (
                          <Form.Check
                            type="checkbox"
                            checked={perm?.canModify || false}
                            onChange={(e) =>
                              handlePermissionChange(
                                index,
                                "canModify",
                                e.target.checked
                              )
                            }
                          />
                        ) : (
                          <span>-</span>
                        )}
                      </td>

                      <td>
                        {available.includes("delete") ? (
                          <Form.Check
                            type="checkbox"
                            checked={perm?.canDelete || false}
                            onChange={(e) =>
                              handlePermissionChange(
                                index,
                                "canDelete",
                                e.target.checked
                              )
                            }
                          />
                        ) : (
                          <span>-</span>
                        )}
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
                  <Spinner animation="grow" size="sm" /> Saving...
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