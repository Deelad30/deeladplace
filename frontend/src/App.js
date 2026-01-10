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
import LandingPage from "./pages/LandingPage";
import ProductsDashboard from "./pages/ProductsDashboard";
import InventoryPage from "./pages/InventoryPage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportPage";
import Checkout from "./pages/Checkout";
import Stocks from "./pages/Stocks";

import PaymentSuccess from "./pages/PaymentSuccess";
import PaystackCallback from "./pages/PaystackCallBack";

import InviteUsers from "./pages/Users/InviteUsers";

// Costing & Recipe
import CostingPage from "./pages/Costing";

import Unauthorized from "./pages/Unauthorized";

import { Toaster } from "react-hot-toast";
import "./App.css";

const check = (Comp, name) => {
  if (typeof Comp !== "function") {
    console.error(`❌ ${name} is NOT a component`, Comp);
  }
};

function App() {
check(DashboardPage, "DashboardPage");
check(POSPage, "POSPage");
check(VendorsPage, "VendorsPage");
check(ProductsDashboard, "ProductsDashboard");
check(InventoryPage, "InventoryPage");
check(ExpensesPage, "ExpensesPage");
check(ReportsPage, "ReportsPage");
check(InviteUsers, "InviteUsers");
check(CostingPage, "CostingPage");
check(RecipePage, "RecipePage");
check(Stocks, "Stocks");
check(Checkout, "Checkout");
check(PaymentSuccess, "PaymentSuccess");
check(PaystackCallback, "PaystackCallback");
check(Unauthorized, "Unauthorized");
check(LandingPage, "LandingPage");

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
    </AuthProvider>
  );
}

export default App;
