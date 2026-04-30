import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ROLE_MAP, ROLE_DEFAULT_ROUTE } from "../../utils/roles";
import LoadingSpinner from "../common/LoadingSpinner";
import AuthLayout from "./AuthLayout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Ensure you have these
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();
  const { login, signup, googleLogin, loading: authLoading } = useAuth();

  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");
    try {
      const result = await googleLogin(credentialResponse.credential);
      if (result.success) {
        handlePostAuthNavigation();
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Google login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePostAuthNavigation = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const plan = storedUser?.plan?.toLowerCase();
    const roleId = storedUser?.role_id;
    const role = ROLE_MAP[roleId] || "staff";
    
    console.log("Auth success for role:", role, "Plan:", plan);

    if (role !== "admin") {
      const defaultRoute = ROLE_DEFAULT_ROUTE[role] || "/";
      navigate(defaultRoute);
    } else {
      if (plan && ["enterprise", "pro", "basic", "starter", "demo", "trial",
          "basic_annual", "pro_annual", "enterprise_annual"].includes(plan)) {
        navigate("/dashboard");
      } else {
        navigate("/checkout");
      }
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let result;

      if (isSignup) {
        if (!signup) throw new Error("Signup function not available");
        if (!logo) {
          setError("Business logo is required");
          setLoading(false);
          return;
        }
        result = await signup(name, businessName, email, password, logo);

        if (result.success) {
          setIsSignup(false);
          setName("");
          setPassword("");
          setBusinessName("");
          setLogo(null);
          setLogoPreview(null);
          setError("");
          return; 
        }
      } else {
        if (!login) throw new Error("Login function not available");
        result = await login(email, password);
      }

      if (result.success) {
        handlePostAuthNavigation();
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

        <div className="google-auth-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Authentication failed")}
            useOneTap
            theme="outline"
            shape="pill"
            width="100%"
            text={isSignup ? "signup_with" : "signin_with"}
          />
        </div>

        <div className="auth-separator">
          <span>OR</span>
        </div>

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
            <div className="auth-input-group">
              <label>Business Logo <span style={{color: 'red'}}>*</span></label>
              <div className="logo-upload-container" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                  id="logo-upload"
                  required={isSignup}
                />
                <label htmlFor="logo-upload" style={{ 
                  padding: '10px 15px', 
                  background: '#f3f4f6', 
                  border: '1px dashed #d1d5db', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#4b5563'
                }}>
                  {logo ? "Change Logo" : "Choose Logo"}
                </label>
                {logoPreview && (
                  <img 
                    src={logoPreview} 
                    alt="Logo preview" 
                    style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #e5e7eb' }} 
                  />
                )}
              </div>
              <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '5px' }}>Recommended: Square image, max 2MB</p>
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
