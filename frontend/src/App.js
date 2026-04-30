import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LayoutProvider } from "./context/LayoutContext";
import PrivateRoute from "./components/auth/PrivateRoute";
  
import { Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import AcceptInvite from "./pages/AcceptInvite";

import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import VendorsPage from "./pages/VendorsPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaystackCallback from "./pages/PaystackCallBack";
import RecipePage from './pages/RecipePage';
import LandingPage from "./pages/LandingPage";
import ProductsDashboard from "./pages/ProductsDashboard";
import InventoryPage from "./pages/InventoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportPage";
import Checkout from "./pages/Checkout";
import Stocks from "./pages/Stocks";

import InviteUsers from "./pages/Users/InviteUsers";

// Costing & Recipe
import CostingPage from "./pages/Costing";

import Unauthorized from "./pages/Unauthorized";

import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";


function App() {
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <LayoutProvider>
        <Router>
          <Toaster 
            position="top-right" 
            containerStyle={{ zIndex: 999999 }}
            toastOptions={{
              className: '',
              style: {
                border: '1px solid #713200',
                padding: '16px',
                color: '#713200',
              },
              success: {
                style: {
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0'
                },
              },
              error: {
                style: {
                  background: '#fef2f2',
                  color: '#991b1b',
                  border: '1px solid #fecaca'
                },
              },
            }}
          />

          <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/login" element={<Login />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* UNAUTHORIZED PAGE */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* PAYMENT */}
          <Route
            path="/payment/success"
            element={
              <PrivateRoute>
                <PaymentSuccess />
              </PrivateRoute>
            }
          />
          <Route
            path="/paystack/callback"
            element={
              <PrivateRoute>
                <PaystackCallback />
              </PrivateRoute>
            }
          />

          {/* CHECKOUT (Plan gating allowed) */}
          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<LandingPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />


          {/* MAIN DASHBOARD */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredSection="dashboard">
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* POS */}
          <Route
            path="/pos"
            element={
              <PrivateRoute requiredSection="pos">
                <POSPage />
              </PrivateRoute>
            }
          />

          {/* Vendors */}
          <Route
            path="/vendors"
            element={
              <PrivateRoute requiredSection="vendors">
                <VendorsPage />
              </PrivateRoute>
            }
          />

          {/* Products */}
          <Route
            path="/products"
            element={
              <PrivateRoute requiredSection="products">
                <ProductsDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/products/:id/recipe"
            element={
              <PrivateRoute>
                <RecipePage />
              </PrivateRoute>
            }
          />

          {/* Stocks */}
          <Route
            path="/stocks-movement"
            element={
              <PrivateRoute>
                <Stocks />
              </PrivateRoute>
            }
          />
          {/* Inventory */}
          <Route
            path="/inventory"
            element={
              <PrivateRoute requiredSection="stock">
                <InventoryPage />
              </PrivateRoute>
            }
          />

          {/* Expenses */}
          <Route
            path="/expenses"
            element={
              <PrivateRoute requiredSection="expenses">
                <ExpensesPage />
              </PrivateRoute>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <PrivateRoute requiredSection="reports">
                <ReportsPage />
              </PrivateRoute>
            }
          />

          {/* USERS / INVITES */}
          <Route
            path="/users/invite"
            element={
              <PrivateRoute requiredSection="users">
                <InviteUsers />
              </PrivateRoute>
            }
          />


          {/* RECIPE */}
          <Route
            path="/recipe/:productId"
            element={
              <PrivateRoute requiredSection="recipes">
                <RecipePage />
              </PrivateRoute>
            }
          />

          {/* COSTING */}
          <Route
            path="/costing"
            element={
              <PrivateRoute requiredSection="costing">
                <CostingPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
      </LayoutProvider>
    </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
