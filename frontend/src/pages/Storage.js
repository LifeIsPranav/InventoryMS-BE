import React, { useEffect, useState } from "react";
import StorageForm from "../components/StorageForm";
import { storageAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Storage = () => {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    fetchStorages();
  }, []);

  const fetchStorages = async () => {
    try {
      setLoading(true);
      console.log('Fetching storages...');
      const response = await storageAPI.getAll();
      console.log('Storage API response:', response);
      console.log('Storage data:', response.data);
      const storageData = response.data.data?.storages || response.data.storages || response.data || [];
      console.log('Parsed storage data:', storageData);
      setStorages(storageData);
    } catch (err) {
      setError('Failed to fetch storage units');
      console.error('Error fetching storages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (storageId) => {
    if (!window.confirm('Are you sure you want to delete this storage unit?')) {
      return;
    }

    try {
      await storageAPI.delete(storageId);
      setStorages(storages.filter(s => s._id !== storageId));
    } catch (err) {
      setError('Failed to delete storage unit');
      console.error('Error deleting storage:', err);
    }
  };

  const handleStorageCreated = () => {
    setShowForm(false);
    fetchStorages();
  };

  // Filter storages based on search
  const filteredStorages = storages.filter(storage => 
    storage.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    storage.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    storage.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading storage units...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Storage Units ({filteredStorages.length})</h1>
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Add Storage
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Search */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search storage units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      {/* Storage List */}
      {filteredStorages.length > 0 ? (
        <div className="grid grid-2">
          {filteredStorages.map((storage) => (
            <div key={storage._id} className="card">
              <div className="card-header">
                <h3 className="card-title">{storage.name || 'Unnamed Storage'}</h3>
                <span className={`status ${storage.active ? 'status-active' : 'status-inactive'}`}>
                  {storage.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="form-group">
                <strong>Type:</strong> {storage.type || 'Not specified'}
              </div>
              
              <div className="form-group">
                <strong>Location:</strong> {storage.location || 'Not specified'}
              </div>
              
              {storage.description && (
                <div className="form-group">
                  <strong>Description:</strong> {storage.description}
                </div>
              )}
              
              <div className="form-group">
                <strong>Capacity:</strong>
                <div>Max Weight: {storage.maxWeight || 0} kg</div>
                <div>Max Volume: {storage.maxVolume || 0} m³</div>
              </div>
              
              {storage.temperature && (
                <div className="form-group">
                  <strong>Temperature:</strong>
                  <div>Min: {storage.temperature.min}°C</div>
                  <div>Max: {storage.temperature.max}°C</div>
                </div>
              )}
              
              <div className="form-group">
                <strong>Current Load:</strong>
                <div>Weight: {storage.currentWeight || 0} kg</div>
                <div>Volume: {storage.currentVolume || 0} m³</div>
              </div>
              
              {storage.maxWeight > 0 && (
                <div className="form-group">
                  <strong>Weight Utilization:</strong> 
                  {((storage.currentWeight || 0) / storage.maxWeight * 100).toFixed(1)}%
                </div>
              )}
              
              {storage.maxVolume > 0 && (
                <div className="form-group">
                  <strong>Volume Utilization:</strong> 
                  {((storage.currentVolume || 0) / storage.maxVolume * 100).toFixed(1)}%
                </div>
              )}

              <div className="card-actions">
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {/* Could implement edit functionality */}}
                      className="btn btn-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(storage._id)}
                      className="btn btn-small btn-danger"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Storage Units Found</h3>
          <p>
            {searchTerm 
              ? 'No storage units match your search criteria.' 
              : 'Start by adding your first storage unit.'
            }
          </p>
          {isAuthenticated && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary mt-16"
            >
              Add First Storage Unit
            </button>
          )}
        </div>
      )}

      {/* Storage Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Add New Storage Unit</h2>
              <button
                onClick={() => setShowForm(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            <StorageForm 
              onSuccess={handleStorageCreated} 
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-3 mt-24">
        <div className="stat-card">
          <div className="stat-number">
            {storages.filter(s => s.active).length}
          </div>
          <div className="stat-label">Active Units</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {storages.reduce((sum, s) => sum + (s.currentWeight || 0), 0).toFixed(0)}
          </div>
          <div className="stat-label">Total Weight (kg)</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {storages.reduce((sum, s) => sum + (s.currentVolume || 0), 0).toFixed(1)}
          </div>
          <div className="stat-label">Total Volume (m³)</div>
        </div>
      </div>
    </div>
  );
};

export default Storage;
