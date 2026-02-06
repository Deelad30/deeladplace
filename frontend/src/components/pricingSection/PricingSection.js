// src/components/PricingSection.jsx
import { FaRocket } from "react-icons/fa";
import axios from "axios";
import { useState } from "react";
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import PaymentSuccessModal from '../PaymentSuccessModal';

import '../../../src/styles/components/PricingSection.css';

// Key provided by user (Test Mode). Ideally move to .env
const FLUTTERWAVE_PUBLIC_KEY = process.env.REACT_APP_FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-55d667890873bb104a707f2295eb782c-X';

const PLAN_IDS = {
  basic: '153403',
  pro: '153404'
  // annual plans don't have IDs yet, so will be one-time charges
};

// Helper Button Component to handle individual configs
const SubscribeButton = ({ user, planType, amount, billingCycle, className, children, onStatusChange }) => {
  const isMonthly = billingCycle === 'monthly';
  // Use plan ID only for monthly (recurring). Annual is one-time for now.
  const planId = isMonthly ? PLAN_IDS[planType] : null;

  const config = {
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: `tx_${planType}_${billingCycle}_${Date.now()}`,
    amount: amount,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd',
    ...(planId && { payment_plan: planId }), // Only add payment_plan if checking out monthly
    customer: {
      email: user?.email,
      phone_number: user?.phone || '',
      name: user?.name || user?.email,
    },
    customizations: {
      title: 'Deelad Place Subscription',
      description: `${planType.toUpperCase()} (${billingCycle}) Plan Subscription`,
      logo: 'https://deeladplace-production.up.railway.app/logo.png',
    },
  };

  const handleFlutterwavePayment = useFlutterwave(config);

  const verifyTransaction = async (transaction_id) => {
      // Determine the actual backend plan type key (e.g., 'basic' or 'basic_annual')
      const backendPlanType = isMonthly ? planType : `${planType}_annual`;
      
      console.log("Verifying Transaction:", { transaction_id, backendPlanType, userId: user.id });
      try {
          // USE LOCALHOST FOR TESTING
          // const API_URL = "https://deeladplace-production.up.railway.app"; 
          const API_URL = "http://localhost:5000"; 
          
          const res = await axios.post(`${API_URL}/api/flutterwave/verify`, {
              transaction_id,
              planType: backendPlanType,
              userId: user.id
          });

          if (res.data.success) {
              onStatusChange('success', planType); // Update to Success
          } else {
              alert(`Verification failed: ${res.data.error || "Unknown error"}`);
             // OPTIONAL: onStatusChange('error', planType); could handle error in modal too
          }
      } catch (err) {
          console.error("Verification Error:", err);
          const errorMessage = err.response?.data?.error || err.message;
          alert(`Error verifying payment: ${errorMessage}`);
      }
  };

  const onClick = () => {
    handleFlutterwavePayment({
      callback: (response) => {
        closePaymentModal();
        if (response.status === "successful") {
            onStatusChange('loading', planType); // Show Spinner Immediately
            verifyTransaction(response.transaction_id);
        } else {
            console.log("Payment failed/cancelled", response);
        }
      },
      onClose: () => {
        // Did not complete
      },
    });
  };

  return (
    <button onClick={onClick} className={className}>
      {children}
    </button>
  );
};

