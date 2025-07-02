import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { apiClient } from '../utils/api';
import { useAuth } from './AuthContext';
import { toastManager } from '../utils/toast';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    images: string[];
  };
}

interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addToCart = async (productId: string, quantity: number) => {
    if (!isAuthenticated) {
      toastManager.error('Please login to add items to cart');
      throw new Error('Please login to add items to cart');
    }

    try {
      setLoading(true);
      await apiClient.post('/cart/items', {
        productId,
        quantity
      });
      await refreshCart();
      toastManager.success('Item added to cart successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add item to cart';
      toastManager.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) {
      toastManager.error('Please login to update cart');
      throw new Error('Please login to update cart');
    }

    try {
      setLoading(true);
      await apiClient.put(`/cart/items/${itemId}`, {
        quantity
      });
      await refreshCart();
      toastManager.success('Cart updated successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update cart item';
      toastManager.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!isAuthenticated) {
      toastManager.error('Please login to remove items from cart');
      throw new Error('Please login to remove items from cart');
    }

    try {
      setLoading(true);
      await apiClient.delete(`/cart/items/${itemId}`);
      await refreshCart();
      toastManager.success('Item removed from cart');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove item from cart';
      toastManager.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      throw new Error('Please login to clear cart');
    }

    try {
      setLoading(true);
      await apiClient.delete('/cart');
      await refreshCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  const getCartTotal = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((count, item) => count + item.quantity, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refreshCart,
    getCartTotal,
    getCartItemCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 