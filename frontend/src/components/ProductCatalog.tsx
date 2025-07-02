import React, { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import './ProductCatalog.css';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [addingToCart, setAddingToCart] = useState<Set<string>>(new Set());
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/products');
      // The API returns {products: [], pagination: {}} format
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]); // Set empty array on error to prevent filter issues
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddToCart = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      alert('Please login to add items to your cart');
      return;
    }

    setAddingToCart(prev => new Set(prev).add(productId));
    try {
      await addToCart(productId, 1);
      alert('Item added to cart successfully!');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setAddingToCart(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  }, [isAuthenticated, addToCart]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="catalog-container">
        <LoadingSpinner size="large" message="Loading products..." />
      </div>
    );
  }

  return (
    <div className="catalog-container">
      <div className="catalog-header">
        <h1>Product Catalog</h1>
        <div className="catalog-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="category-filter">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              addingToCart={addingToCart.has(product.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ProductCatalog; 