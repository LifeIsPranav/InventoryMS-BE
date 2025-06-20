import OrderForm from "../components/OrderForm";
import React, { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      // Orders are handled through transportation endpoint
      const res = await fetch('/api/v1/transports/');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.transports || data.data?.transports || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreate = () => {
    setEditingOrder(null);
    setShowForm(true);
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleSubmit = async (orderData) => {
    setLoading(true);
    setError('');
    try {
      const method = editingOrder ? 'PUT' : 'POST';
      const res = await fetch('/api/v1/buy/order', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error('Failed to save order');
      setShowForm(false);
      fetchOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="orders-page">
      <h2>Orders</h2>
      {error && <div className="error">{error}</div>}
      <button onClick={handleCreate}>Create Order</button>
      {loading && <div>Loading...</div>}
      {!loading && (
        <table>
          <thead>
            <tr>
              <th>Package ID</th>
              <th>Status</th>
              <th>Transport Mode</th>
              <th>ETA</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={idx}>
                <td>{order.packageId}</td>
                <td>{order.status}</td>
                <td>{order.transportMode}</td>
                <td>{order.eta ? new Date(order.eta).toLocaleString() : ''}</td>
                <td>{order.assignedTo}</td>
                <td>
                  <button onClick={() => handleEdit(order)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {showForm && (
        <div className="modal">
          <OrderForm
            order={editingOrder}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
}
