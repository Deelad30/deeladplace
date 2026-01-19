import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import AuthLayout from "./AuthLayout";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await authService.forgotPassword(email);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Forgot Password?" 
      subtitle="Don’t worry — it happens! Enter your registered email, and we’ll send you a link to reset your password."
    >
      <form onSubmit={handleSubmit}>
        <div className="form-header">
           <h2>Reset Password</h2>
           <p>Enter your email to receive instructions</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="auth-input-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            className="auth-input"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="switch-auth-text">
            <Link to="/login" className="auth-link">
              ← Back to Login
            </Link>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;

