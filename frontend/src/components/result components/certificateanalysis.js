import { useState } from "react";
import { Card, Tabs, Tab, Row, Col, Badge, Table, Button } from "react-bootstrap";
import { FileText, CheckCircle, XCircle, Clock, Building, Globe, Calendar } from "lucide-react";

function CertificateTransparencyAnalysis({ result }) {
  const [loadname, setLoadName] = useState(5);

  const [activeTab, setActiveTab] = useState("overview");

  const certs = result?.certificateTransparency?.summary || {};

  const issuers = result?.certificateTransparency?.statistics?.issuers || [];

  const subdomains =
    result?.certificateTransparency?.statistics?.subdomains || [];

  const timeline = result?.certificateTransparency?.statistics?.timeline || [];

  const handleSubDomain = () => {
    setLoadName((prevdomain)=> prevdomain + 5)
  }

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-primary bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
            <FileText className="text-primary" size={20} />
          </div>
          <h5 className="fw-bold mb-0">Certificate Transparency Analysis</h5>
        </div>

      <Tabs
        id="cert-transparency-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        justify
        variant="pills"
      >
        {/* OVERVIEW */}
        <Tab eventKey="overview" title="Overview">
          <Row className="g-3 mt-2">
            <Col md={4}>
              <Card className="border-0 bg-light text-center p-3">
                <FileText className="text-primary mx-auto mb-2" size={24} />
                <div className="fs-4 fw-bold text-dark">
                  {certs.totalCertificates || 0}
                </div>
                <small className="text-muted">Total Certificates</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 bg-light text-center p-3">
                <CheckCircle className="text-success mx-auto mb-2" size={24} />
                <div className="fs-4 fw-bold text-dark">
                  {certs.activeCertificates || 0}
                </div>
                <small className="text-muted">Active Certificates</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 bg-light text-center p-3">
                <XCircle className="text-danger mx-auto mb-2" size={24} />
                <div className="fs-4 fw-bold text-dark">
                  {certs.expiredCertificates || 0}
                </div>
                <small className="text-muted">Expired Certificates</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 bg-light text-center p-3">
                <Clock className="text-warning mx-auto mb-2" size={24} />
                <div className="fs-4 fw-bold text-dark">
                  {certs.recentCertificates || 0}
                </div>
                <small className="text-muted">Recent (30 Days)</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 bg-light text-center p-3">
                <Building className="text-info mx-auto mb-2" size={24} />
                <div className="fs-4 fw-bold text-dark">
                  {certs.uniqueIssuers || 0}
                </div>
                <small className="text-muted">Unique Issuers</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 bg-light text-center p-3">
                <Globe className="text-secondary mx-auto mb-2" size={24} />
                <div className="fs-4 fw-bold text-dark">
                  {certs.discoveredSubdomains || 0}
                </div>
                <small className="text-muted">Discovered Subdomains</small>
              </Card>
            </Col>
          </Row>

          {/* TOP ISSUERS */}
          <div className="mt-4">
            <h6 className="fw-semibold mb-3">Top Certificate Issuers</h6>
            {issuers.length > 0 ? (
              <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                <Table className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="border-0 py-3">#</th>
                      <th className="border-0 py-3">Issuer Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuers.slice(0, 10).map((issuer, i) => (
                      <tr key={i} className="border-bottom">
                        <td className="py-3">
                          <Badge bg="primary">{i + 1}</Badge>
                        </td>
                        <td className="py-3">{issuer}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p className="text-muted">No issuer data available.</p>
            )}
          </div>
        </Tab>

        {/* SUBDOMAINS */}
        <Tab eventKey="subdomains" title="Subdomains">
          {subdomains.length > 0 ? (
            <div className="mt-3">
              <div className="d-flex flex-wrap gap-2">
                {subdomains.slice(0,loadname).map((sub, i) => (
                  <Badge key={i} bg="light" text="dark" className="px-3 py-2">
                    {sub}
                  </Badge>
                ))}
              </div>
              {loadname < subdomains.length && (
                <div className="mt-3 text-center">
                  <Button variant="outline-primary" onClick={handleSubDomain} size="sm">
                    Load More
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted mt-3">No subdomains found.</p>
          )}
        </Tab>

        {/* TIMELINE */}
        <Tab eventKey="timeline" title="Timeline">
          {timeline.length > 0 ? (
            <div className="mt-3" style={{ maxHeight: "400px", overflowY: "auto" }}>
              <Table className="mb-0">
                <thead className="bg-light position-sticky top-0" style={{ zIndex: 2 }}>
                  <tr>
                    <th className="border-0 py-3">#</th>
                    <th className="border-0 py-3">
                      <Calendar size={16} className="me-2" />
                      Month
                    </th>
                    <th className="border-0 py-3">Certificates Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((t, i) => (
                    <tr key={i} className="border-bottom">
                      <td className="py-3">{i + 1}</td>
                      <td className="py-3">{t.month}</td>
                      <td className="py-3">
                        <Badge bg="primary" className="px-3 py-2">
                          {t.count}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p className="text-muted mt-3">No timeline data available.</p>
          )}
        </Tab>
      </Tabs>
      </Card.Body>
    </Card>
  );
}

export default CertificateTransparencyAnalysis;
