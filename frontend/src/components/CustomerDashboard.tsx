import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './CustomerDashboard.css';

interface Order {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total: number;
  createdAt: string;
  items: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

const CustomerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [orderFilter, setOrderFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
      setProfileData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/orders');
      setOrders((response.data as { orders: Order[] }).orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await apiClient.put('/users/profile', profileData);
      alert('Profile updated successfully!');
      setEditingProfile(false);
      window.location.reload(); // Simple refresh to update context
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return '#ffc107';
      case 'PROCESSING': return '#17a2b8';
      case 'SHIPPED': return '#007bff';
      case 'DELIVERED': return '#28a745';
      case 'CANCELLED': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return '⏳';
      case 'PROCESSING': return '⚙️';
      case 'SHIPPED': return '📦';
      case 'DELIVERED': return '✅';
      case 'CANCELLED': return '❌';
      default: return '📋';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status.toLowerCase() === orderFilter);

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
    cancelled: orders.filter(o => o.status === 'CANCELLED').length
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Please login to access your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name}!</h1>
          <p>Manage your profile and track your orders</p>
        </div>
        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👤 Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          📦 Orders ({orders.length})
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="profile-header">
              <h2>Profile Information</h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="edit-btn"
              >
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <div className="profile-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  disabled={!editingProfile}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  disabled={!editingProfile}
                  className="form-input"
                />
              </div>

              {editingProfile && (
                <button onClick={handleProfileUpdate} className="save-btn">
                  Save Changes
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="orders-section">
            <div className="orders-header">
              <h2>Order History</h2>
              <div className="order-stats">
                <div className="stat-item">
                  <span className="stat-number">{orderStats.total}</span>
                  <span className="stat-label">Total Orders</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{orderStats.delivered}</span>
                  <span className="stat-label">Delivered</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{orderStats.pending}</span>
                  <span className="stat-label">Pending</span>
                </div>
              </div>
            </div>

            <div className="order-filters">
              <button
                className={`filter-btn ${orderFilter === 'all' ? 'active' : ''}`}
                onClick={() => setOrderFilter('all')}
              >
                All Orders
              </button>
              <button
                className={`filter-btn ${orderFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setOrderFilter('pending')}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${orderFilter === 'processing' ? 'active' : ''}`}
                onClick={() => setOrderFilter('processing')}
              >
                Processing
              </button>
              <button
                className={`filter-btn ${orderFilter === 'shipped' ? 'active' : ''}`}
                onClick={() => setOrderFilter('shipped')}
              >
                Shipped
              </button>
              <button
                className={`filter-btn ${orderFilter === 'delivered' ? 'active' : ''}`}
                onClick={() => setOrderFilter('delivered')}
              >
                Delivered
              </button>
            </div>
            
            {loading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="no-orders">
                <div className="empty-icon">📦</div>
                <h3>No orders found</h3>
                <p>Start shopping to see your order history here.</p>
                <button className="continue-shopping-btn">Continue Shopping</button>
              </div>
            ) : (
              <div className="orders-list">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-id">
                          <h3>Order #{order.id.slice(-8)}</h3>
                          <span className="order-date">{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="order-status">
                          <span className="status-icon">{getStatusIcon(order.status)}</span>
                          <span
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(order.status) }}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="order-total">
                        <span className="total-label">Total</span>
                        <span className="total-amount">${order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="order-items">
                      <h4>Order Items ({order.items.length})</h4>
                      <div className="items-grid">
                        {order.items.map((item) => (
                          <div key={item.id} className="order-item">
                            <div className="item-image">
                              {item.product.images && item.product.images.length > 0 ? (
                                <img src={item.product.images[0]} alt={item.product.name} />
                              ) : (
                                <div className="no-image">No Image</div>
                              )}
                            </div>
                            <div className="item-details">
                              <h5>{item.product.name}</h5>
                              <p>Quantity: {item.quantity}</p>
                              <p>Price: ${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard; 