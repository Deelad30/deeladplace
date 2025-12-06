import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/auth/PrivateRoute";
  
import { Navigate } from "react-router-dom";

import Login from "./components/auth/Login";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";
import AcceptInvite from "./pages/AcceptInvite";

import DashboardPage from "./pages/DashboardPage";
import POSPage from "./pages/POSPage";
import VendorsPage from "./pages/VendorsPage";
import RecipePage from './pages/RecipePage';
import ProductsDashboard from "./pages/ProductsDashboard";
import InventoryPage from "./pages/InventoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportPage";
import Checkout from "./pages/Checkout";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaystackCallback from "./pages/PaystackCallBack";

import InviteUsers from "./pages/Users/InviteUsers";

// SIC Pages
import SICProductsPage from "./pages/SIC/SICProductsPage";
import SICRawPage from "./pages/SIC/SICRawPage";

// Costing & Recipe
import CostingPage from "./pages/Costing/CostingPage";

// Variance Pages
import ProductVariancePage from "./pages/Variance/ProductVariance";
import RawVariancePage from "./pages/Variance/RawVariance";

import Unauthorized from "./pages/Unauthorized";

import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />

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

          <Route path="*" element={<Navigate to="/" replace />} />


          {/* MAIN DASHBOARD */}
          <Route
            path="/"
            element={
              <PrivateRoute requiredSection="dashboard">
                <DashboardPage />
              </PrivateRoute>
            }
          />
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

          {/* SIC - PRODUCTS */}
          <Route
            path="/sic/products"
            element={
              <PrivateRoute requiredSection="sic_product">
                <SICProductsPage />
              </PrivateRoute>
            }
          />

          {/* SIC - RAW MATERIALS */}
          <Route
            path="/sic/raw"
            element={
              <PrivateRoute requiredSection="sic_raw">
                <SICRawPage />
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
            path="/costing/:productId"
            element={
              <PrivateRoute requiredSection="costing">
                <CostingPage />
              </PrivateRoute>
            }
          />

          {/* VARIANCE - PRODUCTS */}
          <Route
            path="/variance/products"
            element={
              <PrivateRoute requiredSection="variance_products">
                <ProductVariancePage />
              </PrivateRoute>
            }
          />

          {/* VARIANCE - RAW MATERIALS */}
          <Route
            path="/variance/raw"
            element={
              <PrivateRoute requiredSection="variance_raw">
                <RawVariancePage />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
