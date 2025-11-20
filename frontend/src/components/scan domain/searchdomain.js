import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../api/api";
import { Button, Card, Form, Spinner, Row, Col, Alert } from "react-bootstrap";
import { Search, Shield, Clock, CheckCircle, Zap, FileText, ArrowLeft, List } from "lucide-react";
import { usePermission } from "../../hooks/usePermission";

function SearchDomain() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = usePermission();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      alert("Please enter a domain");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await API.post("/sslanalysis/security", { domain });
      setResult(res.data);
      localStorage.setItem("ssl_result", JSON.stringify(res.data));
      const existinghistory = JSON.parse(localStorage.getItem("ssl-search-history")) || [];
      const historyupdated = [domain, ...existinghistory.filter((e)=> e !== domain)]
      localStorage.setItem('ssl-search-history', JSON.stringify(historyupdated));
      console.log(domain, "save in localstorage history")

      console.log(res.data?.crtsh);
    } catch (err) {
      console.error("error fetching analysis", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: "1200px" }}>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="fw-bold mb-0 text-primary">SSL Security Dashboard</h4>
          <small className="text-muted">Analyze SSL certificates and security configurations for any domain</small>
        </div>
        <div className="d-flex gap-2">
          {hasPermission('ssl_security', 'canList') && (
            <Button
              variant="outline-primary"
              onClick={() => navigate('/')}
              className="d-flex align-items-center"
            >
              <List size={18} className="me-2" />
              View All Scans
            </Button>
          )}
          <Button
            variant="outline-secondary"
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "40px", height: "40px" }}
            onClick={() => navigate('/')}
            title="Back to List"
          >
            <ArrowLeft size={18} />
          </Button>
        </div>
      </div>

      {/* Main Search Card */}
      <Row className="justify-content-center mb-4">
        <Col lg={10}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="domain-input" className="fw-semibold">
                    <Search size={16} className="me-2" />
                    Domain Name
                  </Form.Label>
                  <Form.Control
                    id="domain-input"
                    type="text"
                    placeholder="Enter domain name (e.g., google.com)"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    size="lg"
                    disabled={loading}
                    aria-label="Domain name input"
                    aria-required="true"
                  />
                  <Form.Text className="text-muted">
                    Enter the domain without http:// or https://
                  </Form.Text>
                </Form.Group>
                
                <div className="d-grid">
                  {hasPermission('ssl_security', 'canCreate') ? (
                    <Button 
                      type="submit" 
                      variant="primary" 
                      disabled={loading || !domain.trim()}
                      size="lg"
                      className="fw-semibold"
                      aria-label={loading ? "Analyzing SSL certificate" : "Analyze SSL certificate"}
                    >
                      {loading ? (
                        <>
                          <Spinner 
                            animation="border" 
                            size="sm" 
                            className="me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Analyzing SSL Certificate...
                        </>
                      ) : (
                        <>
                          <Search size={18} className="me-2" aria-hidden="true" />
                          Analyze SSL Certificate
                        </>
                      )}
                    </Button>
                  ) : (
                    <Alert variant="warning" className="mb-0">
                      <Shield size={18} className="me-2" />
                      You don't have permission to scan domains. Please contact your administrator.
                    </Alert>
                  )}
                </div>
              </Form>

              {result && (
                <Alert 
                  variant="success" 
                  className="mt-4 border-0 shadow-sm"
                  role="alert"
                  aria-live="polite"
                >
                  <div className="d-flex align-items-start">
                    <CheckCircle className="text-success me-3 flex-shrink-0" size={24} aria-hidden="true" />
                    <div className="flex-grow-1">
                      <h6 className="mb-2 fw-bold">Analysis Complete!</h6>
                      <p className="mb-2 d-flex align-items-center">
                        <Clock size={16} className="me-2" aria-hidden="true" />
                        <span>Polled Attempts: <strong>{result.polledAttempts}</strong></span>
                      </p>
                      <small className="text-muted">Your SSL security analysis has been completed successfully.</small>
                    </div>
                  </div>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Info Section */}
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="border-0 bg-light">
            <Card.Body className="p-4">
              <Row className="g-4 text-center">
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div 
                      className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <Shield className="text-success" size={24} />
                    </div>
                    <h6 className="fw-bold mb-1">Secure Analysis</h6>
                    <small className="text-muted">Advanced SSL certificate validation</small>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div 
                      className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <Zap className="text-primary" size={24} />
                    </div>
                    <h6 className="fw-bold mb-1">Real-time Results</h6>
                    <small className="text-muted">Instant analysis with detailed insights</small>
                  </div>
                </Col>
                
                <Col md={4}>
                  <div className="d-flex flex-column align-items-center">
                    <div 
                      className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: "48px", height: "48px" }}
                    >
                      <FileText className="text-warning" size={24} />
                    </div>
                    <h6 className="fw-bold mb-1">Comprehensive Reports</h6>
                    <small className="text-muted">Detailed security recommendations</small>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SearchDomain;

