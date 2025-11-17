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
  Badge,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import {
  Plus,
  Filter,
  Edit2,
  Trash2,
  Shield,
  ShieldOff,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import API from "../../../api/api";
import AddBlockedIPModal from "./AddBlockedIPModal";
import EditBlockedIPModal from "./EditBlockedIPModal";
import ViewBlockedIPModal from "./ViewBlockedIPModal";
import { usePermission } from "../../../hooks/usePermission";

function BlockedIPManager() {
  const { hasPermission } = usePermission();

  const [blockedIPs, setBlockedIPs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ ip: "", type: "", status: "" });
  const [showFilter, setShowFilter] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIPId, setSelectedIPId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewIPId, setViewIPId] = useState(null);

  const fetchBlockedIPs = async (pageNumber = page, pageLimit = perPage) => {
    setLoading(true);
    try {
      const { ip, type, status } = filters;
      const res = await API.get("/blocked-ips/getAllblockIP", {
        params: { page: pageNumber, limit: pageLimit, ip, type, status },
      });
      if (res.data.success) {
        setBlockedIPs(res.data.data.rows || res.data.data);
        setTotalRows(res.data.data.count || res.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching blocked IPs:", error);
      toast.error("Failed to fetch blocked IPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedIPs();
  }, [page, perPage]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to unblock this IP?")) {
      try {
        await API.delete(`/blocked-ips/deleteblock/${id}`);
        toast.success("IP unblocked successfully");
        fetchBlockedIPs();
      } catch (error) {
        console.error("Error deleting blocked IP:", error);
        toast.error("Failed to unblock IP");
      }
    }
  };

  const columns = [
    {
      name: "IP Address",
      selector: (row) => row.ip_address || "-",
      sortable: true,
      cell: (row) => (
        <span
          className="text-primary fw-semibold"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setViewIPId(row.id);
            setShowViewModal(true);
          }}
        >
          {row.ip_address}
        </span>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.blocked_type || "-",
      sortable: true,
      cell: (row) => (
        <Badge bg={row.blocked_type === "Login" ? "warning" : "info"}>
          {row.blocked_type}
        </Badge>
      ),
    },
    {
      name: "Login Access",
      cell: (row) => (
        <div>
          {row.login_access ? (
            <span className="badge bg-success d-flex align-items-center gap-1">
              <Shield size={16} /> Allowed
            </span>
          ) : (
            <span className="badge bg-danger d-flex align-items-center gap-1">
              <ShieldOff size={16} /> Blocked
            </span>
          )}
        </div>
      ),
    },
    {
      name: "Browser Info",
      selector: (row) => row.browser_info || "-",
      cell: (row) => (
        <span className="text-truncate" style={{ maxWidth: "200px" }}>
          {row.browser_info || "-"}
        </span>
      ),
    },
    {
      name: "Created At",
      selector: (row) => new Date(row.createdAt).toLocaleDateString(),
      sortable: true,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-3 justify-content-center">
          {hasPermission("blocked_ip", "canModify") && (
            <OverlayTrigger placement="top" overlay={<Tooltip>Edit</Tooltip>}>
              <Button
                variant="link"
                className="p-0 text-primary"
                onClick={() => {
                  setSelectedIPId(row.id);
                  setShowEditModal(true);
                }}
              >
                <Edit2 size={18} />
              </Button>
            </OverlayTrigger>
          )}

          {hasPermission("blocked_ip", "canDelete") && (
            <OverlayTrigger
              placement="top"
              overlay={<Tooltip>Unblock</Tooltip>}
            >
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
      omit:
        !hasPermission("blocked_ip", "canModify") &&
        !hasPermission("blocked_ip", "canDelete"),
    },
  ];

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-primary">Blocked IP Manager</h4>
          <small className="text-muted">
            Manage blocked IP addresses and access control
          </small>
        </div>

        <div className="d-flex align-items-center gap-2">
          {hasPermission("blocked_ip", "canList") && (
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

          {hasPermission("blocked_ip", "canCreate") && (
            <Button
              variant="primary"
              className="rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px" }}
              onClick={() => setShowModal(true)}
              title="Block IP"
            >
              <Plus size={18} />
            </Button>
          )}
        </div>
      </div>

      <Collapse in={showFilter}>
        <div>
          <Card className="p-3 mb-3 shadow-sm border-0 bg-light">
            <Form>
              <Row className="g-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Search by IP</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter IP address"
                      value={filters.ip}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          ip: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Filter by Type</Form.Label>
                    <Form.Select
                      value={filters.type}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    >
                      <option value="">All</option>
                      <option value="Login">Login</option>
                      <option value="Manual">Manual</option>
                    </Form.Select>
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
                      <option value="false">Blocked</option>
                      <option value="true">Allowed</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    setFilters({ ip: "", type: "", status: "" });
                    fetchBlockedIPs(1, perPage);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setPage(1);
                    fetchBlockedIPs(1, perPage);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Collapse>

      <Card className="p-3 shadow-sm border-0">
        <DataTable
          columns={columns}
          data={blockedIPs}
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

      <AddBlockedIPModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onIPAdded={fetchBlockedIPs}
      />
      <EditBlockedIPModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        ipId={selectedIPId}
        onIPUpdated={fetchBlockedIPs}
      />
      <ViewBlockedIPModal
        show={showViewModal}
        onHide={() => setShowViewModal(false)}
        ipId={viewIPId}
      />
    </div>
  );
}

export default BlockedIPManager;
