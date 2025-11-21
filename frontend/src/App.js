import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Login from './components/auth/Login';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import DashboardPage from './pages/DashboardPage';
import { Toaster } from 'react-hot-toast';
import POSPage from './pages/POSPage';
import VendorsPage from './pages/VendorsPage';
import ProductsPage from './pages/ProductsPage';
import ProductsDashboard from './pages/ProductsDashboard';
import InventoryPage from './pages/InventoryPage';
import PaymentSuccess from './pages/PaymentSuccess';
import ExpensesPage from './pages/ExpensesPage';
import PaystackCallback from './pages/PaystackCallBack';
import ReportsPage from './pages/ReportPage';
import './App.css';
import Checkout from './pages/Checkout';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Toaster position="top-right" />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              } 
            />
            <Route path="/payment/success" 
            element={
            <PrivateRoute>
            <PaymentSuccess />
            </PrivateRoute>
            } 
            />
            <Route path="/paystack/callback" 
            element={
            <PrivateRoute>
            <PaystackCallback />
            </PrivateRoute>
            } 
            />
            <Route 
              path="/checkout" 
              element={
                <PrivateRoute>
                  <Checkout />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/pos" 
              element={
                <PrivateRoute>
                  <POSPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/vendors" 
              element={
                <PrivateRoute>
                  <VendorsPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <PrivateRoute>
                  <ProductsDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/inventory" 
              element={
                <PrivateRoute>
                  <InventoryPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/expenses" 
              element={
                <PrivateRoute>
                  <ExpensesPage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <PrivateRoute>
                  <ReportsPage />
                </PrivateRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
