import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react"; 

function BackButton({ label = "Back" }) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="btn btn-outline-light d-flex align-items-center gap-2"
      style={{
        borderRadius: "30px",
        padding: "6px 16px",
        fontWeight: "bold",
      }}
    >
      <ArrowLeft size={18} />
      {label}
    </button>
  );
}

export default BackButton;
