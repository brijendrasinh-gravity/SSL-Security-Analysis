import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Button,
  Spinner,
  Row,
  Col,
  Badge,
  Collapse,
  OverlayTrigger,
  Tooltip,
  Alert,
} from "react-bootstrap";
import DataTable from "react-data-table-component";
import { Shield, Search, Clock, Trash2, Eye, Filter, Plus, AlertCircle } from "lucide-react";
import API from "../../../api/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import { useApiLimit } from "../../../hooks/useApiLimit";

function VirusTotalScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ url: "", status: "" });
  const [showFilter, setShowFilter] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const { isLimitReached, isLimitEnabled, usedToday, dailyLimit, remainingCalls, loading: limitLoading, refetch: refetchLimit } = useApiLimit();

  useEffect(() => {
    fetchHistory();
  }, [page, perPage]);

  const fetchHistory = async (pageNumber = page, pageLimit = perPage) => {
    setLoading(true);
    try {
      const { url, status } = filters;
      const res = await API.get("/virus/history", {
        params: { page: pageNumber, limit: pageLimit, url, status },
      });
      if (res.data.success) {
        setHistory(res.data.data.rows || res.data.data);
        setTotalRows(res.data.data.count || res.data.data.length);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to fetch scan history");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    if (isLimitReached) {
      toast.error("Daily API limit reached. Please try again tomorrow or contact your administrator.", {
        autoClose: 5000,
      });
      return;
    }

    setScanning(true);
    try {
      const res = await API.post("/virus/scan-url", { scanned_url: url });
      if (res.data.success) {
        toast.success("URL submitted for analysis!");
        setUrl("");
        fetchHistory();
        refetchLimit(); // Refresh limit info after successful scan
      }
    } catch (error) {
      console.error("Error scanning URL:", error);
      
      // Check if error is due to API limit
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.message || "Daily API limit reached. Try again tomorrow.", {
          autoClose: 5000,
        });
        refetchLimit(); // Refresh limit info
      } else {
        toast.error(error.response?.data?.message || "Failed to scan URL");
      }
    } finally {
      setScanning(false);
    }
  };

  const handleViewReport = (scanId) => {
    navigate(`/virus-total/report/${scanId}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan?")) return;

    try {
      await API.delete(`/virus/delete/${id}`);
      toast.success("Scan deleted successfully");
      fetchHistory();
    } catch (error) {
      console.error("Error deleting scan:", error);
      toast.error("Failed to delete scan");
    }
  };

  const columns = [
    {
      name: "URL",
      selector: (row) => row.scanned_url || "-",
      sortable: true,
      cell: (row) => (
        <span
          className="text-primary fw-semibold text-truncate"
          style={{ cursor: "pointer", maxWidth: "400px" }}
          onClick={() => handleViewReport(row.id)}
          title={row.scanned_url}
        >
          {row.scanned_url}
        </span>
      ),
      grow: 2,
    },
    {
      name: "Status",
      selector: (row) => row.last_analysis_date,
      sortable: true,
      cell: (row) =>
        row.last_analysis_date ? (
          <Badge bg="success">Completed</Badge>
        ) : (
          <Badge bg="warning">Pending</Badge>
        ),
    },
    {
      name: "Scanned Date",
      selector: (row) => row.createdAt,
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center gap-2 text-muted">
          <Clock size={14} />
          <small>{new Date(row.createdAt).toLocaleString()}</small>
        </div>
      ),
    },
    {
      name: "Analysis Date",
      selector: (row) => row.last_analysis_date,
      sortable: true,
      cell: (row) =>
        row.last_analysis_date ? (
          <small className="text-muted">
            {new Date(row.last_analysis_date).toLocaleString()}
          </small>
        ) : (
          <span className="text-muted">-</span>
        ),
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex gap-3 justify-content-center">
          {hasPermission("virus_total", "canList") && (
            <OverlayTrigger placement="top" overlay={<Tooltip>View Report</Tooltip>}>
              <Button
                variant="link"
                className="p-0 text-primary"
                onClick={() => handleViewReport(row.id)}
              >
                <Eye size={18} />
              </Button>
            </OverlayTrigger>
          )}
          {hasPermission("virus_total", "canDelete") && (
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
      omit:
        !hasPermission("virus_total", "canList") &&
        !hasPermission("virus_total", "canDelete"),
    },
  ];

  return (
    <div className="container mt-4">
      <ToastContainer />

      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div className="d-flex align-items-center gap-2">
          <Shield size={32} className="text-primary" />
          <div>
            <h4 className="fw-bold mb-0 text-primary">VirusTotal URL Scanner</h4>
            <small className="text-muted">Scan URLs for malware and security threats</small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {hasPermission("virus_total", "canList") && (
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
        </div>
      </div>

      {hasPermission("virus_total", "canCreate") && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center gap-2">
                <Search size={20} className="text-primary" />
                <h5 className="fw-bold mb-0">Scan New URL</h5>
              </div>
              {isLimitEnabled && !limitLoading && (
                <Badge bg={isLimitReached ? "danger" : remainingCalls <= 5 ? "warning" : "success"}>
                  {isLimitReached 
                    ? "Limit Reached" 
                    : `${remainingCalls} scan${remainingCalls !== 1 ? 's' : ''} remaining`
                  }
                </Badge>
              )}
            </div>

            {isLimitReached && (
              <Alert variant="danger" className="d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={20} />
                <div>
                  <strong>Daily limit reached!</strong> You've used {usedToday} of {dailyLimit} scans today. 
                  Please try again tomorrow or contact your administrator to increase your limit.
                </div>
              </Alert>
            )}

            <Form onSubmit={handleScan}>
              <Row className="align-items-end g-3">
                <Col md={10}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">Enter URL to Scan</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      size="lg"
                      required
                      disabled={isLimitReached}
                    />
                    <Form.Text className="text-muted">
                      Enter a complete URL including http:// or https://
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <div className="d-grid">
                    <Button 
                      type="submit" 
                      variant="primary" 
                      size="lg" 
                      disabled={scanning || isLimitReached}
                      title={isLimitReached ? "Daily API limit reached" : "Scan URL"}
                    >
                      {scanning ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Scanning...
                        </>
                      ) : (
                        <>
                          <Search size={18} className="me-2" />
                          Scan URL
                        </>
                      )}
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Collapse in={showFilter}>
        <div>
          <Card className="p-3 mb-3 shadow-sm border-0 bg-light">
            <Form>
              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Search by URL</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter URL"
                      value={filters.url}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                      }
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
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
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="secondary"
                  className="me-2"
                  onClick={() => {
                    setFilters({ url: "", status: "" });
                    fetchHistory(1, perPage);
                  }}
                >
                  Reset
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setPage(1);
                    fetchHistory(1, perPage);
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </Form>
          </Card>
        </div>
      </Collapse>

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center gap-2">
            <Clock size={20} className="text-primary" />
            <h5 className="fw-bold mb-0">Scan History</h5>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <DataTable
            columns={columns}
            data={history}
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
            noDataComponent={
              <div className="text-center p-5">
                <p className="text-muted mb-0">
                  No scans found. Start by scanning a URL above.
                </p>
              </div>
            }
          />
        </Card.Body>
      </Card>
    </div>
  );
}

export default VirusTotalScanner;
