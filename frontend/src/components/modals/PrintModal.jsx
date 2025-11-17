import React from "react";
import "./PrintModal.css";

const PrintModal = ({ visible, onClose, children }) => {
  if (!visible) return null;

  return (
    <div  className="print-overlay">
      <div  className="print-box">
        {children}

        <button className="print-close" onClick={onClose}>Close</button>

        <button
          className="print-btn"
          onClick={() => window.print()}
        >
          Print Now
        </button>
      </div>
    </div>
  );
};

export default PrintModal;
