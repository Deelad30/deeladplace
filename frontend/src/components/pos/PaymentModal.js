import React, { useState } from 'react';

const PaymentModal = ({ isOpen, onClose, total, onProcessPayment }) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onProcessPayment(paymentMethod);
  };

  return (
    <div className="modal-overlay">
      <div className="payment-modal">
        <h3>Process Payment</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Payment Method:</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>
          
          <div className="payment-total">
            Total Amount: {total}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit">Confirm Payment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;