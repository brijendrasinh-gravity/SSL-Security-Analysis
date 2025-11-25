import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Button, Alert } from "react-bootstrap";
import { RefreshCw } from "lucide-react";
import API from "../../api/api";
import SecurityGradeAnalysis from "../result components/securitygradeanalysis";
import CertificateStatus from "../result components/certificateStatus";
import Securityissues from "../result components/securityissues";
import SSLdetailanalysis from "../result components/ssldetailsanalysis";
import CertificateTransparencyAnalysis from "../result components/certificateanalysis";

// Add inline styles for spin animation
const styles = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spin-animation {
    animation: spin 1s linear infinite;
  }
`;

function SslReportDetails({ backButton }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rescanning, setRescanning] = useState(false);
  const [rescanError, setRescanError] = useState(null);
  const [rescanSuccess, setRescanSuccess] = useState(false);

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

  const handleRescan = async () => {
    if (!id) return;

    setRescanning(true);
    setRescanError(null);
    setRescanSuccess(false);

    try {
      const response = await API.post(`/sslanalysis/rescan/${id}`);
      
      if (response.data.success) {
        setRescanSuccess(true);
        
        // Redirect to the new report after a short delay
        setTimeout(() => {
          navigate(`/scan/details/${response.data.newReportId}`);
          window.location.reload(); // Refresh to load new data
        }, 1500);
      }
    } catch (error) {
      console.error("Error rescanning domain:", error);
      setRescanError(
        error.response?.data?.message || 
        "Failed to rescan domain. Please try again."
      );
    } finally {
      setRescanning(false);
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
    <>
      <style>{styles}</style>
      <div className="container mt-4">
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded shadow-sm">
          <div>
            <h4 className="mb-0 fw-bold text-primary">SSL Report Details</h4>
            <small className="text-muted">{report.domain}</small>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={handleRescan}
              disabled={rescanning}
              className="d-flex align-items-center gap-2"
            >
              <RefreshCw size={16} className={rescanning ? "spin-animation" : ""} />
              {rescanning ? "Rescanning..." : "Rescan Domain"}
            </Button>
            {backButton}
          </div>
        </div>

      {/* Rescan Status Messages */}
      {rescanSuccess && (
        <Alert variant="success" dismissible onClose={() => setRescanSuccess(false)}>
          <strong>Success!</strong> Rescan completed. Redirecting to new report...
        </Alert>
      )}

      {rescanError && (
        <Alert variant="danger" dismissible onClose={() => setRescanError(null)}>
          <strong>Error!</strong> {rescanError}
        </Alert>
      )}

      {rescanning && (
        <Alert variant="info" className="d-flex align-items-center gap-2">
          <Spinner animation="border" size="sm" />
          <span>
            Rescanning domain... This may take up to 30 seconds. Please wait.
          </span>
        </Alert>
      )}

        <SecurityGradeAnalysis result={result} />
        <CertificateStatus result={result} />
        <Securityissues result={result} />
        <SSLdetailanalysis result={result} />
        <CertificateTransparencyAnalysis result={result} />
      </div>
    </>
  );
}

export default SslReportDetails;
