import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import "../../../src/styles/components/ResetPassword.css"; // original styling


const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
      setValidToken(false);
    } else {
      setValidToken(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(token, newPassword);
      setMessage(response.data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const loginVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5, ease: "linear", delayChildren: 2 } },
    exit: { opacity: 0, transition: { duration: 0.5, ease: "linear", delay: 0.35 } },
  };

  if (!validToken) {
    return (
      <motion.div
        className="login"
        variants={loginVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
 
        <main style={{ paddingTop: "80px" }} className="reset__main">
          <div className="reset__text">
            <h1 className="reset__heading">Invalid Reset Link</h1>
            <p className="reset__subtext">
              The password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate("/forgot-password")}
              className="btn btn-shadow"
            >
              Request New Reset Link
            </button>
          </div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="login"
      variants={loginVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
 
      <main style={{ paddingTop: "80px" }} className="reset__main">
        {/* Left Info Section */}
        <div className="reset__text">
          <h1 className="reset__heading">Create New Password</h1>
          <p className="reset__subtext">
            Enter your new password below and confirm it to reset your account password.
          </p>
          <Link to="/login" className="reset__back">
            ← Back to Login
          </Link>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="reset__form">
          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <label htmlFor="new-password" className="reset__input">
            <input
              type="password"
              id="new-password"
              placeholder="New Password"
              className="reset__input--box"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              disabled={loading || message}
              minLength="6"
            />
          </label>

          <label htmlFor="confirm-password" className="reset__input">
            <input
              type="password"
              id="confirm-password"
              placeholder="Confirm Password"
              className="reset__input--box"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || message}
              minLength="6"
            />
          </label>

          <button type="submit" className="btn btn-shadow" disabled={loading || message}>
            {loading ? <LoadingSpinner size="small" /> : "Reset Password"}
          </button>

          {message && (
            <p className="reset__note">
              Password reset successful! Redirecting to login...
            </p>
          )}
        </form>
      </main>
    </motion.div>
  );
};

export default ResetPassword;
