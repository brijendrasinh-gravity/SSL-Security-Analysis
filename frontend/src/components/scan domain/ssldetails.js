import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import API from "../../api/api";
import SecurityGradeAnalysis from "../result components/securitygradeanalysis";
import CertificateStatus from "../result components/certificateStatus";
import Securityissues from "../result components/securityissues";
import SSLdetailanalysis from "../result components/ssldetailsanalysis";
import CertificateTransparencyAnalysis from "../result components/certificateanalysis";

function SslReportDetails({ backButton }) {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) 
      // eslint-disable-next-line
      fetchReportById();
  }, [id]);

  const fetchReportById = async () => {
    try {
      const response = await API.get(`/sslanalysis/getreportbyid/${id}`);
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="grow" /> <p>Loading report details...</p>
      </div>
    );

  if (!report) return <p className="text-center mt-5">Report not found.</p>;

  const result = {
    ssllabs:
      typeof report.ssllabs === "string"
        ? JSON.parse(report.ssllabs)
        : report.ssllabs || {},
    certificateTransparency:
      typeof report.certificateTransparency === "string"
        ? JSON.parse(report.certificateTransparency)
        : report.certificateTransparency || {},
  };

  return (
    <div className="container mt-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
        <div>
          <h4 className="mb-0 fw-bold text-primary">SSL Report Details</h4>
          <small className="text-muted">{report.domain}</small>
        </div>
        {backButton}
      </div>

      <SecurityGradeAnalysis result={result} />
      <CertificateStatus result={result} />
      <Securityissues result={result} />
      <SSLdetailanalysis result={result} />
      <CertificateTransparencyAnalysis result={result} />
    </div>
  );
}

export default SslReportDetails;
