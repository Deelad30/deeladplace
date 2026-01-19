import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LoadingSpinner from "../common/LoadingSpinner";
import { toast } from "react-hot-toast";
import { ROLE_PERMISSIONS, ROLE_DEFAULT_ROUTE, ROLE_MAP } from "../../utils/roles";

const PrivateRoute = ({ requiredSection = null, children = null }) => {
  const { user, loading, logout } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingSpinner />;

  // Not logged in → redirect to login
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  // 1. Resolve Role Robustly
  const rawRole = (ROLE_MAP[user.role_id] || user.role || "staff")
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
  
  const role = rawRole;
  const perms = ROLE_PERMISSIONS[role] || {};

  // 2. User inactive → logout and redirect
  if (user.status !== "active") {
    toast.error("Your account has been deactivated");
    logout();
    return null; 
  }

  // 3. Role-based access check
  if (requiredSection && !perms[requiredSection]) {
    // SILENCE TOAST IF: we are currently at /login or just redirected from it
    // Or if we're on the root path
    const isTransitioning = 
        location.pathname === "/login" || 
        location.pathname === "/" || 
        location.pathname === "/dashboard"; // Ignore if momentarily landing on dashboard

    if (!isTransitioning) {
       toast.error("Unauthorized access redirected", { id: 'auth-error' });
    }

    return <Navigate to={ROLE_DEFAULT_ROUTE[role] || "/"} replace />;
  }

  // 4. Default landing page if user visits "/"
  if (location.pathname === "/") {
    return <Navigate to={ROLE_DEFAULT_ROUTE[role] || "/"} replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
