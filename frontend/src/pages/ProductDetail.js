import ProductForm from "../components/ProductForm";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getById(id);
      setProduct(response.data.data?.product);
    } catch (err) {
      setError('Failed to fetch product details');
      console.error('Error fetching product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await productsAPI.delete(product._id);
      navigate('/products');
    } catch (err) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    }
  };

  const handleUpdateSuccess = () => {
    setEditMode(false);
    fetchProduct();
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  if (editMode) {
    return (
      <div>
        <div className="flex justify-between items-center mb-24">
          <h1>Edit Product</h1>
          <button
            onClick={() => setEditMode(false)}
            className="btn"
          >
            Cancel
          </button>
        </div>
        <div className="card">
          <ProductForm
            product={product}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setEditMode(false)}
          />
        </div>
      </div>
    );
  }

  const volume = product.dimensions?.length * product.dimensions?.width * product.dimensions?.height || 0;
  const isLowStock = product.quantity <= (product.thresholdLimit || 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>{product.productName}</h1>
        <div className="flex gap-16">
          {isAuthenticated && (
            <button
              onClick={() => setEditMode(true)}
              className="btn btn-primary"
            >
              Edit
            </button>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Basic Information</h2>
          </div>
          
          <div className="form-group">
            <strong>Product Name:</strong> {product.productName}
          </div>
          
          {product.sku && (
            <div className="form-group">
              <strong>SKU:</strong> {product.sku}
            </div>
          )}
          
          {product.productCategory && (
            <div className="form-group">
              <strong>Category:</strong> {product.productCategory}
            </div>
          )}
          
          <div className="form-group">
            <strong>Price:</strong> ₹{product.price}
          </div>
          
          <div className="form-group">
            <strong>Quantity:</strong> 
            <span className={isLowStock ? 'status status-inactive' : 'status status-active'}>
              {product.quantity} {isLowStock && '(Low Stock)'}
            </span>
          </div>
          
          {product.thresholdLimit > 0 && (
            <div className="form-group">
              <strong>Low Stock Threshold:</strong> {product.thresholdLimit}
            </div>
          )}

          {product.description && (
            <div className="form-group">
              <strong>Description:</strong>
              <p>{product.description}</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Physical Properties</h2>
          </div>
          
          {product.weight > 0 && (
            <div className="form-group">
              <strong>Weight:</strong> {product.weight} kg
            </div>
          )}
          
          {volume > 0 && (
            <div className="form-group">
              <strong>Dimensions:</strong> {product.dimensions.length} × {product.dimensions.width} × {product.dimensions.height} cm
            </div>
          )}
          
          {volume > 0 && (
            <div className="form-group">
              <strong>Volume:</strong> {volume.toFixed(2)} cm³
            </div>
          )}
          
          {product.shelfLifeDays > 0 && (
            <div className="form-group">
              <strong>Shelf Life:</strong> {product.shelfLifeDays} days
            </div>
          )}

          {product.batchId && (
            <div className="form-group">
              <strong>Batch ID:</strong> {product.batchId}
            </div>
          )}
        </div>
      </div>

      {(product.mfgDate || product.expiryDate) && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Dates</h2>
          </div>
          <div className="form-row">
            {product.mfgDate && (
              <div className="form-group">
                <strong>Manufacturing Date:</strong> {new Date(product.mfgDate).toLocaleDateString()}
              </div>
            )}
            {product.expiryDate && (
              <div className="form-group">
                <strong>Expiry Date:</strong> {new Date(product.expiryDate).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">System Information</h2>
        </div>
        <div className="form-row">
          <div className="form-group">
            <strong>Created:</strong> {new Date(product.createdAt).toLocaleString()}
          </div>
          <div className="form-group">
            <strong>Updated:</strong> {new Date(product.updatedAt).toLocaleString()}
          </div>
        </div>
        
        <div className="form-group">
          <strong>Restock Recommended:</strong> 
          <span className={`status ${product.restockRecommended ? 'status-pending' : 'status-active'}`}>
            {product.restockRecommended ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
