import React, { useState, useEffect } from "react";
import {
  Card,
  Spinner,
  Alert,
  Row,
  Col,
  Badge,
  Table,
  Nav,
  Tab,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeft,
  RefreshCw,
  Shield,
} from "lucide-react";
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

  const handleRescan = async () => {
    try {
      setRefreshing(true);
      const res = await API.get(`/virus/rescan/${id}`);
      if (res.data.success) {
        toast.success("URL rescanned successfully!");
        setReport(res.data.data); // Update UI with fresh data
      }
    } catch (error) {
      toast.error("Failed to rescan URL");
    } finally {
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
    if (stats.malicious > 0)
      return { level: "danger", text: "Malicious", icon: XCircle };
    if (stats.suspicious > 0)
      return { level: "warning", text: "Suspicious", icon: AlertTriangle };
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
  const total =
    stats.malicious + stats.suspicious + stats.undetected + stats.harmless;
  const url = report?.attributes?.url || "N/A";

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-primary">VirusTotal Scan Report</h4>
          <small
            className="text-muted text-truncate d-block"
            style={{ maxWidth: "600px" }}
          >
            {url}
          </small>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary"
            onClick={() => fetchReport(true)}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            {refreshing ? " Refreshing..." : " Refresh"}
          </button>
          <button
            className="btn btn-warning ms-2"
            onClick={handleRescan}
            disabled={refreshing}
          >
            <RefreshCw size={18} className={refreshing ? "spin" : ""} />
            Re-Scan
          </button>
          <button
            className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
            onClick={() => navigate("/virus-total")}
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={12}>
          <Card className={`border-${threat.level} shadow-sm`}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-3">
                  <div
                    className={`bg-${threat.level} bg-opacity-10 rounded-circle p-3`}
                  >
                    <ThreatIcon size={40} className={`text-${threat.level}`} />
                  </div>
                  <div>
                    <h3 className={`fw-bold mb-1 text-${threat.level}`}>
                      {threat.text}
                    </h3>
                    <p className="mb-0 text-muted">
                      {stats.malicious} malicious, {stats.suspicious} suspicious
                      out of {total} engines
                    </p>
                  </div>
                </div>
                <div className="text-end">
                  <div className="d-flex align-items-center gap-2 text-muted mb-2">
                    <Clock size={16} />
                    <small>
                      {report?.attributes?.last_analysis_date
                        ? new Date(
                            report.attributes.last_analysis_date * 1000
                          ).toLocaleString()
                        : "N/A"}
                    </small>
                  </div>
                  <Badge bg={threat.level} className="px-3 py-2">
                    {stats.malicious > 0
                      ? `${stats.malicious} Threats Detected`
                      : "No Threats"}
                  </Badge>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-danger bg-opacity-10">
            <Card.Body className="text-center p-4">
              <XCircle size={32} className="text-danger mb-2" />
              <h2 className="display-5 text-danger mb-1 fw-bold">
                {stats.malicious}
              </h2>
              <p className="text-muted mb-0 small">Malicious</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-warning bg-opacity-10">
            <Card.Body className="text-center p-4">
              <AlertTriangle size={32} className="text-warning mb-2" />
              <h2 className="display-5 text-warning mb-1 fw-bold">
                {stats.suspicious}
              </h2>
              <p className="text-muted mb-0 small">Suspicious</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-success bg-opacity-10">
            <Card.Body className="text-center p-4">
              <CheckCircle size={32} className="text-success mb-2" />
              <h2 className="display-5 text-success mb-1 fw-bold">
                {stats.harmless}
              </h2>
              <p className="text-muted mb-0 small">Harmless</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-secondary bg-opacity-10">
            <Card.Body className="text-center p-4">
              <Shield size={32} className="text-secondary mb-2" />
              <h2 className="display-5 text-secondary mb-1 fw-bold">
                {stats.undetected}
              </h2>
              <p className="text-muted mb-0 small">Undetected</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
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
                  <div className="d-flex align-items-center gap-2 mb-4">
                    <Shield size={20} className="text-primary" />
                    <h5 className="fw-bold mb-0">Security Vendors Analysis</h5>
                    <Badge bg="secondary" className="ms-2">
                      {getEngineResults().length} Engines
                    </Badge>
                  </div>
                  <Row className="g-3">
                    {getEngineResults().map((item, index) => {
                      const getBadgeColor = (category) => {
                        switch (category) {
                          case "malicious":
                            return "danger";
                          case "suspicious":
                            return "warning";
                          case "harmless":
                            return "success";
                          case "timeout":
                            return "info";
                          default:
                            return "secondary";
                        }
                      };

                      const getIcon = (category) => {
                        switch (category) {
                          case "malicious":
                            return <XCircle size={14} />;
                          case "suspicious":
                            return <AlertTriangle size={14} />;
                          case "harmless":
                            return <CheckCircle size={14} />;
                          default:
                            return <Shield size={14} />;
                        }
                      };

                      return (
                        <Col md={4} lg={3} key={index}>
                          <Card className="border-0 shadow-sm h-100 hover-shadow">
                            <Card.Body className="p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  <Shield size={14} className="text-muted" />
                                  <span className="fw-semibold small">
                                    {item.engine}
                                  </span>
                                </div>
                              </div>
                              <Badge
                                bg={getBadgeColor(item.category)}
                                className="d-flex align-items-center gap-1 w-100 justify-content-center py-2"
                              >
                                {getIcon(item.category)}
                                <span className="small">
                                  {item.category === "undetected"
                                    ? "Unrated"
                                    : item.category.charAt(0).toUpperCase() +
                                      item.category.slice(1)}
                                </span>
                              </Badge>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
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
                                {getCategories().map(
                                  ([vendor, category], index) => (
                                    <tr key={index}>
                                      <td className="fw-semibold">{vendor}</td>
                                      <td className="text-end text-muted">
                                        {category}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </Table>
                          ) : (
                            <p className="text-muted mb-0">
                              No categories available
                            </p>
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
                                <td className="fw-semibold">
                                  First Submission
                                </td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.first_submission_date
                                    ? new Date(
                                        report.attributes
                                          .first_submission_date * 1000
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Last Submission</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.last_submission_date
                                    ? new Date(
                                        report.attributes.last_submission_date *
                                          1000
                                      ).toLocaleString()
                                    : "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Last Analysis</td>
                                <td className="text-end text-muted">
                                  {report?.attributes?.last_analysis_date
                                    ? new Date(
                                        report.attributes.last_analysis_date *
                                          1000
                                      ).toLocaleString()
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
                                  {report?.attributes
                                    ?.last_http_response_code || "N/A"}
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-semibold">Content Length</td>
                                <td className="text-end text-muted">
                                  {report?.attributes
                                    ?.last_http_response_content_length
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
