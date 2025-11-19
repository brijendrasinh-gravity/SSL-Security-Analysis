import React, { useState, useEffect } from "react";
import { Card, Spinner, Alert, Row, Col, Badge, Table, Nav, Tab } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle, XCircle, Clock, ArrowLeft, RefreshCw, Shield } from "lucide-react";
import API from "../../../api/api";
import { toast } from "react-toastify";

function VirusTotalReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("detection");

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await API.get(`/virus/report/${id}`);
      if (res.data.success) {
        setReport(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to fetch report");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStats = () => {
    const stats = report?.attributes?.last_analysis_stats || {};
    return {
      malicious: stats.malicious || 0,
      suspicious: stats.suspicious || 0,
      undetected: stats.undetected || 0,
      harmless: stats.harmless || 0,
      timeout: stats.timeout || 0,
    };
  };

  const getThreatLevel = () => {
    const stats = getStats();
    if (stats.malicious > 0) return { level: "danger", text: "Malicious", icon: XCircle };
    if (stats.suspicious > 0) return { level: "warning", text: "Suspicious", icon: AlertTriangle };
    return { level: "success", text: "Clean", icon: CheckCircle };
  };

  const getEngineResults = () => {
    const results = report?.attributes?.last_analysis_results || {};
    return Object.entries(results).map(([engine, data]) => ({
      engine,
      category: data.category,
      result: data.result,
      method: data.method,
      engine_name: data.engine_name,
    }));
  };

  const getCategories = () => {
    const categories = report?.attributes?.categories || {};
    return Object.entries(categories);
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center p-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="container mt-4">
        <Alert variant="danger">
          <AlertTriangle size={20} className="me-2" />
          Failed to load report
        </Alert>
      </div>
    );
  }

  const stats = getStats();
  const threat = getThreatLevel();
  const ThreatIcon = threat.icon;
  const total = stats.malicious + stats.suspicious + stats.undetected + stats.harmless;
  const url = report?.attributes?.url || "N/A";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn btn-outline-secondary"
            onClick={() => navigate("/virus-total")}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h4 className="fw-bold mb-0">VirusTotal Scan Report</h4>
            <small className="text-muted text-truncate d-block" style={{ maxWidth: "600px" }}>
              {url}
            </small>
          </div>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => fetchReport(true)}
          disabled={refreshing}
        >
          <RefreshCw size={18} className={refreshing ? "spin" : ""} />
          {refreshing ? " Refreshing..." : " Refresh"}
        </button>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className={`border-${threat.level} shadow-sm`}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div className={`bg-${threat.level} bg-opacity-10 rounded-circle p-3`}>
                    <ThreatIcon size={40} className={`text-${threat.level}`} />
                  </div>
                  <div>
                    <h3 className={`fw-bold mb-1 text-${threat.level}`}>{threat.text}</h3>
                    <p className="mb-0 text-muted">
                      {stats.malicious} malicious, {stats.suspicious} suspicious out of {total} engines
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <Clock size={16} />
                    <small>
                      {report?.attributes?.last_analysis_date
                        ? new Date(report.attributes.last_analysis_date * 1000).toLocaleString()
                        : "N/A"}
                    </small>
                  </div>
                  <Badge bg={threat.level} className="px-3 py-2">
                    {stats.malicious > 0 ? `${stats.malicious} Threats Detected` : "No Threats"}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #dc3545" }}>
            <Card.Body className="text-center">
              <h1 className="display-4 text-danger mb-0">{stats.malicious}</h1>
              <p className="text-muted mb-0">Malicious</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #ffc107" }}>
            <Card.Body className="text-center">
              <h1 className="display-4 text-warning mb-0">{stats.suspicious}</h1>
              <p className="text-muted mb-0">Suspicious</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #28a745" }}>
            <Card.Body className="text-center">
              <h1 className="display-4 text-success mb-0">{stats.harmless}</h1>
              <p className="text-muted mb-0">Harmless</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100" style={{ borderLeft: "4px solid #6c757d" }}>
            <Card.Body className="text-center">
              <h1 className="display-4 text-secondary mb-0">{stats.undetected}</h1>
              <p className="text-muted mb-0">Undetected</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav variant="tabs" className="px-3 pt-3">
              <Nav.Item>
                <Nav.Link eventKey="detection">
                  <Shield size={16} className="me-2" />
                  Detection
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="details">
                  <AlertTriangle size={16} className="me-2" />
                  Details
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="detection">
                <div className="p-4">
                  <h5 className="fw-bold mb-3">Security Vendors Analysis</h5>
                  <Row>
                    {getEngineResults().map((item, index) => (
                      <Col md={4} key={index} className="mb-3">
                        <Card className="border-0 bg-light h-100">
                          <Card.Body className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                              <Shield size={16} className="text-muted" />
                              <span className="fw-semibold">{item.engine}</span>
                            </div>
                            <div>
                              {item.category === "malicious" && (
                                <Badge bg="danger">Malicious</Badge>
                              )}
                              {item.category === "suspicious" && (
                                <Badge bg="warning">Suspicious</Badge>
                              )}
                              {item.category === "undetected" && (
                                <Badge bg="secondary">Unrated</Badge>
                              )}
                              {item.category === "harmless" && (
                                <Badge bg="success">Clean</Badge>
                              )}
                              {item.category === "timeout" && (
                                <Badge bg="info">Timeout</Badge>
                              )}
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Tab.Pane>

              <Tab.Pane eventKey="details">
                <div className="p-4">
                  <Row>
                    <Col md={6} className="mb-4">
                      <h5 className="fw-bold mb-3">Categories</h5>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          {getCategories().length > 0 ? (
                            <Table borderless className="mb-0">
                              <tbody>
                                {getCategories().map(([vendor, category], index) => (
                                  <tr key={index}>
                                    <td className="fw-semibold">{vendor}</td>
                                    <td className="text-end text-muted">{category}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </Table>
                          ) : (
                            <p className="text-muted mb-0">No categories available</p>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={6} className="mb-4">
                      <h5 className="fw-bold mb-3">History</h5>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <Table borderless className="mb-0">
                            <tbody>
                              <tr>
                                <td className="fw-semibold">First Submission</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.first_submission_date
                                    ? new Date(report.attributes.first_submission_date * 1000).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Last Submission</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.last_submission_date
                                    ? new Date(report.attributes.last_submission_date * 1000).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Last Analysis</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.last_analysis_date
                                    ? new Date(report.attributes.last_analysis_date * 1000).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Times Submitted</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.times_submitted || 0}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>

                    <Col md={12}>
                      <h5 className="fw-bold mb-3">HTTP Response</h5>
                      <Card className="border-0 bg-light">
                        <Card.Body>
                          <Table borderless className="mb-0">
                            <tbody>
                              <tr>
                                <td className="fw-semibold">Final URL</td>
                                <td className="text-end text-muted text-break">
                                  {report?.attributes?.last_final_url || url}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Status Code</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.last_http_response_code || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Content Length</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.last_http_response_content_length
                                    ? `${report.attributes.last_http_response_content_length} bytes`
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Title</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.title || "N/A"}
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
}

export default VirusTotalReport;
