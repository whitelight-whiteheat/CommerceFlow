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

type SortOption = 'name' | 'price-low' | 'price-high' | 'newest' | 'popular';

const ProductCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 1000 });
  const [showFilters, setShowFilters] = useState(false);
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
      setProducts((response.data as { products: Product[] }).products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/categories');
      setCategories(response.data as Category[]);
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

  const sortProducts = (products: Product[]): Product[] => {
    const sorted = [...products];
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'newest':
        return sorted.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
      case 'popular':
        return sorted.sort((a, b) => b.stock - a.stock); // Using stock as popularity proxy
      default:
        return sorted;
    }
  };

  const filteredProducts = sortProducts(
    products.filter(product => {
      const matchesCategory = !selectedCategory || product.category.id === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;
      return matchesCategory && matchesSearch && matchesPrice;
    })
  );

  const clearFilters = () => {
    setSelectedCategory('');
    setSearchTerm('');
    setSortBy('newest');
    setPriceRange({ min: 0, max: 1000 });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory) count++;
    if (searchTerm) count++;
    if (sortBy !== 'newest') count++;
    if (priceRange.min > 0 || priceRange.max < 1000) count++;
    return count;
  };

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
        <div className="catalog-title">
          <h1>Product Catalog</h1>
          <span className="product-count">{filteredProducts.length} products</span>
        </div>
        
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
          
          <div className="sort-filter">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="newest">Newest First</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>

          <button
            className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="advanced-filters">
          <div className="filter-section">
            <h3>Category</h3>
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

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-range">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) || 0 }))}
                className="price-input"
              />
              <span>to</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) || 1000 }))}
                className="price-input"
              />
            </div>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear All Filters
          </button>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="clear-filters-btn">
              Clear All Filters
            </button>
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