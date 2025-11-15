// src/components/PricingSection.jsx
import { FaRocket } from "react-icons/fa";
import axios from "axios";
import { useState } from "react";

import '../../../src/styles/components/PricingSection.css';

function PricingSection({ user }) {
  const [loadingPlan, setLoadingPlan] = useState(null);

  const handleSubscription = async (planType) => {
    setLoadingPlan(planType);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/paystack/create-subscription",
        {
          userId: user.user.id,
          planType,
          customerEmail: user.user.email,
        }
      );

      const data = response.data;
      // If Paystack needs the user to pay / add card
      if (data.success === false && data.authorization_url) {
        // Redirect to Paystack checkout page
        window.location.href = data.authorization_url;
        return;
      }

      // Subscription created immediately (saved card)
      if (data.success === true && data.subscription) {
        alert(`Subscription created for ${planType} plan!`);
        // Optionally reload user data or update UI
        return;
      }

      // Unexpected response
      console.warn('Unexpected response', data);
      alert('Unexpected response from server. Check console.');
    } catch (err) {
      console.error("Subscription creation failed:", err.response?.data || err.message);
      alert("Subscription creation failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="pricing-section fade-in">
      <h2>Choose Your Plan</h2>
      <div className="pricing-table">

        {/* PRO Plan */}
        <div className="pricing-card pro">
          <h3>Pro</h3>
          <p className="price" style={{ color: "#000" }}>₦10,000<span>/month</span></p>
          <ul>
            <li>✔ POS (Sales Sheet)</li>
            <li>✔ Cost Analysis Module</li>
            <li>✔ Profit Reconciliation</li>
            <li>✔ Expense Management</li>
            <li>✔ Cloud Backup</li>
            <li>✔ Basic Analytics</li>
          </ul>
          <button
            onClick={() => handleSubscription("pro")}
            className="signup-btn"
            disabled={loadingPlan === "pro"}
          >
            {loadingPlan === "pro" ? "Processing..." : "Subscribe"}
          </button>
        </div>

        {/* ENTERPRISE Plan */}
        <div className="pricing-card enterprise">
          <h3>Enterprise</h3>
          <p className="price" style={{ color: "#000" }}>₦20,000<span>/month</span></p>
          <ul>
            <li><FaRocket className="icon" /> Everything in Pro is included</li>
            <li>✔ Short Interval Control (Stock Flow)</li>
            <li>✔ Check Sheet (Loss & Discrepancy Tracking)</li>
            <li>✔ Multi-Store / Multi-Vendor Access</li>
            <li>✔ Custom Reports & Dashboards</li>
            <li>✔ Priority Support & Staff Training</li>
          </ul>
          <button
            onClick={() => handleSubscription("enterprise")}
            className="signup-btn enterprise-btn"
            disabled={loadingPlan === "enterprise"}
          >
            {loadingPlan === "enterprise" ? "Processing..." : "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PricingSection;
