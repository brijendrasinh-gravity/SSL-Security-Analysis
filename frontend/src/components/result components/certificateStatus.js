import React, { useState } from "react";
import { Badge, Button, Card, Col, Row } from "react-bootstrap";

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

        <Card className="p-4 mt-4 shadow-sm" >
            <h5>Certificate Status</h5>
            <Row className="mt-3">
                <Col md={3} className="text-center">
                <Badge bg="success" className="mb-2">Valid</Badge>
                <p className="fw-bolder">Expires in</p>
                <h2>{validDays}</h2>
                <small>Expires on: {new Date(cert.notAfter).toDateString()}</small>
                </Col>

                <Col md={9} >
                <Row>
                    <Col md={6}>
                    <p><strong>Subject</strong> {cert.subject || "NA"} </p>
                    <p><strong>Issued by</strong> {cert.issuerSubject || "NA"} </p>
                    <p><strong>Algorithm</strong> {cert.keyAlg || "NA"} </p>
                    <p><strong>Key Size</strong> {cert.keySize || "NA"} bits</p>
                    </Col>
                    <Col md={6} >
                    <p><strong>Valid From</strong>{new Date(cert.notBefore).toDateString()}</p>
                    <p><strong>Certificate Chain</strong>{cert.issues ? "has issues":"Ok"}</p>
                    <p><strong>Alternative Names</strong></p>
                    {cert.altNames &&
                    cert.altNames.slice(0,loadname).map((name,i)=>(
                        <Badge bg="light" text="secondary" className="me-1" key={i}>
                            {name}
                        </Badge>
                    ))
                    }
                    {
                        cert.altNames && loadname < cert.altNames.length && (
                            <div className="mt-1">
                                <Button  
                                size="sm"
                                onClick={handlealternatename}
                                >
                                    load more 
                                </Button>
                            </div>
                        )
                    }
                    </Col>
                </Row>
                </Col>



                </Row>  


        </Card>
    )
}

export default CertificateStatus;