import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
      authService.setToken(token);
    }
    setLoading(false);
  }, []);

const login = async (email, password) => {
  try {
    // 1. Login and receive token
    const response = await authService.login(email, password);
    const { token } = response.data;

    // 2. Store token and set axios header
    localStorage.setItem('token', token);
    authService.setToken(token);

    // 3. Fetch the latest user from your database
    const profileRes = await authService.getCurrentUser();
    console.log(profileRes);
    
    const updatedUser = profileRes.data;

    // 4. Save updated user to state + localStorage
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    return { success: true };
  } catch (error) {
    return {
      success: false,
      message: error.message || "Login failed",
    };
  }
};


  const signup = async (name, email, password) => {
    try {
      const response = await authService.register(name, email, password);      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authService.setToken(null);
    setUser(null);
  };

  const value = {
    user,
    login,
    signup, // Make sure this is included
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};