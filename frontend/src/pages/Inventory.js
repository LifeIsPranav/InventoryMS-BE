import InventoryForm from "../components/InventoryForm";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { inventoryAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Inventory = () => {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchInventories();
  }, []);

  const fetchInventories = async () => {
    try {
      setLoading(true);
      const response = await inventoryAPI.getAll();
      setInventories(response.data.data?.inventories || []);
    } catch (err) {
      setError('Failed to fetch inventories');
      console.error('Error fetching inventories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (inventoryId) => {
    if (!window.confirm('Are you sure you want to delete this inventory?')) {
      return;
    }

    try {
      await inventoryAPI.delete(inventoryId);
      setInventories(inventories.filter(inv => inv._id !== inventoryId));
    } catch (err) {
      setError('Failed to delete inventory');
      console.error('Error deleting inventory:', err);
    }
  };

  const handleInventoryCreated = () => {
    setShowForm(false);
    fetchInventories();
  };

  // Filter inventories based on search
  const filteredInventories = inventories.filter(inventory => 
    inventory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inventory.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inventory.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading inventories...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Inventories ({filteredInventories.length})</h1>
        {isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Create Inventory
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Search */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search inventories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Inventories List */}
      {filteredInventories.length > 0 ? (
        <div className="grid grid-2">
          {filteredInventories.map((inventory) => (
            <div key={inventory._id} className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Link to={`/inventory/${inventory._id}`} className="nav-link">
                    {inventory.name}
                  </Link>
                </h3>
              </div>
              
              <div className="form-group">
                <strong>Location:</strong> {inventory.location || 'Not specified'}
              </div>
              
              {inventory.description && (
                <div className="form-group">
                  <strong>Description:</strong> {inventory.description}
                </div>
              )}
              
              <div className="form-group">
                <strong>Capacity:</strong>
                <div>Weight: {inventory.totalCapacity || 0} kg</div>
                <div>Volume: {inventory.totalVolume || 0} m³</div>
              </div>
              
              <div className="form-group">
                <strong>Products:</strong> {inventory.products?.length || 0}
              </div>
              
              <div className="form-group">
                <strong>Storage Units:</strong> {inventory.storages?.length || 0}
              </div>
              
              <div className="form-group">
                <strong>Location:</strong> {
                  inventory.inventoryLocation?.coordinates 
                    ? `${inventory.inventoryLocation.coordinates[1]}, ${inventory.inventoryLocation.coordinates[0]}`
                    : 'Not specified'
                }
              </div>

              <div className="card-actions">
                <Link to={`/inventory/${inventory._id}`} className="btn btn-small">
                  View Details
                </Link>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(inventory._id)}
                    className="btn btn-small btn-danger"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Inventories Found</h3>
          <p>
            {searchTerm 
              ? 'No inventories match your search criteria.' 
              : 'Start by creating your first inventory.'
            }
          </p>
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-16"
            >
              Create First Inventory
            </button>
          )}
        </div>
      )}

      {/* Inventory Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Create New Inventory</h2>
              <button
                onClick={() => setShowForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <InventoryForm onSuccess={handleInventoryCreated} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
