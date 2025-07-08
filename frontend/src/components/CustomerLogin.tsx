import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AnimatedTitle from './AnimatedTitle';
import './CustomerLogin.css';

interface CustomerLoginProps {
  onSwitchToRegister: () => void;
}

const CustomerLogin: React.FC<CustomerLoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-login-container">
      <div className="login-header">
        <AnimatedTitle />
        <div className="login-subtitle">
          <p>Your Professional E-Commerce Solution</p>
          <p className="login-tagline">Secure • Fast • Reliable</p>
        </div>
      </div>
      
      <div className="customer-login-card">
        <div className="card-header">
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="switch-form">
          <p>
            Don't have an account?{' '}
            <button type="button" onClick={onSwitchToRegister} className="switch-button">
              Sign up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin; 