import React from "react";
import "./SuccessModal.css";

const SuccessModal = ({ visible, onClose, onPrint }) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="success-circle">
          <div className="success-check"></div>
        </div>

        <h2>Sale Completed</h2>
        <p>Your order has been successfully processed.</p>

        <div className="modal-actions">
          <button className="primary-btn" onClick={onPrint}>
            Download Receipt
          </button>

          <button className="secondary-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
