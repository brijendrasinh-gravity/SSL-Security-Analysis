import { Alert, Badge, Card } from "react-bootstrap";
import { AlertTriangle, CheckCircle, Shield } from "lucide-react";

function Securityissues({ result }) {
  const endpoints = result?.ssllabs?.endpoints || [];
  const issues = endpoints.filter((e) => e.grade !== "A" && e.grade !== "A+");

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className={`bg-${issues.length === 0 ? 'success' : 'danger'} bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px' }}>
            {issues.length === 0 ? (
              <CheckCircle className="text-success" size={20} />
            ) : (
              <AlertTriangle className="text-danger" size={20} />
            )}
          </div>
          <h5 className="fw-bold mb-0">Security Issues</h5>
        </div>

        {issues.length === 0 ? (
          <Alert variant="success" className="border-0 mb-4">
            <div className="d-flex align-items-start">
              <CheckCircle className="text-success me-3 flex-shrink-0" size={20} />
              <div>
                <h6 className="fw-bold mb-2">No Critical Issues Found</h6>
                <p className="mb-0">SSL configuration appears secure and well-configured</p>
              </div>
            </div>
          </Alert>
        ) : (
          <Alert variant="danger" className="border-0 mb-4">
            <div className="d-flex align-items-start">
              <AlertTriangle className="text-danger me-3 flex-shrink-0" size={20} />
              <div>
                <h6 className="fw-bold mb-3">Issues Detected</h6>
                {issues.map((e, i) => (
                  <div key={i} className="d-flex justify-content-between align-items-center mb-2 p-2 bg-white rounded">
                    <span>{e.ipAddress}</span>
                    <Badge bg="warning" className="px-3 py-2">
                      Grade: {e.grade || "N/A"}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Alert>
        )}

        <div>
          <h6 className="fw-semibold mb-3">
            <Shield size={18} className="me-2" />
            Security Recommendations
          </h6>
          <div className="d-flex flex-column gap-2">
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-3 flex-shrink-0" style={{ width: '8px', height: '8px', marginTop: '6px' }}></div>
                <span>Enable OCSP Stapling for improved certificate validation</span>
              </div>
            </div>
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-3 flex-shrink-0" style={{ width: '8px', height: '8px', marginTop: '6px' }}></div>
                <span>Review exposed subdomains for security vulnerabilities</span>
              </div>
            </div>
            <div className="p-3 bg-light rounded">
              <div className="d-flex align-items-start">
                <div className="bg-primary rounded-circle me-3 flex-shrink-0" style={{ width: '8px', height: '8px', marginTop: '6px' }}></div>
                <span>Ensure all endpoints use strong cipher suites</span>
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Securityissues;