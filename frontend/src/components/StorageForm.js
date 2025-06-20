import React, { useEffect, useState } from "react";
import { inventoryAPI, storageAPI } from "../api";

const StorageForm = ({ storage, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    locationId: storage?.locationId || '',
    dimensions: {
      length: storage?.dimensions?.length || 0,
      width: storage?.dimensions?.width || 0,
      height: storage?.dimensions?.height || 0,
    },
    holdingCapacity: storage?.holdingCapacity || 0,
    Volume: storage?.Volume || 0,
    inventory: storage?.inventory || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inventories, setInventories] = useState([]);

  useEffect(() => {
    // Fetch all inventories for selection
    inventoryAPI.getAll().then(res => {
      setInventories(res.data.data?.inventories || []);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('dimensions.')) {
      const dim = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dim]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'holdingCapacity' || name === 'Volume' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const submitData = {
        locationId: formData.locationId,
        dimensions: formData.dimensions,
        holdingCapacity: formData.holdingCapacity,
        Volume: formData.Volume, // Always include Volume
        inventory: formData.inventory,
      };
      if (storage) {
        await storageAPI.update(storage._id, submitData);
      } else {
        await storageAPI.create(submitData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${storage ? 'update' : 'create'} storage unit`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <div className="form-group">
        <label htmlFor="locationId" className="form-label">Location ID *</label>
        <input
          type="text"
          id="locationId"
          name="locationId"
          value={formData.locationId}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Dimensions (cm) *</label>
        <div className="form-row">
          <input
            type="number"
            name="dimensions.length"
            value={formData.dimensions.length}
            onChange={handleChange}
            className="form-input"
            placeholder="Length"
            min="0"
            step="0.1"
            required
          />
          <input
            type="number"
            name="dimensions.width"
            value={formData.dimensions.width}
            onChange={handleChange}
            className="form-input"
            placeholder="Width"
            min="0"
            step="0.1"
            required
          />
          <input
            type="number"
            name="dimensions.height"
            value={formData.dimensions.height}
            onChange={handleChange}
            className="form-input"
            placeholder="Height"
            min="0"
            step="0.1"
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="holdingCapacity" className="form-label">Holding Capacity (kg) *</label>
          <input
            type="number"
            id="holdingCapacity"
            name="holdingCapacity"
            value={formData.holdingCapacity}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="Volume" className="form-label">Volume (cm³)</label>
          <input
            type="number"
            id="Volume"
            name="Volume"
            value={formData.Volume}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
            placeholder="Optional"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="inventory" className="form-label">Inventory *</label>
        <select
          id="inventory"
          name="inventory"
          value={formData.inventory}
          onChange={handleChange}
          className="form-input"
          required
        >
          <option value="">Select Inventory</option>
          {inventories.map(inv => (
            <option key={inv._id} value={inv._id}>{inv.name}</option>
          ))}
        </select>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Saving...' : (storage ? 'Update Storage' : 'Create Storage')}
        </button>
      </div>
    </form>
  );
};

export default StorageForm;
