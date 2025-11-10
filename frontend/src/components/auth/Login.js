import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import LoadingSpinner from "../common/LoadingSpinner";
import { APP_CONFIG } from "../../utils/constants";
import '../../../src/styles/components/Login.css';

function Login() {
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
    e.preventDefault(); // Prevent page refresh
    setLoading(true);
    setError("");

    try {
      let result;
      if (isSignup) {
        if (!signup) throw new Error("Signup function not available");
        result = await signup(name, email, password);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        navigate("/dashboard");
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

  // Prevent rendering the login form until AuthProvider finishes loading
  if (authLoading) return <LoadingSpinner />;

  return (
    <main style={{ paddingTop: "80px" }} className="login__main">
      {/* Left Text Section */}
      <div className="login__text">
        <h1 className="login__text__heading">
          {isSignup ? "Join Deelad Place 🎉" : "Welcome Back 👋"}
        </h1>
        <p className="login__text__sub">
          {isSignup
            ? "Create an account to start managing your restaurant, tracking inventory, and seeing your daily profits."
            : "Log in to manage your restaurant, track inventory, and see your daily profits."}
        </p>

        <div
          className="login__text__link pointer"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? (
            <>
              Already have an account? <span>Sign in</span>
            </>
          ) : (
            <>
              Don’t have an account? <span>Sign up</span>
            </>
          )}
        </div>
      </div>

      {/* Login / Signup Form */}
      <form onSubmit={handleSubmit} className="login__form" autoComplete="off">
        <h2 className="login__form__heading">
          {isSignup ? "Create your Deelad Place account" : "Sign in to Deelad Place"}
        </h2>

        {/* Persistent Error */}
        {error && (
          <div className="error-message">
            {error}
            <button
              type="button"
              onClick={() => setError("")}
              className="error-close-btn"
            >
              ×
            </button>
          </div>
        )}

        {/* Signup Name */}
        {isSignup && (
          <label htmlFor="name" className={`login__input ${error ? "input-error" : ""}`}>
            <input
              type="text"
              id="name"
              placeholder="Full Name"
              className="login__input--box"
              value={name}
              onChange={handleInputChange(setName)}
              required
              disabled={loading}
            />
          </label>
        )}

        {/* Email */}
        <label htmlFor="email" className={`login__input ${error ? "input-error" : ""}`}>
          <input
            type="email"
            id="email"
            placeholder="Email Address"
            className="login__input--box"
            value={email}
            onChange={handleInputChange(setEmail)}
            required
            disabled={loading}
          />
        </label>

        {/* Password */}
        <label htmlFor="password" className={`login__input ${error ? "input-error" : ""}`}>
          <input
            type="password"
            id="password"
            placeholder={isSignup ? "Create a Password" : "Password"}
            className="login__input--box"
            value={password}
            onChange={handleInputChange(setPassword)}
            required
            disabled={loading}
            minLength="6"
          />
        </label>

        {/* Forgot Password */}
        {!isSignup && (
          <div className="login__forgot">
            Forgot Password?{" "}
            <Link to={"/forgot-password"}>
              <span className="login__blue__link">Reset</span>
            </Link>
          </div>
        )}

        {/* Submit Button */}
        <div className="login__form__bottom">
          <button type="submit" className="btn btn-shadow" disabled={loading}>
            {loading ? <LoadingSpinner size="small" /> : (isSignup ? "Create Account" : "Sign In")}
          </button>

          {!isSignup && (
            <p style={{ paddingTop: "20px" }} className="login__signup__note">
              Trouble signing in?{" "}
              <a href="mailto:deeladplace@gmail.com" className="login__forgot">
                <span className="login__blue__link">Mail us</span>
              </a>
            </p>
          )}
        </div>
      </form>
    </main>
  );
}

export default Login;
