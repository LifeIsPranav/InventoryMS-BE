import React, { useState } from "react";
import { inventoryAPI } from "../api";

const InventoryForm = ({ inventory, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: inventory?.name || '',
    totalCapacity: inventory?.totalCapacity || 0,
    totalVolume: inventory?.totalVolume || 0,
    latitude: inventory?.inventoryLocation?.coordinates?.[1] || 0,
    longitude: inventory?.inventoryLocation?.coordinates?.[0] || 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['totalCapacity', 'totalVolume', 'latitude', 'longitude'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        totalCapacity: Number(formData.totalCapacity) || 0,
        totalVolume: Number(formData.totalVolume) || 0,
        inventoryLocation: {
          type: 'Point',
          coordinates: [formData.longitude, formData.latitude]
        }
      };
      console.log('Submitting inventory data:', submitData); // Debug log
      if (inventory) {
        await inventoryAPI.update(inventory._id, submitData);
      } else {
        await inventoryAPI.create(submitData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${inventory ? 'update' : 'create'} inventory`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <div className="form-group">
        <label htmlFor="name" className="form-label">Inventory Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="totalCapacity" className="form-label">Total Capacity</label>
          <input
            type="number"
            id="totalCapacity"
            name="totalCapacity"
            value={formData.totalCapacity}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            placeholder="Maximum capacity"
          />
        </div>
        <div className="form-group">
          <label htmlFor="totalVolume" className="form-label">Total Volume</label>
          <input
            type="number"
            id="totalVolume"
            name="totalVolume"
            value={formData.totalVolume}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            placeholder="Maximum volume"
          />
        </div>
      </div>
      <div className="form-section">
        <h3>Location Coordinates</h3>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude" className="form-label">Latitude *</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              className="form-input"
              step="0.000001"
              required
              placeholder="e.g., 12.9716"
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude" className="form-label">Longitude *</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              className="form-input"
              step="0.000001"
              required
              placeholder="e.g., 77.5946"
            />
          </div>
        </div>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : (inventory ? 'Update Inventory' : 'Create Inventory')}
        </button>
      </div>
    </form>
  );
};

export default InventoryForm;
