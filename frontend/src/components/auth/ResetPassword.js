import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { authService } from "../../services/authService";
import LoadingSpinner from "../common/LoadingSpinner";
import AuthLayout from "./AuthLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (!validToken) {
    return (
      <AuthLayout title="Link Invalid" subtitle="The password reset link is invalid or has expired.">
         <div className="form-header">
            <h2>Invalid Link</h2>
            <p>Please request a new reset link.</p>
         </div>
         <button onClick={() => navigate("/forgot-password")} className="btn-primary">
            Request New Link
         </button>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Secure your account with a new password.">
      <form onSubmit={handleSubmit}>
        <div className="form-header">
           <h2>Create New Password</h2>
           <p>Enter your new password below</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}

        <div className="auth-input-group">
          <label>New Password</label>
          <div className="password-input-wrapper">
             <input
               type={showPassword ? "text" : "password"}
               className="auth-input"
               placeholder="New Password"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
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
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
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
           {loading ? "Resetting..." : "Reset Password"}
        </button>

        <div className="switch-auth-text">
            <Link to="/login" className="auth-link">
              ← Back to Login
            </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;



