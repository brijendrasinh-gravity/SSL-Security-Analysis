import React from "react";
import { Badge, Card, Col, Row } from "react-bootstrap";

function SecurityGradeAnalysis({ result }) {
  if (!result?.ssllabs) return null;

  const endpoints = result.ssllabs.endpoints || [];
  const bestGrade = endpoints[0]?.grade || "NA";

  return (
    <Card className="p-4 mt-4 shadow-sm">
      <h5 className="fw-bolder">Security Grade Analysis</h5>
      <Row className="mt-3 align-items-center">
        <Col md={3} className="text-center">
          <h1 className="display-4 text-success fw-bolder">{bestGrade}</h1>
          <p className="fw-bolder text-muted">Strong security configuration</p>
        </Col>
        <Col md={3} className="text-center border-start">
          <p className=" text-muted fw-bolder mb-0">Endpoints Analyzed</p>
          <h2>{endpoints.length}</h2>
          <div className="text-muted">Multiple endpoints</div>
        </Col>

        <Col md={6} className="border-start"
        style={{
          maxHeight:'300px',
          overflowY:'auto',
          overflowX:'hidden',
          borderRadius:'8px'
        }}
        >
        <h6 className="position-sticky top-0" style={{zIndex: 2}}>Endpoint Details</h6>
          {endpoints.map((e, index) => (
            <Card key={index} className="p-2 mb-2">
              <Row>
                <Col xs={8}>
                  <small>{e.ipAddress}</small>
                </Col>
                <Col xs={4} className="text-end">
                  <Badge bg="success">{e.grade || "NA"}</Badge>
                </Col>
              </Row>
              {e.serverName && (
                <small className="text-muted">{e.serverName}</small>
              )}
            </Card>
          ))}
        </Col>
      </Row>
    </Card>
  );
}

export default SecurityGradeAnalysis;
