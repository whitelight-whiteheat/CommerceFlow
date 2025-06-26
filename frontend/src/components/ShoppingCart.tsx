import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import './ShoppingCart.css';

const ShoppingCart: React.FC = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
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
          <h2>Your cart is empty</h2>
          <p>Add some products to get started!</p>
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

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <button onClick={handleClearCart} className="clear-cart-btn">
          Clear Cart
        </button>
      </div>

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
              <h3>{item.product.name}</h3>
              <p className="item-description">{item.product.description}</p>
              <p className="item-price">${item.product.price.toFixed(2)}</p>
            </div>
            
            <div className="item-quantity">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={updatingItems.has(item.id) || item.quantity <= 1}
                  className="quantity-btn"
                >
                  -
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
              <p>${(item.product.price * item.quantity).toFixed(2)}</p>
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

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal:</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping:</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total:</span>
          <span>${getCartTotal().toFixed(2)}</span>
        </div>
        
        <button className="checkout-btn" disabled={loading}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default ShoppingCart; 