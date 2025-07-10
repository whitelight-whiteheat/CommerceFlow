import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: {
    id: string;
    name: string;
  };
  imageUrl?: string;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl: string;
}

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    categoryId: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get<{ products: Product[]; pagination?: any }>(`/admin/products`);
      const productsData = (response.data as { products: Product[]; pagination?: any }).products || response.data || [];
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await apiClient.get('/admin/categories');
      const categoriesData = response.data as Category[] || [];
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.post<Product>(`/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      setProducts([...products, response.data as Product]);
      setShowAddModal(false);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    try {
      const response = await apiClient.put<Product>(`/products/${editingProduct.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setProducts(products.map(p => p.id === editingProduct.id ? (response.data as Product) : p));
      setShowEditModal(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        categoryId: '',
        imageUrl: ''
      });
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await apiClient.delete(`/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category.id,
      imageUrl: product.imageUrl || ''
    });
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      categoryId: '',
      imageUrl: ''
    });
    setShowAddModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <div className="flex justify-between items-center">
            <h1 className="card-title">Products Management</h1>
            <button 
              onClick={openAddModal}
              className="btn btn-primary"
            >
              + Add Product
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Products ({products.length})</h2>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                  <tr key={product.id}>
                    <td style={{ fontFamily: 'monospace' }}>#{product.id.slice(0, 8)}...</td>
                    <td>
                      <div>
                        <div style={{ fontWeight: '500' }}>{product.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {product.description.substring(0, 50)}...
                        </div>
                      </div>
                    </td>
                    <td>{product.category.name}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${product.stock > 10 ? 'badge-success' : product.stock > 0 ? 'badge-warning' : 'badge-danger'}`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditModal(product)}
                          className="btn btn-primary" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="btn btn-danger" 
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    {loading ? 'Loading products...' : 'No products found. Add your first product to get started!'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Product</h3>
              <button onClick={() => setShowAddModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="form-input"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditModal && editingProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="modal-close">&times;</button>
            </div>
            <form onSubmit={handleEditProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                    className="form-input"
                    rows={3}
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                    required
                    className="form-input"
                  >
                    <option value="">Select Category</option>
                    {Array.isArray(categories) && categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                      required
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})}
                      required
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Image URL (optional)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products; 