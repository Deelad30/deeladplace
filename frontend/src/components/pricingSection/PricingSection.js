import { FaRocket } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import '../../../src/styles/components/PricingSection.css';


function PricingSection({ user }) {

   const navigate = useNavigate();

  const handlePayment = async (planType) => {
    const amount = planType === 'pro' ? 10000 : 20000;

    const response = await axios.post('http://localhost:5000/api/paystack/initialize', {
      email: user.email,
      amount,
      planType,
      userId: user.id,
    });

    window.location.href = response.data.data.authorization_url;
  };

  return (
    <div className="pricing-section fade-in">
      <h2>Choose Your Plan</h2>
      <div className="pricing-table">
        <div className="pricing-card pro">
          <h3>Pro</h3>
          <p style={{ color: "#000"}} className="price">
            ₦10,000<span>/month</span>
          </p>
          <ul>
            <li>✔ POS (Sales Sheet)</li>
            <li>✔ Cost Analysis Module</li>
            <li>✔ Profit Reconciliation</li>
            <li>✔ Expense Management</li>
            <li>✔ Cloud Backup</li>
            <li>✔ Basic Analytics</li>
          </ul>
          <button onClick={() => handlePayment('pro')} className="signup-btn">Get Started</button>
        </div>

        <div className="pricing-card enterprise">
          <h3>Enterprise</h3>
          <p style={{ color: "#000"}}  className="price">
            ₦20,000<span>/month</span>
          </p>
          <ul>
            <li>
              <FaRocket className="icon" />{" "}
              <span>Everything in Pro is included</span>
            </li>
            <li>✔ Short Interval Control (Stock Flow)</li>
            <li>✔ Check Sheet (Loss & Discrepancy Tracking)</li>
            <li>✔ Multi-Store / Multi-Vendor Access</li>
            <li>✔ Custom Reports & Dashboards</li>
            <li>✔ Priority Support & Staff Training</li>
          </ul>
          <button onClick={() => handlePayment('enterprise')} className="signup-btn enterprise-btn">Get Started</button>
        </div>
      </div>
    </div>
  );
}

export default PricingSection;