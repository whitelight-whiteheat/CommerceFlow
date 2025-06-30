import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './CustomerLayout.css';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="customer-layout">
      <header className="customer-header">
        <div className="header-content">
          <div className="logo">
            <Link to="/" className="logo-link">
              <h1>E-Commerce Store</h1>
            </Link>
          </div>
          
          <nav className="nav-menu">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Products
            </Link>
            <Link 
              to="/cart" 
              className={`nav-link ${isActive('/cart') ? 'active' : ''}`}
            >
              Cart ({getCartItemCount()})
            </Link>
            <Link 
              to="/dashboard" 
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            >
              My Account
            </Link>
          </nav>
          
          <div className="user-menu">
            {user ? (
              <div className="user-info">
                <span className="user-name">Hello, {user.name}</span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-btn">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="customer-main">
        {children}
      </main>

      <footer className="customer-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>About Us</h3>
            <p>Your trusted online shopping destination for quality products.</p>
          </div>
          <div className="footer-section">
            <h3>Customer Service</h3>
            <p>Email: support@ecommerce.com</p>
            <p>Phone: (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <Link to="/" className="footer-link">Products</Link>
            <Link to="/cart" className="footer-link">Cart</Link>
            <Link to="/dashboard" className="footer-link">My Account</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 E-Commerce Store. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout; 