import React from 'react';
import './Modal.css';

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div style={{
           background:"white",
          padding: "45px",
          borderRadius: "13px",
          width: "500px",
          maxWidth: "90vw",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"  
        }}
         className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header
        style={{
          marginBottom:"20px"
        }}
        >
          <h3>{title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
