import React, { useState, useEffect } from 'react';

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
}

const Analytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="card-title">Analytics Dashboard</h1>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 grid-cols-2 grid-cols-3">
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
              {analytics.topProducts.map((product, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: '600' }}>#{index + 1}</td>
                  <td>{product.name}</td>
                  <td>${product.sales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales by Month */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Sales by Month</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Sales</th>
              </tr>
            </thead>
            <tbody>
              {analytics.salesByMonth.map((month, index) => (
                <tr key={index}>
                  <td>{month.month}</td>
                  <td>${month.sales.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics; 