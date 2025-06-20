import React, { useState } from "react";

const initialOrder = {
  packageId: '',
  transportationCost: '',
  status: '',
  products: [{ product: '', quantity: 1 }],
  startLocation: { type: 'Point', coordinates: ['', ''] },
  currentLocation: { type: 'Point', coordinates: ['', ''] },
  destination: { type: 'Point', coordinates: ['', ''] },
  assignedTo: '',
  eta: '',
  transportMode: 'land',
};

const transportModes = ['land', 'air', 'ship'];

export default function OrderForm({ order, onSubmit, onCancel }) {
  // Always use a valid object for form state
  const [form, setForm] = useState(order && typeof order === 'object' ? { ...initialOrder, ...order } : initialOrder);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (idx, field, value) => {
    const products = [...form.products];
    products[idx][field] = value;
    setForm((prev) => ({ ...prev, products }));
  };

  const addProduct = () => {
    setForm((prev) => ({ ...prev, products: [...prev.products, { product: '', quantity: 1 }] }));
  };

  const handleLocationChange = (loc, idx, value) => {
    const location = { ...form[loc] };
    location.coordinates[idx] = value;
    setForm((prev) => ({ ...prev, [loc]: location }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert coordinates to numbers
    const toNum = (arr) => arr.map(Number);
    const data = {
      ...form,
      transportationCost: form.transportationCost ? Number(form.transportationCost) : undefined,
      products: form.products.map((p) => ({ ...p, quantity: Number(p.quantity) })),
      startLocation: { ...form.startLocation, coordinates: toNum(form.startLocation.coordinates) },
      currentLocation: { ...form.currentLocation, coordinates: toNum(form.currentLocation.coordinates) },
      destination: { ...form.destination, coordinates: toNum(form.destination.coordinates) },
      eta: form.eta ? new Date(form.eta) : undefined,
    };
    onSubmit && onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="order-form">
      <label>Package ID
        <input name="packageId" value={form.packageId} onChange={handleChange} required />
      </label>
      <label>Transportation Cost
        <input name="transportationCost" type="number" value={form.transportationCost} onChange={handleChange} />
      </label>
      <label>Status
        <input name="status" value={form.status} onChange={handleChange} />
      </label>
      <div>
        <b>Products</b>
        {form.products.map((p, idx) => (
          <div key={idx}>
            <input placeholder="Product ID" value={p.product} onChange={e => handleProductChange(idx, 'product', e.target.value)} required />
            <input type="number" min="1" value={p.quantity} onChange={e => handleProductChange(idx, 'quantity', e.target.value)} required />
          </div>
        ))}
        <button type="button" onClick={addProduct}>Add Product</button>
      </div>
      <div>
        <b>Start Location</b>
        <input placeholder="Longitude" value={form.startLocation.coordinates[0]} onChange={e => handleLocationChange('startLocation', 0, e.target.value)} />
        <input placeholder="Latitude" value={form.startLocation.coordinates[1]} onChange={e => handleLocationChange('startLocation', 1, e.target.value)} />
      </div>
      <div>
        <b>Current Location</b>
        <input placeholder="Longitude" value={form.currentLocation.coordinates[0]} onChange={e => handleLocationChange('currentLocation', 0, e.target.value)} />
        <input placeholder="Latitude" value={form.currentLocation.coordinates[1]} onChange={e => handleLocationChange('currentLocation', 1, e.target.value)} />
      </div>
      <div>
        <b>Destination</b>
        <input placeholder="Longitude" value={form.destination.coordinates[0]} onChange={e => handleLocationChange('destination', 0, e.target.value)} />
        <input placeholder="Latitude" value={form.destination.coordinates[1]} onChange={e => handleLocationChange('destination', 1, e.target.value)} />
      </div>
      <label>Assigned To
        <input name="assignedTo" value={form.assignedTo} onChange={handleChange} />
      </label>
      <label>ETA
        <input name="eta" type="datetime-local" value={form.eta} onChange={handleChange} />
      </label>
      <label>Transport Mode
        <select name="transportMode" value={form.transportMode} onChange={handleChange} required>
          {transportModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
        </select>
      </label>
      <div style={{ marginTop: 16 }}>
        <button type="submit">Submit</button>
        {onCancel && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
