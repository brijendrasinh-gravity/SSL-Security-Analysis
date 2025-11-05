import { useState } from "react";
import { Card, Tabs, Tab, Table, Badge } from "react-bootstrap";
import { Server, FileText, Shield, CheckCircle, XCircle } from "lucide-react";

function SSLDetailsAnalysis({ result }) {
  const [activeTab, setActiveTab] = useState("endpoints");

  const endpoints = result?.ssllabs?.endpoints || [];
  const certs = result?.ssllabs?.certs || [];

  return (
    <Card className="shadow-sm border-0 mt-4">
      <Card.Body className="p-4">
        <div className="d-flex align-items-center mb-4">
          <div className="bg-info bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
            <Server className="text-info" size={20} />
          </div>
          <h5 className="fw-bold mb-0">SSL Details Analysis</h5>
        </div>

      <Tabs
        id="ssl-details-tabs"
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
        justify
        variant="pills"
      >
        {/* ENDPOINTS part */}
        <Tab eventKey="endpoints" title="Endpoints">
          <div style={{ maxHeight: '560px', overflowY: 'auto' }} className="mt-3">
            {endpoints.length > 0 ? (
              endpoints.map((endpoint, index) => (
                <Card key={index} className="border-0 bg-light p-3 mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <Badge bg="secondary" className="px-3 py-2 me-2">
                        {endpoint.ipAddress || "N/A"}
                      </Badge>
                      <span className="fw-semibold">{endpoint.serverName || "Unknown Server"}</span>
                    </div>
                    <Badge
                      bg={
                        endpoint.grade === "A" || endpoint.grade === "A+"
                          ? "success"
                          : endpoint.grade === "B"
                          ? "primary"
                          : endpoint.grade === "C"
                          ? "warning"
                          : "danger"
                      }
                      className="px-3 py-2"
                    >
                      Grade: {endpoint.grade || "N/A"}
                    </Badge>
                  </div>

                  <Table className="mb-0">
                    <tbody>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Status</td>
                        <td className="py-2 fw-semibold">{endpoint.statusMessage || "N/A"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Protocol Support</td>
                        <td className="py-2 fw-semibold">
                          {endpoint.details?.protocols
                            ?.map((p) => `${p.name} ${p.version}`)
                            .join(", ") || "N/A"}
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Forward Secrecy</td>
                        <td className="py-2">
                          <Badge bg={endpoint.details?.forwardSecrecy >= 2 ? "success" : "danger"}>
                            {endpoint.details?.forwardSecrecy >= 2 ? "Supported" : "Not Supported"}
                          </Badge>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-muted">OCSP Stapling</td>
                        <td className="py-2">
                          <Badge bg={endpoint.details?.ocspStapling ? "success" : "warning"}>
                            {endpoint.details?.ocspStapling ? "Enabled" : "Disabled"}
                          </Badge>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card>
              ))
            ) : (
              <p className="text-muted">No endpoint data found.</p>
            )}
          </div>
        </Tab>

        {/* CERTIFICATES PART*/}
        <Tab eventKey="certificates" title="Certificates">
          <div style={{ maxHeight: '560px', overflowY: 'auto' }} className="mt-3">
            {certs.length > 0 ? (
              certs.map((cert, index) => (
                <Card key={index} className="border-0 bg-light p-3 mb-3">
                  <h6 className="fw-bold mb-3">
                    <FileText size={18} className="me-2" />
                    Certificate #{index + 1}
                  </h6>
                  <Table className="mb-0">
                    <tbody>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Subject</td>
                        <td className="py-2 fw-semibold">{cert.subject || "N/A"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Issuer</td>
                        <td className="py-2 fw-semibold">{cert.issuerSubject || "N/A"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Algorithm</td>
                        <td className="py-2 fw-semibold">{cert.keyAlg || "N/A"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Key Size</td>
                        <td className="py-2 fw-semibold">{cert.keySize ? `${cert.keySize} bits` : "N/A"}</td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Valid From</td>
                        <td className="py-2 fw-semibold">
                          {cert.notBefore ? new Date(cert.notBefore).toDateString() : "N/A"}
                        </td>
                      </tr>
                      <tr className="border-bottom">
                        <td className="py-2 text-muted">Valid Till</td>
                        <td className="py-2 fw-semibold">
                          {cert.notAfter ? new Date(cert.notAfter).toDateString() : "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-muted">Alternative Names</td>
                        <td className="py-2">
                          <div className="d-flex flex-wrap gap-2">
                            {cert.altNames && cert.altNames.length > 0
                              ? cert.altNames.map((name, i) => (
                                  <Badge bg="light" text="dark" className="px-2 py-1" key={i}>
                                    {name}
                                  </Badge>
                                ))
                              : "N/A"}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card>
              ))
            ) : (
              <p className="text-muted">No certificate data available.</p>
            )}
          </div>
        </Tab>

        {/*  SECURITY PART */}
        {/* <Tab eventKey="security" title="Security">
          {endpoints.length > 0 ? (
            endpoints.map((endpoint, index) => (
              <Card key={index} className="p-3 mb-3 border rounded shadow-sm">
                <h6 className="mb-3">
                  <Badge bg="secondary" className="me-2">
                    {endpoint.ipAddress || "N/A"}
                  </Badge>
                  Security Configuration
                </h6>
                <Table bordered hover responsive className="mb-0">
                  <tbody>
                    <tr>
                      <td><strong>Heartbleed</strong></td>
                      <td>
                        {endpoint.details?.heartbleed
                          ? "Vulnerable"
                          : "Not Vulnerable"}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>BEAST Attack</strong></td>
                      <td>
                        {endpoint.details?.beast ? "Vulnerable" : "Safe"}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>POODLE TLS</strong></td>
                      <td>
                        {endpoint.details?.poodleTls ? "Vulnerable" : "Safe"}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>FREAK Attack</strong></td>
                      <td>
                        {endpoint.details?.freak ? "Vulnerable" : "Safe"}
                      </td>
                    </tr>
                    <tr>
                      <td><strong>DROWN Attack</strong></td>
                      <td>
                        {endpoint.details?.drownVulnerable
                          ? "Vulnerable"
                          : "Safe"}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            ))
          ) : (
            <p>No security data available.</p>
          )}
        </Tab> */}

        <Tab eventKey="security" title="Security">
          <Card className="p-3 border-0">
            {/* <h6 className="mb-4">Security</h6> */}

            
            {(() => {
              const aggregated = {
                forwardSecrecy: false,
                ocspStapling: false,
                sessionResumption: false,
                alpn: false,
                sniRequired: false,
               
                heartbleed: false,
                poodle: false,
                freak: false,
                logjam: false,
                drown: false,
                rc4: false,
              };

              endpoints.forEach((ep) => {
                const d = ep.details || {};

                // Forward secrecy 2 and 4 is supported 
                if (
                  typeof d.forwardSecrecy === "number" &&
                  (d.forwardSecrecy >= 2 || d.forwardSecrecy === 4)
                ) {
                  aggregated.forwardSecrecy = true;
                }

                if (d.ocspStapling) aggregated.ocspStapling = true;
                if (d.sessionResumption) aggregated.sessionResumption = true;
                if (d.alpnProtocols && d.alpnProtocols.length > 0)
                  aggregated.alpn = true;
                if (d.sniRequired) aggregated.sniRequired = true;

                
                if (d.heartbleed) aggregated.heartbleed = true;
                if (d.poodleTls || d.poodle) aggregated.poodle = true;
                if (d.freak) aggregated.freak = true;
                if (d.logjam) aggregated.logjam = true;
                if (d.drownVulnerable || d.drown) aggregated.drown = true;
                if (d.rc4 || d.rc4Support) aggregated.rc4 = true;
              });

             
              if (endpoints) {
                if (endpoints.heartbleed) aggregated.heartbleed = true;
                if (endpoints.poodle) aggregated.poodle = true;
                if (endpoints.freak) aggregated.freak = true;
                if (endpoints.logjam) aggregated.logjam = true;
                if (endpoints.drown) aggregated.drown = true;
                if (endpoints.rc4) aggregated.rc4 = true;
              }

              
              const FeatureRow = ({ label, ok }) => (
                <div className="d-flex align-items-center justify-content-between p-3 mb-3 rounded bg-white shadow-sm">
                  <div>{label}</div>
                  <div>
                    <Badge bg={ok ? "success" : "danger"}>
                      {ok ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              );

              
              const VulnerRow = ({ label, vulnerable }) => (
                <div className="d-flex align-items-center justify-content-between p-3 mb-3 rounded bg-white shadow-sm">
                  <div>{label}</div>
                  <div>
                    <Badge bg={vulnerable ? "danger" : "success"}>
                      {vulnerable ? "Vulnerable" : "Safe"}
                    </Badge>
                  </div>
                </div>
              );

             
              const anyVulns =
                aggregated.heartbleed ||
                aggregated.poodle ||
                aggregated.freak ||
                aggregated.logjam ||
                aggregated.drown ||
                aggregated.rc4;

              return (
                <div className="row">
                 
                  <div className="col-md-6">
                    <h6 className="mb-3">Security Features</h6>
                    <FeatureRow
                      label="Forward Secrecy"
                      ok={aggregated.forwardSecrecy}
                    />
                    <FeatureRow
                      label="OCSP Stapling"
                      ok={aggregated.ocspStapling}
                    />
                    <FeatureRow
                      label="Session Resumption"
                      ok={aggregated.sessionResumption}
                    />
                    <FeatureRow label="ALPN Support" ok={aggregated.alpn} />
                    <FeatureRow
                      label="SNI Required"
                      ok={aggregated.sniRequired}
                    />

                    <h6 className="mt-4">Cipher Suites (Top)</h6>
                    <p className="text-muted">
                      Showing top cipher suites is optional — you can list
                      endpoint.details?.suites
                    </p>
                  </div>

                  
                  <div className="col-md-6">
                    <h6 className="mb-3">Vulnerability Assessment</h6>

                    <VulnerRow
                      label="Heartbleed"
                      vulnerable={aggregated.heartbleed}
                    />
                    <VulnerRow label="POODLE" vulnerable={aggregated.poodle} />
                    <VulnerRow label="FREAK" vulnerable={aggregated.freak} />
                    <VulnerRow label="Logjam" vulnerable={aggregated.logjam} />
                    <VulnerRow label="DROWN" vulnerable={aggregated.drown} />
                    <VulnerRow
                      label="RC4 Support"
                      vulnerable={aggregated.rc4}
                    />

                    
                    <div className="mt-4 p-3 rounded bg-white shadow-sm">
                      <h6>Assessment Summary</h6>
                      {anyVulns ? (
                        <p className="text-danger mb-0">
                          Some vulnerabilities were detected — please review the
                          items above.
                        </p>
                      ) : (
                        <p className="text-success mb-0">
                          No known vulnerabilities detected
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </Card>
        </Tab>
      </Tabs>
      </Card.Body>
    </Card>
  );
}

export default SSLDetailsAnalysis;
