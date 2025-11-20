import React from 'react';
import './Toast.css';

const Toast = ({ message, type = 'success', onClose }) => {
  return (
    <div className={`toast ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}>&times;</button>
    </div>
  );
};

export default Toast;
