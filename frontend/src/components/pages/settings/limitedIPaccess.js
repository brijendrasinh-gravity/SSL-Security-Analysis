import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, InputGroup, ListGroup } from "react-bootstrap";
import API from "../../../api/api";
import { toast } from "react-toastify";
import { Trash2, Plus } from "lucide-react";

function LimitedAccess() {
  const [toggleOn, setToggleOn] = useState(false); 
  const [ipInput, setIpInput] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    try {
      const res = await API.get("/settings/get-settings");
      if (res.data.success) {
        const data = res.data.data || {};
        let raw = data.LIMITED_POWERPANEL_ACCESS || "[]";

        try {
          raw = JSON.parse(raw);
          if (!Array.isArray(raw)) raw = [];
        } catch {
          raw = String(raw).split(",").map(s => s.trim()).filter(Boolean);
        }

        setList(raw);
        setToggleOn(raw.length > 0); // UI toggle reflects presence of items
      }
    } catch (err) {
      console.error("Error loading limited access:", err);
      toast.error("Failed to load limited access settings");
    } finally {
      setFetching(false);
    }
  };

  const addIP = () => {
    const ip = ipInput.trim();
    if (!ip) return toast.error("Enter a valid IP");
    if (list.includes(ip)) return toast.info("IP already exists");

    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipv4Regex.test(ip)) return toast.error("Enter a valid IPv4 address");

    setList(prev => [...prev, ip]);
    setIpInput("");
    setToggleOn(true);
  };

  const removeIP = (ip) => {
    setList(prev => prev.filter(i => i !== ip));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // If toggle is OFF -> we treat that as "no whitelist" => save empty array
      const toSave = toggleOn ? list : [];

      await API.put("/settings/update-setting", {
        field_name: "LIMITED_POWERPANEL_ACCESS",
        field_value: JSON.stringify(toSave),
      });

      toast.success("Limited access settings saved");
      setToggleOn(toSave.length > 0);
    } catch (err) {
      console.error("Error saving limited access:", err);
      toast.error("Failed to save limited access settings");
    } finally {
      setLoading(false);
    }
  };

  // Quick UI: pressing Enter in input adds IP
  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIP();
    }
  };

  return (
    <div>
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h5 className="fw-bold text-primary">Limited Powerpanel Access</h5>
        <Form.Check
          type="switch"
          id="limited-access-switch"
          label={toggleOn ? "ON" : "OFF"}
          checked={toggleOn}
          onChange={() => setToggleOn(!toggleOn)}
        />
      </div>

      <Row>
        <Col md={8}>
          <Card className="mb-3">
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Allowed IPs</Form.Label>
                <InputGroup>
                  <Form.Control
                    placeholder="Enter IPv4 e.g. 103.254.35.218"
                    value={ipInput}
                    onChange={(e) => setIpInput(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                  <Button variant="primary" onClick={addIP}>
                    <Plus size={14} /> Add
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Toggle ON to enable limited access. To disable, toggle OFF and Save.
                </Form.Text>
              </Form.Group>

              <ListGroup className="mb-3">
                {list.length === 0 && <ListGroup.Item className="text-muted">No IPs added</ListGroup.Item>}
                {list.map((ip) => (
                  <ListGroup.Item key={ip} className="d-flex justify-content-between align-items-center">
                    <div><strong>{ip}</strong></div>
                    <div>
                      <Button variant="outline-danger" size="sm" onClick={() => removeIP(ip)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>

              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline-secondary" onClick={fetchSettings} disabled={loading}>
                  Reset
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="border-primary">
            <Card.Header className="bg-primary text-white">
              <strong>How It Works</strong>
            </Card.Header>
            <Card.Body>
              <ol className="mb-0 ps-3">
                <li className="mb-2">Toggle ON then Save to enable limited access (only listed IPs allowed).</li>
                <li className="mb-2">Toggle OFF then Save to disable limited access for everyone.</li>
                <li className="mb-2">Only the IP list is stored in DB; no boolean flag is stored.</li>
                <li className="mb-0">If you enable without adding your own IP, you may lock yourself out.</li>
              </ol>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default LimitedAccess;