import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  // Prevent redirect loop: if already on /login, just render children
  if (!user && location.pathname !== '/login') {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
