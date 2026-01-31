import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ROLE_MAP, ROLE_DEFAULT_ROUTE } from "../../utils/roles";
import LoadingSpinner from "../common/LoadingSpinner";
import AuthLayout from "./AuthLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Ensure you have these

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const { login, signup, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (isSignup) {
        if (!signup) throw new Error("Signup function not available");
        result = await signup(name, businessName, email, password);

        if (result.success) {
          setIsSignup(false);
          setName("");
          setPassword("");
          setError("");
          return; 
        }
      } else {
        if (!login) throw new Error("Login function not available");
        result = await login(email, password);
      }

      if (result.success) {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const plan = storedUser?.plan?.toLowerCase();
        const roleId = storedUser?.role_id;
        const role = ROLE_MAP[roleId] || "staff";
        
        console.log("Login success for role:", role, "Plan:", plan);

        if (role !== "admin") {
          const defaultRoute = ROLE_DEFAULT_ROUTE[role] || "/";
          navigate(defaultRoute);
        } else {
          if (["enterprise", "pro", "basic", "starter", "demo", "trial"].includes(plan)) {
            navigate("/dashboard");
          } else {
            navigate("/checkout");
          }
        }
      } else {
        setError(result.message || "Authentication failed");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner />;

  return (
    <AuthLayout isSignup={isSignup}>
      <form onSubmit={handleSubmit}>
        <div className="form-header">
          <h2>{isSignup ? "Create Account" : "Sign In"}</h2>
          <p>{isSignup ? "Enter your details to get started" : "Enter your email and password to continue"}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isSignup && (
          <>
            <div className="auth-input-group">
              <label>Full Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. John Doe"
                value={name}
                onChange={handleInputChange(setName)}
                required
              />
            </div>
            <div className="auth-input-group">
              <label>Business Name</label>
              <input
                type="text"
                className="auth-input"
                placeholder="e.g. Deelad's Kitchen"
                value={businessName}
                onChange={handleInputChange(setBusinessName)}
                required
              />
            </div>
          </>
        )}

        <div className="auth-input-group">
          <label>Email Address</label>
          <input
            type="email"
            className="auth-input"
            placeholder="name@company.com"
            value={email}
            onChange={handleInputChange(setEmail)}
            required
          />
        </div>

        <div className="auth-input-group">
          <label>Password</label>
          <div className="password-input-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="auth-input"
              placeholder="••••••••"
              value={password}
              onChange={handleInputChange(setPassword)}
              required
            />
             <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
            >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
            </span>
          </div>
          {!isSignup && (
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          )}
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (isSignup ? "Creating Account..." : "Signing in...") : (isSignup ? "Sign Up" : "Sign In")}
        </button>

        <p className="switch-auth-text">
          {isSignup ? "Already have an account?" : "Don't have an account?"}
          <span className="auth-link" style={{marginLeft: '5px'}} onClick={() => setIsSignup(!isSignup)}>
            {isSignup ? "Log in" : "Sign up"}
          </span>
        </p>
      </form>
    </AuthLayout>
  );
}

export default Login;
