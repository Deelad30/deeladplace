import { FaRocket } from "react-icons/fa";
import { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../../../src/styles/components/PricingSection.css';

function PricingSection({ user }) {
  const navigate = useNavigate();

  const [loadingPlan, setLoadingPlan] = useState(null);

  const handlePayment = async (planType) => {
    setLoadingPlan(planType);
    const amount = planType === 'pro' ? 10000 : 20000;

    try {
      const response = await axios.post('http://localhost:5000/api/paystack/initialize', {
        email: user.email,
        amount,
        planType,
        userId: user.id,
      });

      // Open Paystack inline modal
      const handler = window.PaystackPop.setup({
        key: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY, // your public key
        email: user.email,
        amount: amount * 100,
        onClose: function () {
          alert('Payment window closed.');
          setLoadingPlan(null);
        },
        callback: function (response) {
          // Handle successful payment here
         setLoadingPlan(null);
          navigate(`/payment/success?reference=${response.reference}`);
        },
      });

      handler.openIframe(); // opens modal
      setTimeout(() => setLoadingPlan(null), 1000);
    } catch (error) {
      console.error('Payment initialization error:', error);
      alert('Failed to initialize payment.');
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pricing-section fade-in">
      <h2>Choose Your Plan</h2>
      <div className="pricing-table">
        <div className="pricing-card pro">
          <h3>Pro</h3>
          <p style={{ color: "#000"}} className="price">₦10,000<span>/month</span></p>
          <ul>
            <li>✔ POS (Sales Sheet)</li>
            <li>✔ Cost Analysis Module</li>
            <li>✔ Profit Reconciliation</li>
            <li>✔ Expense Management</li>
            <li>✔ Cloud Backup</li>
            <li>✔ Basic Analytics</li>
          </ul>
          <button
            onClick={() => handlePayment('pro')}
            className="signup-btn"
            disabled={loadingPlan === 'pro'}
          >
            {loadingPlan === 'pro' ? 'Initializing...' : 'Get Started'}
          </button>
        </div>

        <div className="pricing-card enterprise">
          <h3>Enterprise</h3>
          <p style={{ color: "#000"}} className="price">₦20,000<span>/month</span></p>
          <ul>
            <li><FaRocket className="icon" /> Everything in Pro is included</li>
            <li>✔ Short Interval Control (Stock Flow)</li>
            <li>✔ Check Sheet (Loss & Discrepancy Tracking)</li>
            <li>✔ Multi-Store / Multi-Vendor Access</li>
            <li>✔ Custom Reports & Dashboards</li>
            <li>✔ Priority Support & Staff Training</li>
          </ul>
          <button
            onClick={() => handlePayment('enterprise')}
            className="signup-btn enterprise-btn"
            disabled={loadingPlan === 'enterprise'}
          >
            {loadingPlan === 'enterprise' ? 'Initializing...' : 'Get Started'}
          </button>
         </div>
      </div>
    </div>
  );
}

export default PricingSection;
