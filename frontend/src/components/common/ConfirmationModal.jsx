import React from 'react';
import '../../styles/components/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, message }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <p>{message || 'Are you sure?'}</p>
        <div className="modal-actions">
          <button className="btn btn-confirm" onClick={onConfirm}>Yes</button>
          <button className="btn btn-cancel" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
