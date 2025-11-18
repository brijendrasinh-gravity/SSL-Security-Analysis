import React, { useState, useEffect } from "react";
import { Modal, Button, Alert } from "react-bootstrap";
import { AlertTriangle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PasswordReminderModal() {
  const [show, setShow] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const reminderData = localStorage.getItem("passwordReminder");
    if (reminderData) {
      const data = JSON.parse(reminderData);
      if (data.show) {
        setDaysRemaining(data.daysRemaining);
        setShow(true);
        // Clear the reminder flag
        localStorage.removeItem("passwordReminder");
      }
    }
  }, []);

  const handleChangePassword = () => {
    setShow(false);
    navigate("/change-password");
  };

  const handleRemindLater = () => {
    setShow(false);
  };

  return (
    <Modal show={show} onHide={handleRemindLater} centered backdrop="static">
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title className="d-flex align-items-center gap-2">
          <AlertTriangle size={24} />
          Password Expiration Warning
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="d-flex align-items-start gap-2 mb-3">
          <Clock size={20} className="mt-1" />
          <div>
            <strong>Your password will expire in {daysRemaining} day{daysRemaining !== 1 ? 's' : ''}!</strong>
            <p className="mb-0 mt-2">
              For security reasons, please change your password before it expires. 
              After expiration, you will be required to change it before accessing the system.
            </p>
          </div>
        </Alert>
        
        <div className="text-muted small">
          <p className="mb-1">
            <strong>Why change your password regularly?</strong>
          </p>
          <ul className="mb-0">
            <li>Protects against unauthorized access</li>
            <li>Reduces risk of compromised credentials</li>
            <li>Maintains system security standards</li>
          </ul>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleRemindLater}>
          Remind Me Later
        </Button>
        <Button variant="warning" onClick={handleChangePassword}>
          Change Password Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default PasswordReminderModal;
