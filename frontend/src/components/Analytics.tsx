import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api';

interface AnalyticsData {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{
    name: string;
    sales: number;
  }>;
  salesByMonth: Array<{
    month: string;
    sales: number;
  }>;
  userRegistrationsByMonth: Array<{
    month: string;
    users: number;
  }>;
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await apiClient.get(`/admin/analytics?period=${period}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Analytics</h2>
        </div>
        <p>Failed to load analytics data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h1 className="card-title">Analytics Dashboard</h1>
            <select 
              value={period} 
              onChange={(e) => setPeriod(e.target.value)}
              className="form-input"
              style={{ width: 'auto' }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Total Sales
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                ${analytics.totalSales.toLocaleString()}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>💰</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Total Orders
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                {analytics.totalOrders}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>📦</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Avg Order Value
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                ${analytics.averageOrderValue.toFixed(2)}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>📊</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Top Selling Products</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Product</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.length > 0 ? (
                  analytics.topProducts.map((product, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: '600' }}>#{index + 1}</td>
                      <td>{product.name}</td>
                      <td>${product.sales.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sales by Month */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Sales by Day</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Sales</th>
                </tr>
              </thead>
              <tbody>
                {analytics.salesByMonth.length > 0 ? (
                  analytics.salesByMonth.map((month, index) => (
                    <tr key={index}>
                      <td>{month.month}</td>
                      <td>${month.sales.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No sales data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Registrations */}
      {analytics.userRegistrationsByMonth && analytics.userRegistrationsByMonth.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">User Registrations</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>New Users</th>
                </tr>
              </thead>
              <tbody>
                {analytics.userRegistrationsByMonth.map((month, index) => (
                  <tr key={index}>
                    <td>{month.month}</td>
                    <td>{month.users}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics; 