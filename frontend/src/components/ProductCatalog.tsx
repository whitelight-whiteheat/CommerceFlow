import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
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
  const [imageIndexes, setImageIndexes] = useState<Record<string, number>>({});
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/products');
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
      const response = await apiClient.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleAddToCart = async (productId: string) => {
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
  };

  const nextImage = (productId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (productId: string, totalImages: number) => {
    setImageIndexes(prev => ({
      ...prev,
      [productId]: prev[productId] === 0 ? totalImages - 1 : (prev[productId] || 0) - 1
    }));
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category.id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="catalog-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
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
          filteredProducts.map(product => {
            const currentImageIndex = imageIndexes[product.id] || 0;
            const hasMultipleImages = product.images && product.images.length > 1;
            
            return (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <>
                      <img 
                        src={product.images[currentImageIndex]} 
                        alt={`${product.name} ${currentImageIndex + 1}`}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/300x300?text=Image+Not+Available';
                        }}
                      />
                      {hasMultipleImages && (
                        <>
                          <button 
                            className="image-nav-btn prev-btn"
                            onClick={() => prevImage(product.id, product.images.length)}
                            aria-label="Previous image"
                          >
                            ‹
                          </button>
                          <button 
                            className="image-nav-btn next-btn"
                            onClick={() => nextImage(product.id, product.images.length)}
                            aria-label="Next image"
                          >
                            ›
                          </button>
                          <div className="image-indicators">
                            {product.images.map((_, index) => (
                              <span 
                                key={index} 
                                className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  {product.stock === 0 && (
                    <div className="out-of-stock">Out of Stock</div>
                  )}
                </div>
                
                <div className="product-info">
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-category">{product.category.name}</div>
                  <div className="product-price">${product.price.toFixed(2)}</div>
                  <div className="product-stock">
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </div>
                </div>
                
                <div className="product-actions">
                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={product.stock === 0 || addingToCart.has(product.id)}
                    className="add-to-cart-btn"
                  >
                    {addingToCart.has(product.id) ? 'Adding...' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ProductCatalog; 