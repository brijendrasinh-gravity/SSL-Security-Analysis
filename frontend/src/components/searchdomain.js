import { useState } from "react";
import API from "../api/api";
import { Button, Card, Form, Spinner, Row, Col, Alert } from "react-bootstrap";
import { Search, Shield, Clock, CheckCircle, Zap, FileText } from "lucide-react";

function SearchDomain() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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
      <div className="text-center mb-5">
        <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3">
          <Shield className="text-primary" size={40} />
        </div>
        <h1 className="fw-bold mb-2">SSL Security Dashboard</h1>
        <p className="text-muted">Analyze SSL certificates and security configurations for any domain</p>
      </div>

      {/* Main Search Card */}
      <Row className="justify-content-center mb-5">
        <Col lg={8}>
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

      {/* Feature Cards */}
      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 text-center">
            <Card.Body className="p-4">
              <div 
                className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "64px", height: "64px" }}
                aria-hidden="true"
              >
                <Shield className="text-success" size={28} />
              </div>
              <h5 className="fw-bold mb-3">Secure Analysis</h5>
              <p className="text-muted mb-0">Advanced SSL certificate validation and security checks</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 text-center">
            <Card.Body className="p-4">
              <div 
                className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "64px", height: "64px" }}
                aria-hidden="true"
              >
                <Zap className="text-primary" size={28} />
              </div>
              <h5 className="fw-bold mb-3">Real-time Results</h5>
              <p className="text-muted mb-0">Get instant analysis results with detailed security insights</p>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card className="border-0 shadow-sm h-100 text-center">
            <Card.Body className="p-4">
              <div 
                className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: "64px", height: "64px" }}
                aria-hidden="true"
              >
                <FileText className="text-warning" size={28} />
              </div>
              <h5 className="fw-bold mb-3">Comprehensive Reports</h5>
              <p className="text-muted mb-0">Detailed reports with actionable security recommendations</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default SearchDomain;

