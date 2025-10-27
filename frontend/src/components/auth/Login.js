import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';
import { APP_CONFIG } from '../../utils/constants';
import '../../../src/styles/components/Login.css';
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isSignup) {
      result = await signup(name, email, password);
    } else {
      result = await login(email, password);
    }
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>{APP_CONFIG.APP_NAME}</h1>
          <p>{isSignup ? 'Create your account' : 'Sign in to your account'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}
          
          {isSignup && (
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your full name"
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder={isSignup ? "Create a password" : "Enter your password"}
              minLength="6"
            />
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <LoadingSpinner size="small" /> : (isSignup ? 'Create Account' : 'Sign In')}
          </button>
        </form>
        
        <div className="auth-switch">
          <p>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}
            <button 
              type="button" 
              onClick={() => setIsSignup(!isSignup)}
              className="switch-btn"
            >
              {isSignup ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </div>
        
        {!isSignup && (
          <div className="login-footer">
            <p>Default credentials: admin@deeladplace.com / admin123</p>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default Login;