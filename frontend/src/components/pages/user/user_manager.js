import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Row,
  Col,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Collapse,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../../api/api";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import ViewUserModal from "./viewUserModal";
import { usePermission } from "../../../hooks/usePermission";

function UserManager() {
  const { hasPermission } = usePermission();
  // const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ name: "", email: "", status: "" });
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUserId, setViewUserId] = useState(null);

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const res = await API.get("/roles/get-role");
      if (res.data.success) setRoles(res.data.data);
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  // Fetch users (with filters)
  const fetchUsers = async (pageNumber = page, pageLimit = perPage) => {
    setLoading(true);
    try {
      const { name, email, status } = filters;
      const res = await API.get("/users/get-users", {
        params: { page: pageNumber, limit: pageLimit, name, email, status },
      });
      if (res.data.success) {
        setUsers(res.data.data.rows || res.data.data);
        setTotalRows(res.data.data.count || res.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, perPage]);

  // Toggle user status
  const handleToggleStatus = async (id) => {
    try {
      const user = users.find((u) => u.id === id);
      const prevStatus = user.status ? "Active" : "Inactive";
      const newStatus = !user.status ? "Active" : "Inactive";

      // Optimistic UI update
      const updatedUsers = users.map((u) =>
        u.id === id ? { ...u, status: !u.status } : u
      );
      setUsers(updatedUsers);

      // Backend call
      await API.patch(`/users/toggle-status/${id}`);
      toast.info(`Status updated: ${prevStatus} → ${newStatus}`, {
        icon: "🔄",
        theme: "colored",
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Error toggling status:", error);
      toast.error("Failed to update user status!", {
        position: "top-right",
        autoClose: 3000,
      });
      fetchUsers();
    }
  };

  // Delete user
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await API.delete(`/users/delete-user/${id}`);
        fetchUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
      }
    }
  };

  // Table Columns
  const columns = [
    {
      name: "Name",
      selector: (row) => row.user_name || "-",
      sortable: true,
      cell: (row) => (
        <span
          className="text-primary fw-semibold"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setViewUserId(row.id);
            setShowViewModal(true);
          }}
        >
          {row.user_name}
        </span>
      ),
    },
    { name: "Role", selector: (row) => row.role?.name || "-", sortable: true },
    { name: "Email", selector: (row) => row.email || "-" },
    { name: "Phone", selector: (row) => row.phone_number || "-" },
    {
      name: "Status",
      cell: (row) => (
        <div
          onClick={hasPermission('user', 'canModify') ? () => handleToggleStatus(row.id) : undefined}
          style={{ cursor: hasPermission('user', 'canModify') ? "pointer" : "default" }}
        >
          {row.status ? (
            <span className="badge bg-success d-flex align-items-center gap-1" style={{transition:"none"}}>
              <ToggleRight size={16} /> Active
            </span>
          ) : (
            <span className="badge bg-secondary d-flex align-items-center gap-1" style={{transition:"none"}}>
              <ToggleLeft size={16} /> Inactive
            </span>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-3 justify-content-center">
          {hasPermission('user', 'canModify') && (
            <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
              <Button
                variant="link"
                className="p-0 text-primary"
                onClick={() => {
                  setSelectedUserId(row.id);
                  setShowEditModal(true);
                }}
              >
                <Edit2 size={18} />
              </Button>
            </OverlayTrigger>
          )}

          {hasPermission('user', 'canDelete') && (
            <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
              <Button
                variant="link"
                className="p-0 text-danger"
                onClick={() => handleDelete(row.id)}
              >
                <Trash2 size={18} />
              </Button>
            </OverlayTrigger>
          )}
        </div>
      ),
      omit: !hasPermission('user', 'canModify') && !hasPermission('user', 'canDelete'),
    },
  ];

  return (
    <div className="container mt-4">
      <ToastContainer />
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-primary">User Manager</h4>
          <small className="text-muted">
            Manage all registered users and their roles
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          {hasPermission('user', 'canList') && (
            <Button
              variant={showFilter ? "primary" : "outline-secondary"}
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
              onClick={() => setShowFilter(!showFilter)}
              title="Filter"
            >
              <Filter size={18} />
            </Button>
          )}

          {hasPermission('user', 'canCreate') && (
            <Button
              variant="primary"
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
              onClick={() => setShowModal(true)}
              title="Add User"
            >
              <Plus size={18} />
            </Button>
          )}
        </div>
      </div>

      {/* Filter Section */}
      <Collapse in={showFilter}>
        <div>
          <Card className="p-3 mb-3 shadow-sm border-0 bg-light">
            <Form>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Search by Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={filters.name}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Search by Email</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter email"
                      value={filters.email}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filter by Status</Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          status: e.target.value,
                        }))
                      }
                    >
                      <option value="">All</option>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    setFilters({ name: "", email: "", status: "" });
                    fetchUsers(1, perPage);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setPage(1);
                    fetchUsers(1, perPage);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Collapse>

      {/* Table */}
      <Card className="p-3 shadow-sm border-0">
        <DataTable
          columns={columns}
          data={users}
          progressPending={loading}
          progressComponent={
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
            </div>
          }
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={page}
          onChangePage={(page) => setPage(page)}
          onChangeRowsPerPage={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1);
          }}
          highlightOnHover
          responsive
          striped
        />
      </Card>

      {/* Add, Edit, View Modals */}
      <AddUserModal
        show={showModal}
        onHide={() => setShowModal(false)}
        roles={roles}
        onUserAdded={fetchUsers}
      />
      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        userId={selectedUserId}
        roles={roles}
        onUserUpdated={fetchUsers}
      />
      <ViewUserModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        userId={viewUserId}
      />
    </div>
  );
}

export default UserManager;
