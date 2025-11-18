import React, { useState } from "react";
import { Card, Nav, Tab } from "react-bootstrap";
import ChangePassword from "../../password/changepassword";
import MaxLoginAttempts from "./MaxLoginAttempts";
import PasswordExpiry from "./PasswordExpiry";
import LimitedAccess from "./limitedIPaccess";

function Settings() {
  const [activeTab, setActiveTab] = useState("change-password");

  return (
    <div className="container mt-4">
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-primary text-white">
          <h4 className="mb-0">Settings</h4>
        </Card.Header>
        <Card.Body className="p-0">
          <Tab.Container
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Nav variant="tabs" className="px-3 pt-3">
              <Nav.Item>
                <Nav.Link eventKey="change-password">Change Password</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="max-login-attempts">
                  Max Login Attempts
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="password-expiry">Password Expiry</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="limited-access">Limited Access</Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="p-4">
              <Tab.Pane eventKey="change-password">
                <ChangePassword />
              </Tab.Pane>
              <Tab.Pane eventKey="max-login-attempts">
                <MaxLoginAttempts />
              </Tab.Pane>
              <Tab.Pane eventKey="password-expiry">
                <PasswordExpiry />
              </Tab.Pane>
              <Tab.Pane eventKey="limited-access">
                <LimitedAccess />
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Settings;
