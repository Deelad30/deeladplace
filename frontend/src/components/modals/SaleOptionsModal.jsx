import React, { useState } from "react";
import "./SaleOptionsModal.css";

const SaleOptionsModal = ({ visible, onClose, onFinish, totals }) => {
  const [customerType, setCustomerType] = useState("walk-in");
  const [paymentType, setPaymentType] = useState("cash");
  const [breakdown, setBreakdown] = useState({
    cash: "",
    transfer: "",
    card: ""
  });
  const [notification, setNotification] = useState(null); // { message: '', type: 'error'|'success' }


  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

const handleFinish = () => {
  const saleTotal = totals.total;

  if (paymentType === "multiple") {
    const paymentBreakdown = [
      { method: "cash", amount: breakdown.cash },
      { method: "transfer", amount: breakdown.transfer },
      { method: "card", amount: breakdown.card }
    ]
      .filter(p => p.amount !== "" && p.amount !== null)
      .map(p => ({ ...p, amount: Number(p.amount) }));

    if (paymentBreakdown.some(p => isNaN(p.amount))) {
      showNotification("Please enter valid numbers for all payment fields.", "error");
      return;
    }

    const totalPaid = paymentBreakdown.reduce((sum, p) => sum + p.amount, 0);

    for (const p of paymentBreakdown) {
      if (p.amount > saleTotal) {
        showNotification(`${p.method} amount cannot exceed total sale.`, "error");
        return;
      }
      if (p.amount < 0) {
        showNotification(`${p.method} amount cannot be negative.`, "error");
        return;
      }
    }

    if (totalPaid > saleTotal) {
      showNotification("Total payment cannot exceed the sale total.", "error");
      return;
    }

    if (totalPaid < saleTotal) {
      showNotification("Total payment cannot be less than the sale total.", "error");
      return;
    }

    // Success
    onFinish({
      customer_type: customerType,
      payment_type: paymentType,
      payment_breakdown: paymentBreakdown
    });

    showNotification("Sale completed successfully!", "success");
    setBreakdown({ cash: "", transfer: "", card: "" });

  } else {
    // Single payment types
    onFinish({
      customer_type: customerType,
      payment_type: paymentType,
      payment_breakdown: [{ method: paymentType, amount: saleTotal }]
    });

    showNotification("Sale completed successfully!", "success");
  }
};


  const handleNumericInput = (e, field) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setBreakdown({ ...breakdown, [field]: value });
    }
  };

  return (
    <>
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className={`modal-overlay modal-fade ${visible ? "show" : "hide"}`}>
        <div className="modal-box">
          <h3>Complete Sale</h3>

          <div className="sale-total">
            <strong>Total Sale:</strong> ₦{totals.total.toLocaleString()}
          </div>

          <div className="modal-content">
            <label>Customer Type</label>
            <select value={customerType} onChange={e => setCustomerType(e.target.value)}>
              <option value="walk-in">Walk-in</option>
              <option value="delivery">Online Order</option>
            </select>

            <label>Payment Type</label>
            <select value={paymentType} onChange={e => setPaymentType(e.target.value)}>
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="card">Card</option>
              <option value="multiple">Multiple</option>
            </select>

            {paymentType === "multiple" && (
              <div className="payment-breakdown">
                <label>Cash</label>
                <input
                  type="text"
                  value={breakdown.cash}
                  onChange={e => handleNumericInput(e, "cash")}
                />

                <label>Transfer</label>
                <input
                  type="text"
                  value={breakdown.transfer}
                  onChange={e => handleNumericInput(e, "transfer")}
                />

                <label>Card</label>
                <input
                  type="text"
                  value={breakdown.card}
                  onChange={e => handleNumericInput(e, "card")}
                />
              </div>
            )}
          </div>

          <div className="modal-buttons">
            <button className="finish-btn" onClick={handleFinish}>Finish Sale</button>
            <button className="cancel-btn" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SaleOptionsModal;
