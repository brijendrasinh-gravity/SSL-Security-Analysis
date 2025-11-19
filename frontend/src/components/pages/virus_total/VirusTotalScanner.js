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
      
      <div className="mb-4 bg-light p-3 rounded shadow-sm">
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
            <h5 className="fw-bold mb-3">Scan New URL</h5>
            <Form onSubmit={handleScan}>
              <Row className="align-items-end">
                <Col md={10}>
                  <Form.Group>
                    <Form.Label>Enter URL to Scan</Form.Label>
                    <Form.Control
                      type="url"
                      placeholder="https://example.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      size="lg"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100"
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
                        Scan
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom">
          <h5 className="fw-bold mb-0">Scan History</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center p-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-5">
              <AlertTriangle size={48} className="text-muted mb-3" />
              <p className="text-muted">No scans found. Start by scanning a URL above.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Scanned Date</th>
                  <th>Analysis Date</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map((scan) => (
                  <tr key={scan.id}>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: "400px" }}>
                        {scan.scanned_url}
                      </div>
                    </td>
                    <td>{getStatusBadge(scan)}</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <Clock size={16} className="text-muted" />
                        {new Date(scan.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td>
                      {scan.last_analysis_date ? (
                        new Date(scan.last_analysis_date).toLocaleString()
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
                            <Eye size={16} className="me-1" />
                            View Report
                          </Button>
                        )}
                        {hasPermission("virus_total", "canDelete") && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(scan.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default VirusTotalScanner;
