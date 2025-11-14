import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import API from "../../../api/api";
import { Pencil, Trash2, PlusCircle } from "lucide-react";
import { usePermission } from "../../../hooks/usePermission";

function RoleManager() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  const fetchRoles = async () => {
    try {
      const res = await API.get("/roles/get-role");
      setRoles(res.data.data || []);
    } catch (err) {
      console.error("Error fetching roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      try {
        await API.delete(`/roles/delete-role/${id}`);
        fetchRoles(); //This is to Refresh list after every delete 
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const columns = [
    {
      name: "Role",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Is Admin",
      selector: (row) => (row.is_Admin ? "YES" : "NO"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="d-flex gap-2">
          {hasPermission('role_permission', 'canModify') && (
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center justify-content-center"
              onClick={() => navigate(`/role/edit/${row.id}`)}
              title="Edit Role"
            >
              <Pencil size={16} />
            </Button>
          )}
          {hasPermission('role_permission', 'canDelete') && (
            <Button
              variant="outline-danger"
              size="sm"
              className="d-flex align-items-center justify-content-center"
              onClick={() => handleDelete(row.id)}
              title="Delete Role"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ),
      omit: !hasPermission('role_permission', 'canModify') && !hasPermission('role_permission', 'canDelete'),
    },
  ];

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="mb-0 fw-bold text-primary">Role Manager</h4>
          <small className="text-muted">View and manage all available roles</small>
        </div>
        {hasPermission('role_permission', 'canCreate') && (
          <Button
            variant="primary"
            className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
            style={{ width: "45px", height: "45px" }}
            onClick={() => navigate("/role/add")}
            title="Add New Role"
          >
            <PlusCircle size={22} color="white" />
          </Button>
        )}
      </div>

      {/* Table Section */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          <DataTable
            columns={columns}
            data={roles}
            progressPending={loading}
            pagination
            highlightOnHover
            striped
            responsive
            noDataComponent="No roles found"
          />
        </div>
      </div>
    </div>
  );
}

export default RoleManager;
