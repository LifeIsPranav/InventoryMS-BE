import InventoryForm from "../components/InventoryForm";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { inventoryAPI, productsAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const InventoryDetail = () => {
  const { id } = useParams();
  const [inventory, setInventory] = useState(null);
  const [products, setProducts] = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [costSummary, setCostSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchInventoryDetails();
    fetchAllProducts();
  }, [id]);

  const fetchInventoryDetails = async () => {
    try {
      setLoading(true);
      const [invRes, productsRes, utilizationRes, costRes, allProductsRes] = await Promise.all([
        inventoryAPI.getById(id),
        inventoryAPI.getProducts(id).catch(() => ({ data: { data: { products: [] } } })),
        inventoryAPI.getUtilization(id).catch(() => ({ data: { data: null } })),
        inventoryAPI.getCostSummary(id).catch(() => ({ data: { data: null } })),
        productsAPI.getAll().catch(() => ({ data: { data: { products: [] } } }))
      ]);

      setInventory(invRes.data.data?.inventory);
      
      // Get products and populate them with full details
      const inventoryProducts = productsRes.data.data?.products || [];
      const allProducts = allProductsRes.data.data?.products || [];
      
      // Create a map of all products for quick lookup
      const productMap = {};
      allProducts.forEach(product => {
        productMap[product._id] = product;
      });
      
      // Populate inventory products with full product details
      const populatedProducts = inventoryProducts.map((item) => {
        const productId = item.product?._id || item.product;
        const fullProduct = productMap[productId];
        
        if (fullProduct) {
          return {
            ...item,
            product: fullProduct
          };
        }
        
        // Fallback for products not found
        return {
          ...item,
          product: {
            _id: productId,
            productName: `Unknown Product`,
            price: 0
          }
        };
      });
      
      setProducts(populatedProducts);
      setUtilization(utilizationRes.data.data);
      setCostSummary(costRes.data.data);
      
      // Debug log to see product structure
      console.log('Inventory products:', inventoryProducts);
      console.log('All products:', allProducts);
      console.log('Populated products:', populatedProducts);
      console.log('First product structure:', populatedProducts?.[0]);
    } catch (err) {
      setError('Failed to fetch inventory details');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setAllProducts(response.data.data?.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await inventoryAPI.addProduct(id, {
        productId: selectedProduct,
        quantity: quantity
      });
      setShowAddProduct(false);
      setSelectedProduct('');
      setQuantity(1);
      fetchInventoryDetails();
    } catch (err) {
      setError('Failed to add product to inventory');
      console.error('Error adding product:', err);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm('Remove this product from inventory?')) return;

    try {
      await inventoryAPI.removeProduct(id, { productId });
      fetchInventoryDetails();
    } catch (err) {
      setError('Failed to remove product from inventory');
      console.error('Error removing product:', err);
    }
  };

  const handleUpdateSuccess = () => {
    setEditMode(false);
    fetchInventoryDetails();
  };

  if (loading) {
    return <div className="loading">Loading inventory details...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!inventory) {
    return <div className="error">Inventory not found</div>;
  }

  if (editMode) {
    return (
      <div>
        <div className="flex justify-between items-center mb-24">
          <h1>Edit Inventory</h1>
          <button
            onClick={() => setEditMode(false)}
            className="btn"
          >
            Cancel
          </button>
        </div>
        <div className="card">
          <InventoryForm
            inventory={inventory}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setEditMode(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>{inventory.name}</h1>
        <div className="flex gap-16">
          {isAuthenticated && (
            <button
              onClick={() => setShowAddProduct(true)}
              className="btn btn-primary"
            >
              Add Product
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setEditMode(true)}
              className="btn"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Inventory Information</h2>
          </div>
          
          <div className="form-group">
            <strong>Name:</strong> {inventory.name}
          </div>
          
          <div className="form-group">
            <strong>Location:</strong> {inventory.location || 'Not specified'}
          </div>
          
          {inventory.description && (          <div className="form-group">
            <strong>Description:</strong> {inventory.description}
          </div>
        )}

        <div className="form-group">
          <strong>Capacity:</strong>
          <div>Weight: {inventory.totalCapacity || 0} kg</div>
          <div>Volume: {inventory.totalVolume || 0} m³</div>
          </div>
        </div>

        {utilization && (
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Utilization</h2>
            </div>
            
            <div className="form-group">
              <strong>Weight Used:</strong> {inventory.capacityOccupied || 0} / {inventory.totalCapacity || 0} kg
              {inventory.totalCapacity > 0 && (
                <div>({((inventory.capacityOccupied || 0) / inventory.totalCapacity * 100).toFixed(1)}%)</div>
              )}
            </div>
            
            <div className="form-group">
              <strong>Volume Used:</strong> {inventory.volumeOccupied || 0} / {inventory.totalVolume || 0} m³
              {inventory.totalVolume > 0 && (
                <div>({((inventory.volumeOccupied || 0) / inventory.totalVolume * 100).toFixed(1)}%)</div>
              )}
            </div>
          </div>
        )}
      </div>

      {costSummary && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Cost Summary</h2>
          </div>
          <div className="form-row">
            <div className="form-group">
              <strong>Total Value:</strong> ₹{(costSummary.totalValue || 0).toFixed(2)}
            </div>
            <div className="form-group">
              <strong>Average Cost per Item:</strong> ₹{(costSummary.averageCost || 0).toFixed(2)}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Products ({products.length})</h2>
        </div>
        
        {products.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Value</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, index) => {
                  // Handle both populated and non-populated product references
                  const product = item.product || item;
                  const productId = product._id || product;
                  
                  // If we have full product details
                  if (product.productName) {
                    const productName = product.productName;
                    const productCategory = product.productCategory || '';
                    const price = product.price || 0;
                    const quantity = item.quantity || product.quantity || 0;
                    
                    return (
                      <tr key={productId || index}>
                        <td>
                          <strong>{productName}</strong>
                          {productCategory && <div>{productCategory}</div>}
                        </td>
                        <td>{quantity}</td>
                        <td>₹{price.toFixed(2)}</td>
                        <td>₹{(quantity * price).toFixed(2)}</td>
                        <td>
                          {isAuthenticated && (
                            <button
                              onClick={() => handleRemoveProduct(productId)}
                              className="btn btn-small btn-danger"
                            >
                              Remove
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  }
                  
                  // Fallback for products that couldn't be populated
                  const quantity = item.quantity || 0;
                  return (
                    <tr key={productId || index}>
                      <td>
                        <strong>Product {productId}</strong>
                        <div style={{fontSize: '0.8em', color: '#666'}}>Unable to load product details</div>
                      </td>
                      <td>{quantity}</td>
                      <td>₹0.00</td>
                      <td>₹0.00</td>
                      <td>
                        {isAuthenticated && (
                          <button
                            onClick={() => handleRemoveProduct(productId)}
                            className="btn btn-small btn-danger"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <h3>No Products</h3>
            <p>This inventory doesn't have any products yet.</p>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add Product to Inventory</h2>
              <button
                onClick={() => setShowAddProduct(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="form-select"
                  required
                >
                  <option value="">Select a product</option>
                  {allProducts.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.productName} - ₹{product.price}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="form-input"
                  min="1"
                  required
                />
              </div>
              
              <div className="flex gap-16">
                <button type="submit" className="btn btn-primary">
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="btn"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryDetail;
