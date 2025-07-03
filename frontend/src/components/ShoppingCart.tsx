import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './ShoppingCart.css';

const ShoppingCart: React.FC = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showOrderSummary, setShowOrderSummary] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Please login to view your cart</h2>
          <p>You need to be logged in to access your shopping cart.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-container">
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
          <button className="continue-shopping-btn">Continue Shopping</button>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItems(prev => new Set(prev).add(itemId));
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      try {
        await removeFromCart(itemId);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      try {
        await clearCart();
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const handleCheckout = () => {
    // This would typically navigate to checkout or create order
    alert('Proceeding to checkout...');
  };

  const subtotal = getCartTotal();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  return (
    <div className="cart-container">
      <div className="cart-header">
        <div className="cart-title">
          <h1>Shopping Cart</h1>
          <span className="cart-count">{cart.items.length} items</span>
        </div>
        <button onClick={handleClearCart} className="clear-cart-btn">
          Clear Cart
        </button>
      </div>

      <div className="cart-content">
        <div className="cart-items-section">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  {item.product.images && item.product.images.length > 0 ? (
                    <img src={item.product.images[0]} alt={item.product.name} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                </div>
                
                <div className="item-details">
                  <h3 className="item-name">{item.product.name}</h3>
                  <p className="item-description">{item.product.description}</p>
                  <p className="item-price">${item.product.price.toFixed(2)} each</p>
                  <div className="item-stock">
                    {item.product.stock > 0 ? (
                      <span className="in-stock">In Stock: {item.product.stock}</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                </div>
                
                <div className="item-quantity">
                  <label>Quantity:</label>
                  <div className="quantity-controls">
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={updatingItems.has(item.id) || item.quantity <= 1}
                      className="quantity-btn"
                    >
                      −
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={updatingItems.has(item.id) || item.quantity >= item.product.stock}
                      className="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  {updatingItems.has(item.id) && <span className="updating">Updating...</span>}
                </div>
                
                <div className="item-total">
                  <p className="total-amount">${(item.product.price * item.quantity).toFixed(2)}</p>
                </div>
                
                <div className="item-actions">
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="remove-btn"
                    disabled={updatingItems.has(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary-section">
          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cart.items.length} items):</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span className="free-shipping">Free</span>
            </div>
            
            <div className="summary-row">
              <span>Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            
            <div className="summary-actions">
              <button 
                className="checkout-btn" 
                disabled={loading}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
              
              <button 
                className="continue-shopping-btn"
                onClick={() => window.history.back()}
              >
                Continue Shopping
              </button>
            </div>

            <div className="cart-benefits">
              <div className="benefit">
                <span className="benefit-icon">🚚</span>
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🔄</span>
                <span>30-day return policy</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🔒</span>
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShoppingCart; 