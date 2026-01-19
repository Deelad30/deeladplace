import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios"; 
import LoadingSpinner from "../components/common/LoadingSpinner";
import AuthLayout from "../components/auth/AuthLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const AcceptInvite = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  if (!validToken) {
    return (
      <AuthLayout title="Invalid Invite" subtitle="This invitation link is invalid or has expired.">
         <div className="form-header">
            <h2>Invalid Link</h2>
            <p>Please contact your administrator for a new invite.</p>
         </div>
         <Link to="/login" className="auth-link" style={{display:'block', textAlign:'center', marginTop: '20px'}}>
             Go to Login
         </Link>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Activate Account" subtitle="Set your details to complete registration.">
      <form onSubmit={handleSubmit}>
         <div className="form-header">
            <h2>Welcome Aboard!</h2>
            <p>Complete your profile to get started.</p>
         </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <div className="auth-input-group">
            <label>Full Name</label>
            <input
              type="text"
              className="auth-input"
              placeholder="Your Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading || message}
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
                disabled={loading || message}
              />
               <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
               </span>
            </div>
          </div>

          <div className="auth-input-group">
            <label>Confirm Password</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirm ? "text" : "password"}
                className="auth-input"
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength="6"
                disabled={loading || message}
              />
               <span className="toggle-password" onClick={() => setShowConfirm(!showConfirm)}>
                  <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
               </span>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || message}>
             {loading ? "Activating..." : "Activate Account"}
          </button>
      </form>
    </AuthLayout>
  );
};

export default AcceptInvite;
