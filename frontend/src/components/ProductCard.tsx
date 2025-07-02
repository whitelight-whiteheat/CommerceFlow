import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

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

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => Promise<void>;
  addingToCart: boolean;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  onAddToCart, 
  addingToCart 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const hasMultipleImages = product.images && product.images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? product.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      alert('Please login to add items to your cart');
      return;
    }
    onAddToCart(product.id);
  };

  return (
    <div className="product-card">
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
                  onClick={prevImage}
                  aria-label="Previous image"
                >
                  ‹
                </button>
                <button 
                  className="image-nav-btn next-btn"
                  onClick={nextImage}
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
      </div>
      
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-category">{product.category.name}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-price">${product.price.toFixed(2)}</div>
        <div className="product-stock">
          {product.stock > 0 ? (
            <span className="in-stock">In Stock: {product.stock}</span>
          ) : (
            <span className="out-of-stock">Out of Stock</span>
          )}
        </div>
        <button
          className={`add-to-cart-btn ${product.stock === 0 ? 'disabled' : ''}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || addingToCart}
        >
          {addingToCart ? 'Adding...' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard; 