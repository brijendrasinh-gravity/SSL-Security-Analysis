import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function BackButton({ label = "Back", to = null, variant = "light" }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to); 
    } else {
      navigate(-1); 
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`btn btn-outline-${variant} d-flex align-items-center gap-2`}
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
