import ProductForm from "../components/ProductForm";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      const productsData = response.data.data?.products || [];
      setProducts(productsData);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(productsData.map(p => p.productCategory).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(productId);
      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleProductCreated = () => {
    setShowForm(false);
    fetchProducts();
  };

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || product.productCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Products ({filteredProducts.length})</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Add Product
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products List */}
      {filteredProducts.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id}>
                  <td>
                    <Link to={`/products/${product._id}`} className="nav-link">
                      <strong>{product.productName}</strong>
                    </Link>
                    {product.sku && <div>SKU: {product.sku}</div>}
                  </td>
                  <td>{product.productCategory || '-'}</td>
                  <td>₹{product.price}</td>
                  <td>{product.quantity}</td>
                  <td>
                    <span className={`status ${
                      product.quantity <= (product.thresholdLimit || 0) 
                        ? 'status-inactive' 
                        : 'status-active'
                    }`}>
                      {product.quantity <= (product.thresholdLimit || 0) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-8">
                      <Link to={`/products/${product._id}`} className="btn btn-small">
                        View
                      </Link>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(product._id)}
                          className="btn btn-small btn-danger"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Products Found</h3>
          <p>
            {searchTerm || categoryFilter 
              ? 'No products match your search criteria.' 
              : 'Start by adding your first product.'
            }
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-16"
            >
              Add First Product
            </button>
          )}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Product</h2>
              <button
                onClick={() => setShowForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <ProductForm onSuccess={handleProductCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
