import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Orders', href: '/orders', icon: '📦' },
    { name: 'Products', href: '/products', icon: '🛍️' },
    { name: 'Users', href: '/users', icon: '👥' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ padding: '1.5rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937' }}>
            E-Commerce Admin
          </h1>
        </div>
        
        <nav style={{ padding: '0 1rem' }}>
          <ul style={{ listStyle: 'none' }}>
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name} style={{ marginBottom: '0.5rem' }}>
                  <Link
                    to={item.href}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0.75rem 1rem',
                      borderRadius: '0.375rem',
                      textDecoration: 'none',
                      color: isActive ? '#3b82f6' : '#6b7280',
                      backgroundColor: isActive ? '#eff6ff' : 'transparent',
                      fontWeight: isActive ? '600' : '500',
                    }}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span style={{ marginRight: '0.75rem', fontSize: '1.125rem' }}>
                      {item.icon}
                    </span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="main-content">
        {/* Header */}
        <header className="header">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                display: 'none',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                background: 'white',
                cursor: 'pointer',
              }}
            >
              ☰
            </button>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
              {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
          >
            Logout
          </button>
        </header>

        {/* Page content */}
        <main style={{ padding: '1.5rem' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 