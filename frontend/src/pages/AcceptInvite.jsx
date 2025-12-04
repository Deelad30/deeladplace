import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios"; 
import LoadingSpinner from "../components/common/LoadingSpinner";
import "../styles/components/ResetPassword.css"; // reuse same layout + styling

const AcceptInvite = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [validToken, setValidToken] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("/invite/accept", {
        token,
        password,
        name,
      });

      setMessage("Account activated! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to accept invite.");
    } finally {
      setLoading(false);
    }
  };

  const pageVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.5 } },
  };

  if (!validToken) {
    return (
      <motion.div
        className="login"
        variants={pageVariants}
        initial="hidden"
        animate="show"
        exit="exit"
      >
        <main className="reset__main" style={{ paddingTop: "80px" }}>
          <div className="reset__text">
            <h1 className="reset__heading">Invalid Invitation Link</h1>
            <p className="reset__subtext">
              This invitation link is invalid or has expired.
            </p>
            <Link className="btn btn-shadow" to="/login">
              Go to Login
            </Link>
          </div>
        </main>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="login"
      variants={pageVariants}
      initial="hidden"
      animate="show"
      exit="exit"
    >
      <main className="reset__main" style={{ paddingTop: "80px" }}>

        {/* LEFT SECTION */}
        <div className="reset__text">
          <h1 className="reset__heading">Activate Your Account</h1>
          <p className="reset__subtext">
            Set your name and password to complete your registration.
          </p>
          <Link to="/login" className="reset__back">
            ← Back to Login
          </Link>
        </div>

        {/* RIGHT SECTION (FORM) */}
        <form onSubmit={handleSubmit} className="reset__form">

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          {/* Name */}
          <label className="reset__input">
            <input
              type="text"
              placeholder="Your Full Name"
              className="reset__input--box"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || message}
            />
          </label>

          {/* Password */}
          <label className="reset__input">
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="reset__input--box"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || message}
                minLength="6"
              />
              <span
                className="toggle-password pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🔓" : "🔒"}
              </span>
            </div>
          </label>

          {/* Confirm Password */}
          <label className="reset__input">
            <div className="password-wrapper">
              <input
                type={showPassword2 ? "text" : "password"}
                placeholder="Confirm Password"
                className="reset__input--box"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                disabled={loading || message}
                minLength="6"
              />
              <span
                className="toggle-password pointer"
                onClick={() => setShowPassword2(!showPassword2)}
              >
                {showPassword2 ? "🔓" : "🔒"}
              </span>
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-shadow"
            disabled={loading || message}
          >
            {loading ? <LoadingSpinner size="small" /> : "Activate Account"}
          </button>

          {message && (
            <p className="reset__note">{message}</p>
          )}
        </form>
      </main>
    </motion.div>
  );
};

export default AcceptInvite;
