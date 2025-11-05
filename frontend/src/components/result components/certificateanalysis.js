import React, { useState } from "react";
import { Card, Tabs, Tab, Row, Col, Badge, Table, Button } from "react-bootstrap";

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
    <Card className="p-4 mt-4 shadow-sm border-0 rounded-4">
      <h5 className="fw-bold mb-3">Certificate Transparency Analysis</h5>

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
          <Row className="g-4 mt-2">
            <Col md={4}>
              <Card className="p-3 text-center border-primary border-2 bg-secondary bg-gradient">
                <div className="fs-4 fw-bold text-white">
                  {certs.totalCertificates || 0}
                </div>
                <small className="text-white">Total Certificates</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-3 text-center border-success border-2 bg-secondary bg-gradient">
                <div className="fs-4 fw-bold text-white">
                  {certs.activeCertificates || 0}
                </div>
                <small className="text-white">Active Certificates</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-3 text-center border-danger border-2 bg-secondary bg-gradient">
                <div className="fs-4 fw-bold text-white">
                  {certs.expiredCertificates || 0}
                </div>
                <small className="text-white">Expired Certificates</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-3 text-center border-warning border-2 bg-secondary bg-gradient">
                <div className="fs-4 fw-bold text-white">
                  {certs.recentCertificates || 0}
                </div>
                <small className="text-white">Recent (30 Days)</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-3 text-center border-info border-2 bg-secondary bg-gradient">
                <div className="fs-4 fw-bold text-white">
                  {certs.uniqueIssuers || 0}
                </div>
                <small className="text-white">Unique Issuers</small>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="p-3 text-center border-secondary border-2 bg-secondary bg-gradient">
                <div className="fs-4 fw-bold text-white">
                  {certs.discoveredSubdomains || 0}
                </div>
                <small className="text-white">Discovered Subdomains</small>
              </Card>
            </Col>
          </Row>

          {/* TOP ISSUERS */}
          <div className="mt-5">
            <h6 className="fw-bold mb-3">Top Certificate Issuers</h6>
            {issuers.length > 0 ? (
              <div
                className="table-responsive"
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  overflowX: "hidden",
                }}
              >
                <Table borderless hover responsive className="align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Issuer Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuers.slice(0, 10).map((issuer, i) => (
                      <tr key={i}>
                        <td>
                          <Badge bg="light" text="dark">
                            {i + 1}
                          </Badge>
                        </td>
                        <td>{issuer}</td>
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
            <div>

            <div className="d-flex flex-wrap gap-2 mt-3">
              {subdomains.slice(0,loadname).map((sub, i) => (
                <Badge key={i} bg="secondary" className="p-2 rounded">
                  {sub}
                </Badge>
              ))}
            </div>
            {loadname < subdomains.length && (
              <div className="mt-3 text-center">
                <Button onClick={handleSubDomain} size="sm">
                  load more 
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
            <div
              className="table-responsive mt-3"
              style={{
                maxHeight: "400px",
                overflowY: "auto",
                overflowX: "hidden",
                borderRadius: "8px",
              }}
            >
              <Table bordered hover responsive className="align-middle">
                <thead
                  className="table-light position-sticky top-0"
                  style={{ zIndex: 2 }}
                >
                  <tr>
                    <th>#</th>
                    <th>Month (YYYY-MM)</th>
                    <th>Certificates Issued</th>
                  </tr>
                </thead>
                <tbody>
                  {timeline.map((t, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td>
                      <td>{t.month}</td>
                      <td>
                        <Badge bg="primary" text="white">
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
    </Card>
  );
}

export default CertificateTransparencyAnalysis;
