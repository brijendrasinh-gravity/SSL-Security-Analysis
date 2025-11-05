import { Badge, Card, Col, Row } from "react-bootstrap";
import { Award, Server, Shield } from "lucide-react";

function SecurityGradeAnalysis({ result }) {
  if (!result?.ssllabs) return null;

  const endpoints = result.ssllabs.endpoints || [];
  const bestGrade = endpoints[0]?.grade || "N/A";

  const getGradeColor = (grade) => {
    if (grade === 'A' || grade === 'A+') return 'success';
    if (grade === 'B') return 'primary';
    if (grade === 'C') return 'warning';
    return 'danger';
  };

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-warning bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
            <Award className="text-warning" size={20} />
          </div>
          <h5 className="fw-bold mb-0">Security Grade Analysis</h5>
        </div>

        <Row className="g-4">
          <Col md={4}>
            <Card className="border-0 bg-light text-center p-4">
              <div className={`display-3 fw-bold text-${getGradeColor(bestGrade)} mb-2`}>
                {bestGrade}
              </div>
              <p className="text-muted mb-0">Overall Grade</p>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 bg-light text-center p-4">
              <Server className="text-primary mx-auto mb-3" size={32} />
              <div className="fs-2 fw-bold text-dark mb-2">{endpoints.length}</div>
              <p className="text-muted mb-0">Endpoints Analyzed</p>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="border-0 bg-light text-center p-4">
              <Shield className="text-success mx-auto mb-3" size={32} />
              <div className="fs-2 fw-bold text-dark mb-2">
                {endpoints.filter(e => e.grade === 'A' || e.grade === 'A+').length}
              </div>
              <p className="text-muted mb-0">Secure Endpoints</p>
            </Card>
          </Col>
        </Row>

        <div className="mt-4">
          <h6 className="fw-semibold mb-3">Endpoint Details</h6>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {endpoints.map((e, index) => (
              <Card key={index} className="border-0 bg-light p-3 mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold">{e.ipAddress}</div>
                    {e.serverName && (
                      <small className="text-muted">{e.serverName}</small>
                    )}
                  </div>
                  <Badge bg={getGradeColor(e.grade)} className="px-3 py-2">
                    {e.grade || "N/A"}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default SecurityGradeAnalysis;
