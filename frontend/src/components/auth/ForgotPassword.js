import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { authService } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import "../../../src/styles/components/ForgotPassword.css"; // keep old styling

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

  const loginVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5, ease: "linear", delayChildren: 2 } },
    exit: { opacity: 0, transition: { duration: 0.5, ease: "linear", delay: 0.35 } },
  };

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
          <h1 className="reset__heading">Forgot your password?</h1>
          <p className="reset__subtext">
            Don’t worry — it happens! Enter your registered email, and we’ll send you a
            link to reset your password.
          </p>
          <Link to="/login" className="reset__back">
            ← Back to Login
          </Link>
        </div>

        {/* Reset Form */}
        <form onSubmit={handleSubmit} className="reset__form">
          <h2 className="reset__form__heading">Reset Password</h2>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <label htmlFor="email" className="reset__input">
            <input
              type="email"
              id="email"
              placeholder="Email Address"
              className="reset__input--box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <button type="submit" className="btn btn-shadow" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : "Send Reset Link"}
          </button>

          <p className="reset__note">
            Need help?{" "}
            <a href="mailto:deeladplace@gmail.com" className="reset__link">
              Contact Support
            </a>
          </p>
        </form>
      </main>
    </motion.div>
  );
}

export default ForgotPassword;
