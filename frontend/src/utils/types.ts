// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  address?: string;
  phone?: string;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Filter and Sort Types
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
}

export type SortOption = 'name' | 'price' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

// Toast Notification Types
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
} 

export type AnalyticsData = {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  topProducts: Array<{ id?: string; name: string; sales: number }>;
  salesByMonth: Array<{ month: string; sales: number }>;
  userRegistrationsByMonth: Array<{ month: string; users: number }>;
}

// Type Guard for Analytics Data
// This function checks if the data is a valid AnalyticsData object
export function isAnalyticsData(data: any): data is AnalyticsData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.totalSales === 'number' &&
    typeof data.totalOrders === 'number' &&
    typeof data.averageOrderValue === 'number' &&
    Array.isArray(data.topProducts) &&
    data.topProducts.every(
      (item: any) =>
        (typeof item.id === 'string' || typeof item.id === 'undefined') &&
        typeof item.name === 'string' &&
        typeof item.sales === 'number'
    ) &&
    Array.isArray(data.salesByMonth) &&
    data.salesByMonth.every(
      (item: any) =>
        typeof item.month === 'string' &&
        typeof item.sales === 'number'
    ) &&
    Array.isArray(data.userRegistrationsByMonth) &&
    data.userRegistrationsByMonth.every(
      (item: any) =>
        typeof item.month === 'string' &&
        typeof item.users === 'number'
    )
  );
}