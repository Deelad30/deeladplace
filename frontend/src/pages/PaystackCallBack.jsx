// src/pages/PaystackCallback.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function PaystackCallback() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('Validating payment...');

  useEffect(() => {
    const verifyPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get("reference");

      if (!reference) {
        setMessage('No reference found, redirecting to checkout...');
        setTimeout(() => navigate('/checkout'), 1500);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/paystack/verify/${reference}`);
        if (res.data.status === 'success') {
          setMessage('Payment successful. Redirecting...');
          // Optionally refresh user state here or fetch updated profile
          setTimeout(() => navigate('/'), 1200);
        } else {
          setMessage('Payment failed or not completed. Redirecting to checkout...');
          setTimeout(() => navigate('/checkout'), 1200);
        }
      } catch (err) {
        console.error('Callback verify error', err);
        setMessage('Error verifying payment. Redirecting to checkout...');
        setTimeout(() => navigate('/checkout'), 1200);
      }
    };

    verifyPayment();
  }, [navigate]);

  return (
    <div style={{ padding: 20 }}>
      <h3>{message}</h3>
    </div>
  );
}
