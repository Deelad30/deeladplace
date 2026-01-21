import React from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';
import '../styles/components/PaymentSuccessModal.css';

const PaymentSuccessModal = ({ isOpen, onClose, planName, status = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="payment-modal-overlay">
      <div className="payment-modal-content fade-in-up">
        {status !== 'loading' && (
             <button className="psm-close-btn" onClick={onClose}><FaTimes /></button>
        )}
        
        {status === 'loading' ? (
             <div className="calendar-modal-content">
                <div className="psm-spinner"></div>
                <h2>Verifying Payment...</h2>
                <p>Please wait while we confirm your transaction.</p>
             </div>
        ) : (
            <>
                <div className="psm-icon-wrapper">
                    <FaCheckCircle className="psm-success-icon" />
                </div>
                
                <h2>Payment Successful!</h2>
                <p>You have successfully subscribed to the <strong>{planName}</strong> plan.</p>
                
                <div className="modal-actions">
             <a href="/dashboard"><button className="psm-continue-btn" onClick={onClose}>
                    Go to Dashboard
                </button></a>  
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccessModal;
