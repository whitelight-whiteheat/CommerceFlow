import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ToastContainer from './components/ToastContainer';
import TokenDebugger from './components/TokenDebugger';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import Orders from './components/Orders';
import Products from './components/Products';
import Analytics from './components/Analytics';
import Layout from './components/Layout';
import CustomerAuth from './components/CustomerAuth';
import CustomerLayout from './components/CustomerLayout';
import ProductCatalog from './components/ProductCatalog';
import ShoppingCart from './components/ShoppingCart';
import CustomerDashboard from './components/CustomerDashboard';
import './App.css';

const AdminApp: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // If user is not authenticated or not admin, show login
  if (!user || !isAdmin) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/admin" />} />
      </Routes>
    </Layout>
  );
};

const CustomerApp: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <CustomerAuth />;
  }

  return (
    <CustomerLayout>
      <Routes>
        <Route path="/" element={<ProductCatalog />} />
        <Route path="/cart" element={<ShoppingCart />} />
        <Route path="/dashboard" element={<CustomerDashboard />} />
        <Route path="/login" element={<Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </CustomerLayout>
  );
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  // Check if user is trying to access admin routes
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    return <AdminApp />;
  }

  return <CustomerApp />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <CartProvider>
            <AppContent />
            <ToastContainer />
            <TokenDebugger />
          </CartProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
