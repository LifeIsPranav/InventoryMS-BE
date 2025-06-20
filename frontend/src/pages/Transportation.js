import React, { useEffect, useState } from "react";
import TransportationForm from "../components/TransportationForm";
import { transportationAPI } from "../api";

// Helper function to convert location objects to readable strings
const getLocationString = (location) => {
  if (!location) return '';
  
  // If it's already a string, return it
  if (typeof location === 'string') return location;
  
  // If it's an object with coordinates
  if (location.coordinates && Array.isArray(location.coordinates)) {
    const [lng, lat] = location.coordinates;
    return `${lat}, ${lng}`;
  }
  
  // If it's an object with address/name properties
  if (location.address) return location.address;
  if (location.name) return location.name;
  if (location.city && location.state) return `${location.city}, ${location.state}`;
  if (location.city) return location.city;
  
  // If it has type and coordinates (GeoJSON format)
  if (location.type === 'Point' && location.coordinates) {
    const [lng, lat] = location.coordinates;
    return `${lat}, ${lng}`;
  }
  
  // Fallback for other object structures
  if (typeof location === 'object') {
    return JSON.stringify(location);
  }
  
  return '';
};

const Transportation = () => {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusOptions] = useState(['pending', 'in_transit', 'delivered', 'cancelled']);
  const [showForm, setShowForm] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);

  useEffect(() => {
    fetchTransports();
  }, []);

  const fetchTransports = async () => {
    try {
      setLoading(true);
      const response = await transportationAPI.getAll();
      const transportData = response.data.data?.transports || response.data.data?.deliveries || [];
      
      // Debug log to see the structure
      console.log('Transport data:', transportData);
      
      // Ensure we have proper data structure
      const safeTransports = transportData.map(transport => ({
        ...transport,
        _id: transport._id || `temp-${Date.now()}-${Math.random()}`,
        origin: getLocationString(transport.startLocation || transport.pickupLocation) || 'Unknown',
        destination: getLocationString(transport.destination || transport.deliveryLocation) || 'Unknown',
        status: transport.status || 'pending',
        createdAt: transport.createdAt || new Date().toISOString()
      }));
      
      setTransports(safeTransports);
    } catch (err) {
      setError('Failed to fetch transportation data');
      console.error('Error fetching transports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (transportId) => {
    if (!window.confirm('Are you sure you want to cancel this transport?')) {
      return;
    }

    try {
      await transportationAPI.cancel(transportId);
      fetchTransports();
    } catch (err) {
      setError('Failed to cancel transport');
      console.error('Error cancelling transport:', err);
    }
  };

  const fetchByStatus = async (status) => {
    try {
      setLoading(true);
      const response = await transportationAPI.getByStatus(status);
      const transportData = response.data.data?.transports || response.data.data?.deliveries || [];
      
      // Apply the same safe processing as in fetchTransports
      const safeTransports = transportData.map(transport => ({
        ...transport,
        _id: transport._id || `temp-${Date.now()}-${Math.random()}`,
        origin: getLocationString(transport.startLocation || transport.pickupLocation) || 'Unknown',
        destination: getLocationString(transport.destination || transport.deliveryLocation) || 'Unknown',
        status: transport.status || 'pending',
        createdAt: transport.createdAt || new Date().toISOString()
      }));
      
      setTransports(safeTransports);
    } catch (err) {
      console.error('Error fetching by status:', err);
      fetchTransports();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status) {
      fetchByStatus(status);
    } else {
      fetchTransports();
    }
  };

  const handleCreate = () => {
    setEditingTransport(null);
    setShowForm(true);
  };

  const handleEdit = (transport) => {
    setEditingTransport(transport);
    setShowForm(true);
  };

  const handleSubmit = async (transportData) => {
    setLoading(true);
    setError('');
    try {
      const method = editingTransport ? 'PUT' : 'POST';
      const url = editingTransport ? `/api/v1/transports/${editingTransport._id}` : '/api/v1/transports/';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transportData),
      });
      if (!res.ok) throw new Error('Failed to save transportation record');
      setShowForm(false);
      fetchTransports();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading transportation data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Transportation ({transports.length})</h1>
        <button onClick={handleCreate}>Create Transportation</button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Status Filter */}
      <div className="filters">
        <div className="form-group">
          <label className="form-label">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transportation List */}
      {transports.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Assigned Driver</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transports.map((transport) => (
                <tr key={transport._id}>
                  <td>{transport._id ? transport._id.slice(-6) : 'N/A'}</td>
                  <td>{
                    transport.origin || 
                    getLocationString(transport.startLocation || transport.pickupLocation) || 
                    'Unknown'
                  }</td>
                  <td>{
                    transport.destination || 
                    getLocationString(transport.destination || transport.deliveryLocation) || 
                    'Unknown'
                  }</td>
                  <td>
                    <span className={`status ${getStatusClass(transport.status)}`}>
                      {transport.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                    </span>
                  </td>
                  <td>{transport.assignedDriver?.name || transport.driverName || 'Unassigned'}</td>
                  <td>{transport.createdAt ? new Date(transport.createdAt).toLocaleDateString() : '-'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button
                        onClick={() => handleEdit(transport)}
                        className="btn btn-small"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleCancel(transport._id)}
                        className="btn btn-small btn-danger"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Transportation Records</h3>
          <p>
            {statusFilter 
              ? `No transports found with status: ${statusFilter.replace('_', ' ')}`
              : 'No transportation records available.'
            }
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-3 mt-24">
        <div className="stat-card">
          <div className="stat-number">
            {transports.filter(t => t.status === 'pending').length}
          </div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {transports.filter(t => t.status === 'in_transit').length}
          </div>
          <div className="stat-label">In Transit</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {transports.filter(t => t.status === 'delivered').length}
          </div>
          <div className="stat-label">Delivered</div>
        </div>
      </div>

      {/* Transportation Form Modal */}
      {showForm && (
        <div className="modal">
          <TransportationForm
            transportation={editingTransport}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to get status class
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
    case 'completed':
      return 'status-completed';
    case 'in_transit':
    case 'in_progress':
      return 'status-pending';
    case 'cancelled':
    case 'failed':
      return 'status-inactive';
    case 'pending':
    default:
      return 'status-active';
  }
};

export default Transportation;
