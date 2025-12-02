import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  // Not logged in → redirect to login
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  // Logged in but plan is not "pro" or "enterprise" → redirect to checkout
  const allowedPlans = ['pro', 'enterprise'];
  if (user && !allowedPlans.includes(user.plan?.toLowerCase()) && location.pathname !== '/checkout') {
    return <Navigate to="/checkout" replace />;
  }

  return children;
};

export default PrivateRoute;
