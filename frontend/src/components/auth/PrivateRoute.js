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

  // Map role_id → role string
  const role = (user.role || ROLE_MAP[user.role_id] || "staff").toLowerCase();
  const perms = ROLE_PERMISSIONS[role] || {};

  // User inactive → logout and redirect
  if (user.status !== "active") {
    toast.error("Your account has been deactivated");
    logout();
    return null; // logout already redirects
  }

  // Role-based access check
  if (requiredSection && !perms[requiredSection]) {
    toast.error("You are not authorized to access this page");
    return <Navigate to={ROLE_DEFAULT_ROUTE[role] || "/"} replace />;
  }

  // Default landing page if user visits "/"
  if (location.pathname === "/") {
    return <Navigate to={ROLE_DEFAULT_ROUTE[role] || "/"} replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
