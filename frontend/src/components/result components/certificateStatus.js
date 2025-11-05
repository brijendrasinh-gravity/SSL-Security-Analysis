import { useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { Shield, Calendar, Key, Award } from "lucide-react";

function CertificateStatus({result}){
    const [loadname, setLoadName] = useState(5);

    const cert = result?.ssllabs?.certs?.[0];

    if(!cert) return null;

    const validDays = Math.ceil(
        (new Date(cert.notAfter) - new Date()) / (1000*60*60*24)
    )

    const handlealternatename =() =>{
        setLoadName((preview)=> preview + 5);
    }


    return(

        <Card className="shadow-sm border-0 mt-4">
          <Card.Body className="p-4">
            <div className="d-flex align-items-center mb-4">
              <div className="bg-success bg-opacity-10 rounded d-flex align-items-center justify-content-center me-3" style={{ width: '40px', height: '40px' }}>
                <Shield className="text-success" size={20} />
              </div>
              <h5 className="fw-bold mb-0">Certificate Status</h5>
            </div>
            <Row>
                <Col md={3}>
                  <Card className="border-0 bg-light text-center p-3">
                    <Badge bg="success" className="mb-2 py-2">Valid</Badge>
                    <p className="fw-semibold mb-2">Expires in</p>
                    <h2 className="fw-bold text-primary mb-2">{validDays}</h2>
                    <small className="text-muted">days</small>
                    <hr className="my-3" />
                    <small className="text-muted">
                      <Calendar size={14} className="me-1" />
                      {new Date(cert.notAfter).toDateString()}
                    </small>
                  </Card>
                </Col>

                <Col md={9}>
                  <Row className="g-3">
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Subject</small>
                        <p className="fw-semibold mb-0">{cert.subject || "N/A"}</p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Issued By</small>
                        <p className="fw-semibold mb-0">{cert.issuerSubject || "N/A"}</p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">
                          <Key size={14} className="me-1" />
                          Algorithm
                        </small>
                        <p className="fw-semibold mb-0">{cert.keyAlg || "N/A"}</p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Key Size</small>
                        <p className="fw-semibold mb-0">{cert.keySize || "N/A"} bits</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Valid From</small>
                        <p className="fw-semibold mb-0">{new Date(cert.notBefore).toDateString()}</p>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-1">Certificate Chain</small>
                        <Badge bg={cert.issues ? "danger" : "success"}>
                          {cert.issues ? "Has Issues" : "OK"}
                        </Badge>
                      </div>
                      <div className="mb-3">
                        <small className="text-muted d-block mb-2">Alternative Names</small>
                        <div className="d-flex flex-wrap gap-2">
                          {cert.altNames &&
                            cert.altNames.slice(0,loadname).map((name,i)=>(
                              <Badge bg="light" text="dark" className="px-2 py-1" key={i}>
                                {name}
                              </Badge>
                            ))
                          }
                        </div>
                        {cert.altNames && loadname < cert.altNames.length && (
                          <div className="mt-2">
                            <Button  
                              variant="outline-primary"
                              size="sm"
                              onClick={handlealternatename}
                            >
                              Load More
                            </Button>
                          </div>
                        )}
                      </div>
                    </Col>
                  </Row>
                </Col>
            </Row>
          </Card.Body>
        </Card>
    )
}

export default CertificateStatus;