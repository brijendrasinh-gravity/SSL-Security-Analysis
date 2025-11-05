import React from "react";
import { Alert, Badge, Card } from "react-bootstrap";

function Securityissues({ result }) {
  const endpoints = result?.ssllabs?.endpoints || [];
  const issues = endpoints.filter((e) => e.grade !== "A");

  return (
    <Card className="p-4 mt-4 shadow-sm">
      <h5>Security Issues</h5>
      {issues.length === 0 ? (
        <Alert variant="success" className="mt-3">
          <strong>No Critical Issues Found</strong>
          <p className="mb-0">
            SSL configuration appears secure and well-configured
          </p>
        </Alert>
      ) : (
        <Alert variant="danger" className="mt-3">
          <strong>Issues detected</strong>
          {issues.map((e, i) => (
            <p key={i} className="mb-1">
              {e.ipAddress} - Grade:{""}
              <Badge bg="warning">{e.grade || "NA"}</Badge>
            </p>
          ))}
        </Alert>
      )}
      <div className="mt-3">
        <h6>Security Recommendations</h6>
        <ul>
          <li>Enable OCSP Stapling</li>
          {/* <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-700 rounded-lg p-4"><div className="flex items-start">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                        <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">Enable OCSP Stapling</div></div></div> */}
          <li>Review exposed subdomains for security</li>
        </ul>
      </div>
    </Card>
  );
}

export default Securityissues;