function PricingSection({ user }) {
  const [modalState, setModalState] = useState({ isOpen: false, status: 'idle', planName: '' });
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annual'

  const formatPlanName = (type) => {
    if (type === 'basic') return 'Basic'; 
    if (type === 'test') return 'Basic'; 
    if (type === 'pro') return 'Pro';
    return type;
  };

  const handleStatusChange = (status, planType) => {
      setModalState({
          isOpen: true,
          status: status, // 'loading' or 'success'
          planName: formatPlanName(planType)
      });
  };

  const closeSuccessModal = () => {
      setModalState({ isOpen: false, status: 'idle', planName: '' });
      window.location.reload();
  };

  // Pricing Logic
  const basicPrice = billingCycle === 'monthly' ? 10000 : 108000;
  const proPrice = billingCycle === 'monthly' ? 20000 : 216000;
  
  const originalBasicPrice = billingCycle === 'monthly' ? null : 120000;
  const originalProPrice = billingCycle === 'monthly' ? null : 240000;

  const periodLabel = billingCycle === 'monthly' ? '/month' : '/year';

  // Toggle Styles
  const toggleContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2rem',
    gap: '1rem',
    alignItems: 'center'
  };

  const toggleBtnStyle = (active) => ({
    padding: '0.5rem 1.5rem',
    borderRadius: '20px',
    border: '1px solid #000',
    backgroundColor: active ? '#000' : '#fff',
    color: active ? '#fff' : '#000',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
  });
  
  return (
    <div className="pricing-section fade-in">
      <h2>Choose Your Plan</h2>

      {/* Toggle */}
      <div style={toggleContainerStyle}>
          <button 
            style={toggleBtnStyle(billingCycle === 'monthly')}
            onClick={() => setBillingCycle('monthly')}
          >
            Monthly
          </button>
          <button 
            style={toggleBtnStyle(billingCycle === 'annual')}
            onClick={() => setBillingCycle('annual')}
          >
            Annual
          </button>
      </div>

      <div className="pricing-table">

        {/* PRO Plan (UI: Basic) */}
        <div className="pricing-card pro">
          <h3>Basic</h3>
          <p className="price" style={{ color: "#000" }}>
              {billingCycle === 'annual' && (
                <span style={{ color: 'red', fontSize: '1rem', marginRight: '5px' }}>  
                Save 10%-

              <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '1rem', marginRight: '5px' }}>  
                    ₦{originalBasicPrice.toLocaleString()}
                </span>  <br />
                                </span> 
             )}
             ₦{basicPrice.toLocaleString()}<span>{periodLabel}</span>
          </p>
          <ul>
            <li>✔ POS (Sales Sheet)</li>
            <li>✔ Cost Analysis Module</li>
            <li>✔ Profit Reconciliation</li>
            <li>✔ Expense Management</li>
            <li>✔ Basic Analytics</li>
            <li>✔ Add One Vendor to your store</li>
          </ul>
          <SubscribeButton 
            user={user} 
            planType="basic"
            billingCycle={billingCycle} 
            amount={basicPrice} 
            className="signup-btn"
            onStatusChange={handleStatusChange}
          >
            Subscribe
          </SubscribeButton>
        </div>

        {/* ENTERPRISE Plan (UI: Pro) */}
        <div className="pricing-card enterprise">
          <h3>Pro</h3>
           <p className="price" style={{ color: "#000" }}>
              {billingCycle === 'annual' && (
                <span style={{ color: 'red', fontSize: '1rem', marginRight: '5px' }}>  
                Save 10%-

              <span style={{ textDecoration: 'line-through', color: 'red', fontSize: '1rem', marginRight: '5px' }}>  
                    ₦{originalProPrice.toLocaleString()}
                </span>  <br />
                                </span> 
             )}
   
             ₦{proPrice.toLocaleString()}<span>{periodLabel}</span>
          </p>
   
          <ul>
            <li>✔ Everything That Is In Basic Plan</li>
            <li>✔ Short Interval Control (Stock Flow)</li>
            <li>✔ Multi-Store / Multi-Vendor Access</li>
            <li>✔ Custom Reports & Dashboards</li>
             <li>✔ Detailed Analytics</li>
            <li>✔ Priority Support & Staff Training</li>
          </ul>
          <SubscribeButton 
            user={user} 
            planType="pro"
            billingCycle={billingCycle} 
            amount={proPrice} 
            className="signup-btn enterprise-btn"
            onStatusChange={handleStatusChange}
          >
            Subscribe
          </SubscribeButton>
        </div>

         <div className="pricing-card enterprise">
          <h3>ENTERPRISE</h3>
          <p className="price" style={{ color: "#000" }}>Custom<span>.</span></p>
          <ul>
            <li><FaRocket className="icon" /> Everything in Pro is included</li>
            <li>✔ API Access</li>
            <li>✔ Create Unlimited Vendors</li>
            <li>✔ Custom endpoints</li>
            <li>✔ Custom Reports & Dashboards</li>
            <li>✔ Priority Support At All Times</li>
          </ul>
          <button className="signup-btn enterprise-btn">
            Contact Our Sales Team
          </button>
        </div>

      </div>

      <PaymentSuccessModal 
        isOpen={modalState.isOpen} 
        status={modalState.status}
        planName={modalState.planName} 
        onClose={closeSuccessModal} 
      />
    </div>
  );
}

export default PricingSection;
