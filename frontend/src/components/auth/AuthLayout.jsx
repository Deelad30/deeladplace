import React from 'react';
import '../../styles/components/Auth.css';

const AuthLayout = ({ children, title, subtitle, isSignup = false }) => {
  return (
    <div className="auth-container">
      {/* --- Left Side: Brand & Pattern --- */}
      <div className="auth-left">
        <div className="brand-content">
          
            <h1 style={{color: "#fff"}} className="brand-heading">
                {title || (isSignup ? "Join the Future." : "Welcome Back.")}
            </h1>
            <p className="brand-sub">
                {subtitle || "Manage your inventory, track sales, and optimize production with DeeSoftwork."}
            </p>
        </div>
      </div>

      {/* --- Right Side: Form --- */}
      <div className="auth-right">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
