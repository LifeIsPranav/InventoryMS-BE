import React, { useState } from "react";
import { productsAPI } from "../api";

const ProductForm = ({ product, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    productName: product?.productName || '',
    batchId: product?.batchId || '',
    productCategory: product?.productCategory || '',
    price: product?.price || 0,
    quantity: product?.quantity || 0,
    weight: product?.weight || 0,
    dimensions: {
      length: product?.dimensions?.length || 0,
      width: product?.dimensions?.width || 0,
      height: product?.dimensions?.height || 0,
    },
    description: product?.description || '',
    thresholdLimit: product?.thresholdLimit || 0,
    shelfLifeDays: product?.shelfLifeDays || 0,
    mfgDate: product?.mfgDate ? product.mfgDate.slice(0,10) : '',
    expiryDate: product?.expiryDate ? product.expiryDate.slice(0,10) : '',
    supplierId: product?.supplierId || '',
    supplierLocation: {
      type: 'Point',
      coordinates: [
        product?.supplierLocation?.coordinates?.[0] || 0,
        product?.supplierLocation?.coordinates?.[1] || 0
      ]
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseFloat(value) || 0
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: ['price', 'quantity', 'weight', 'thresholdLimit', 'shelfLifeDays'].includes(name) 
          ? parseFloat(value) || 0 
          : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Clean the form data to only send non-empty values
      const cleanedData = {};
      
      // Always include required fields
      if (formData.productName) cleanedData.productName = formData.productName;
      if (formData.price !== undefined && formData.price !== null) cleanedData.price = formData.price;
      
      // Optional fields - only include if they have meaningful values
      if (formData.batchId && formData.batchId.trim()) cleanedData.batchId = formData.batchId.trim();
      if (formData.productCategory && formData.productCategory.trim()) cleanedData.productCategory = formData.productCategory.trim();
      if (formData.quantity > 0) cleanedData.quantity = formData.quantity;
      if (formData.weight > 0) cleanedData.weight = formData.weight;
      if (formData.thresholdLimit > 0) cleanedData.thresholdLimit = formData.thresholdLimit;
      if (formData.shelfLifeDays > 0) cleanedData.shelfLifeDays = formData.shelfLifeDays;
      if (formData.description && formData.description.trim()) cleanedData.description = formData.description.trim();
      
      // Dimensions - only include if at least one dimension is provided
      if (formData.dimensions.length > 0 || formData.dimensions.width > 0 || formData.dimensions.height > 0) {
        cleanedData.dimensions = formData.dimensions;
      }
      // Dates
      if (formData.mfgDate) cleanedData.mfgDate = new Date(formData.mfgDate);
      if (formData.expiryDate) cleanedData.expiryDate = new Date(formData.expiryDate);
      // Supplier
      if (formData.supplierId && formData.supplierId.trim()) cleanedData.supplierId = formData.supplierId.trim();
      // Supplier Location (GeoJSON Point)
      if (
        formData.supplierLocation &&
        Array.isArray(formData.supplierLocation.coordinates) &&
        formData.supplierLocation.coordinates.length === 2 &&
        (formData.supplierLocation.coordinates[0] !== 0 || formData.supplierLocation.coordinates[1] !== 0)
      ) {
        cleanedData.supplierLocation = {
          type: 'Point',
          coordinates: [
            parseFloat(formData.supplierLocation.coordinates[0]),
            parseFloat(formData.supplierLocation.coordinates[1])
          ]
        };
      }

      if (product) {
        await productsAPI.update(product._id, cleanedData);
      } else {
        await productsAPI.create(cleanedData);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${product ? 'update' : 'create'} product`);
      console.error('Error saving product:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label htmlFor="productName" className="form-label">
          Product Name *
        </label>
        <input
          type="text"
          id="productName"
          name="productName"
          value={formData.productName}
          onChange={handleChange}
          className="form-input"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="batchId" className="form-label">
            Batch ID
          </label>
          <input
            type="text"
            id="batchId"
            name="batchId"
            value={formData.batchId}
            onChange={handleChange}
            className="form-input"
            placeholder="Enter batch identifier"
          />
        </div>
        <div className="form-group">
          <label htmlFor="productCategory" className="form-label">
            Category
          </label>
          <input
            type="text"
            id="productCategory"
            name="productCategory"
            value={formData.productCategory}
            onChange={handleChange}
            className="form-input"
            placeholder="e.g., Electronics, Food, etc."
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="price" className="form-label">
            Price ($)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="quantity" className="form-label">
            Quantity
          </label>
          <input
            type="number"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>
        <div className="form-group">
          <label htmlFor="thresholdLimit" className="form-label">
            Low Stock Threshold
          </label>
          <input
            type="number"
            id="thresholdLimit"
            name="thresholdLimit"
            value={formData.thresholdLimit}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="weight" className="form-label">
            Weight (kg)
          </label>
          <input
            type="number"
            id="weight"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="form-input"
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="shelfLifeDays" className="form-label">
            Shelf Life (days)
          </label>
          <input
            type="number"
            id="shelfLifeDays"
            name="shelfLifeDays"
            value={formData.shelfLifeDays}
            onChange={handleChange}
            className="form-input"
            min="0"
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Dimensions (cm)</label>
        <div className="form-row">
          <div className="form-group">
            <input
              type="number"
              name="dimensions.length"
              value={formData.dimensions.length}
              onChange={handleChange}
              className="form-input"
              placeholder="Length"
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              name="dimensions.width"
              value={formData.dimensions.width}
              onChange={handleChange}
              className="form-input"
              placeholder="Width"
              min="0"
              step="0.1"
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              name="dimensions.height"
              value={formData.dimensions.height}
              onChange={handleChange}
              className="form-input"
              placeholder="Height"
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="mfgDate" className="form-label">
            Manufacturing Date
          </label>
          <input
            type="date"
            id="mfgDate"
            name="mfgDate"
            value={formData.mfgDate}
            onChange={handleChange}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label htmlFor="expiryDate" className="form-label">
            Expiry Date
          </label>
          <input
            type="date"
            id="expiryDate"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="form-input"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="supplierId" className="form-label">
            Supplier ID
          </label>
          <input
            type="text"
            id="supplierId"
            name="supplierId"
            value={formData.supplierId}
            onChange={handleChange}
            className="form-input"
            placeholder="Supplier ID"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Supplier Location (Lng, Lat)</label>
          <div className="form-row">
            <input
              type="number"
              name="supplierLocation.coordinates.0"
              value={formData.supplierLocation.coordinates[0]}
              onChange={e => setFormData(prev => ({
                ...prev,
                supplierLocation: {
                  ...prev.supplierLocation,
                  coordinates: [parseFloat(e.target.value) || 0, prev.supplierLocation.coordinates[1]]
                }
              }))}
              className="form-input"
              placeholder="Longitude"
              step="0.000001"
            />
            <input
              type="number"
              name="supplierLocation.coordinates.1"
              value={formData.supplierLocation.coordinates[1]}
              onChange={e => setFormData(prev => ({
                ...prev,
                supplierLocation: {
                  ...prev.supplierLocation,
                  coordinates: [prev.supplierLocation.coordinates[0], parseFloat(e.target.value) || 0]
                }
              }))}
              className="form-input"
              placeholder="Latitude"
              step="0.000001"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-16">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
