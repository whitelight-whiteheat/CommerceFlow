import React, { useState, useEffect } from 'react';

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalCategories: number;
    totalRevenue: number;
    totalRevenueOrders: number;
  };
  ordersByStatus: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  recentOrders: Array<{
    id: string;
    total: number;
    status: string;
    createdAt: string;
    user: {
      name: string;
      email: string;
    };
    items: Array<{
      quantity: number;
      product: {
        name: string;
        price: number;
      };
    }>;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    category: {
      name: string;
    };
  }>;
  topSellingProducts: Array<{
    id: string;
    name: string;
    totalSold: number;
    category: {
      name: string;
    };
  }>;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        console.error('Failed to fetch dashboard stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
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

  if (!stats) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Dashboard</h2>
        </div>
        <p>Failed to load dashboard data.</p>
      </div>
    );
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'processing':
        return 'badge badge-info';
      case 'shipped':
        return 'badge badge-primary';
      case 'cancelled':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Dashboard Overview</h1>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Total Orders
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                {stats.overview.totalOrders}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>📦</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Total Revenue
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                ${stats.overview.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>💰</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Total Users
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                {stats.overview.totalUsers}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>👥</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                Total Products
              </p>
              <p style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
                {stats.overview.totalProducts}
              </p>
            </div>
            <div style={{ fontSize: '2rem' }}>🛍️</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Orders</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td style={{ fontFamily: 'monospace' }}>#{order.id.slice(0, 8)}</td>
                      <td>{order.user.name}</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <span className={getStatusBadgeClass(order.status)}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#6b7280' }}>
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Low Stock Products</h2>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.length > 0 ? (
                  stats.lowStockProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category.name}</td>
                      <td>
                        <span style={{ 
                          color: product.stock === 0 ? '#dc2626' : '#d97706',
                          fontWeight: '600'
                        }}>
                          {product.stock}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#6b7280' }}>
                      All products have sufficient stock
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
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
                <th>Category</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {stats.topSellingProducts.length > 0 ? (
                stats.topSellingProducts.map((product, index) => (
                  <tr key={product.id}>
                    <td style={{ fontWeight: '600' }}>#{index + 1}</td>
                    <td>{product.name}</td>
                    <td>{product.category.name}</td>
                    <td>{product.totalSold}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', color: '#6b7280' }}>
                    No sales data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 