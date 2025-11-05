import React, { useState } from "react";
import API from "../api/api";
import { Button, Card, Form, Spinner } from "react-bootstrap";


function SearchDomain() {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain.trim()) {
      alert("please enter domain");
      return;
    }
    setLoading(true);
    setResult(null);

    try {
      const res = await API.post("/sslanalysis/security", { domain });
      setResult(res.data);
      localStorage.setItem("ssl_result", JSON.stringify(res.data));
      const existinghistory = JSON.parse(localStorage.getItem("ssl-search-history")) || [];
      const historyupdated = [domain, ...existinghistory.filter((e)=> e !== domain)]
      localStorage.setItem('ssl-search-history', JSON.stringify(historyupdated));
      console.log(domain, "save in localstorage history")

      console.log(res.data?.crtsh);
    } catch (err) {
      console.error("error fetching analysis", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <Card className="p-4 shadow-sm bg-light">
        <h4 className="mb-3 text-center">SSL Security Analysis</h4>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Control
              type="text"
              placeholder="Enter domain name (e.g., google.com)"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            ></Form.Control>
          </Form.Group>
          <div className="text-center mt-3">
            {/* <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <Spinner animation="border" size="sm" />
              ) : (
                "Analyzing..."
              )}
            </Button> */}
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Spinner animation="grow" size="sm" className="me-2" />
                  Analyzing...
                </>
              ) : (
                "Analyze SSL"
              )}
            </Button>
          </div>
        </Form>

        {result && (
          <>
            <div className="mt-4">
              {/* <h5>Domain:{result.domain}</h5> */}
              <p className="text-center">Polled Attempts: {result.polledAttempts}</p>
              <p className="fw-bold text-center">Your search is successfully completed </p>
            </div>
            {/* <SecurityGradeAnalysis result={result} />
            <CertificateStatus result={result} />
            <Securityissues result={result} />
            <SSLdetailanalysis result={result} />
            <CertificateTransparencyAnalysis result={result} /> */}
          </>
        )}
      </Card>
    </div>
  );
}

export default SearchDomain;

