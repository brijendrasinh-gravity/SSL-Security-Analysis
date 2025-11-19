import React, { useState, useEffect } from "react";
import { Card, Form, Button, Spinner, Alert, Row, Col, Badge, Table } from "react-bootstrap";
import { Shield, Search, Clock, Trash2, Eye, AlertTriangle, CheckCircle } from "lucide-react";
import API from "../../../api/api";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";

function VirusTotalScanner() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { hasPermission } = usePermission();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await API.get("/virus/history");
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
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

    setScanning(true);
    try {
      const res = await API.post("/virus/scan-url", { scanned_url: url });
      if (res.data.success) {
        toast.success("URL submitted for analysis!");
        setUrl("");
        fetchHistory();
      }
    } catch (error) {
      console.error("Error scanning URL:", error);
      toast.error(error.response?.data?.message || "Failed to scan URL");
    } finally {
      setScanning(false);
    }
  };

  const handleViewReport = ( scanId) => {
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

  const getStatusBadge = (scan) => {
    if (!scan.last_analysis_date) {
      return <Badge bg="warning">Pending</Badge>;
    }
    return <Badge bg="success">Completed</Badge>;
  };

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
      </div>

      {hasPermission("virus_total", "canCreate") && (
        <Card className="shadow-sm border-0 mb-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-2 mb-3">
              <Search size={20} className="text-primary" />
              <h5 className="fw-bold mb-0">Scan New URL</h5>
            </div>
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
                      disabled={scanning}
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

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom p-3">
          <div className="d-flex align-items-center gap-2">
            <Clock size={20} className="text-primary" />
            <h5 className="fw-bold mb-0">Scan History</h5>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-5">
              <div className="bg-light rounded-circle d-inline-flex p-4 mb-3">
                <AlertTriangle size={48} className="text-muted" />
              </div>
              <p className="text-muted mb-0">No scans found. Start by scanning a URL above.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th className="fw-semibold">URL</th>
                    <th className="fw-semibold">Status</th>
                    <th className="fw-semibold">Scanned Date</th>
                    <th className="fw-semibold">Analysis Date</th>
                    <th className="text-center fw-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((scan) => (
                    <tr key={scan.id}>
                      <td>
                        <div className="text-truncate fw-medium" style={{ maxWidth: "400px" }}>
                          {scan.scanned_url}
                        </div>
                      </td>
                      <td>{getStatusBadge(scan)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2 text-muted">
                          <Clock size={14} />
                          <small>{new Date(scan.createdAt).toLocaleString()}</small>
                        </div>
                      </td>
                      <td>
                        {scan.last_analysis_date ? (
                          <small className="text-muted">
                            {new Date(scan.last_analysis_date).toLocaleString()}
                          </small>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex gap-2 justify-content-center">
                          {hasPermission("virus_total", "canList") && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleViewReport(scan.id)}
                            >
                              <Eye size={14} className="me-1" />
                              View
                            </Button>
                          )}
                          {hasPermission("virus_total", "canDelete") && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(scan.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default VirusTotalScanner;
