import AlertForm from "../components/AlertForm";
import React, { useEffect, useState } from "react";
import { alertsAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [triggerData, setTriggerData] = useState({
    type: 'system',
    message: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAll();
      setAlerts(response.data.data?.alerts || []);
    } catch (err) {
      setError('Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAlert = async (e) => {
    e.preventDefault();
    if (!triggerData.message.trim()) return;

    try {
      await alertsAPI.trigger(triggerData);
      setTriggerData({ type: 'system', message: '' });
      fetchAlerts();
    } catch (err) {
      setError('Failed to trigger alert');
      console.error('Error triggering alert:', err);
    }
  };

  const handleCreate = () => {
    setEditingAlert(null);
    setShowForm(true);
  };

  const handleEdit = (alert) => {
    setEditingAlert(alert);
    setShowForm(true);
  };

  const handleSubmit = async (alertData) => {
    setLoading(true);
    setError('');
    try {
      const method = editingAlert ? 'PUT' : 'POST';
      const url = editingAlert ? `/api/v1/alerts/${editingAlert._id}` : '/api/v1/alerts/trigger';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData),
      });
      if (!res.ok) throw new Error('Failed to save alert');
      setShowForm(false);
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading alerts...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Alerts ({alerts.length})</h1>
        <button onClick={handleCreate}>Trigger Alert</button>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Trigger Alert Form - for testing */}
      {isAuthenticated && (
        <div className="card mb-24">
          <div className="card-header">
            <h2 className="card-title">Trigger Test Alert</h2>
          </div>
          <form onSubmit={handleTriggerAlert}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Alert Type</label>
                <select
                  value={triggerData.type}
                  onChange={(e) => setTriggerData({ ...triggerData, type: e.target.value })}
                  className="form-select"
                >
                  <option value="system">System</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Message</label>
                <input
                  type="text"
                  value={triggerData.message}
                  onChange={(e) => setTriggerData({ ...triggerData, message: e.target.value })}
                  className="form-input"
                  placeholder="Alert message"
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Trigger Alert
            </button>
          </form>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length > 0 ? (
        <div className="grid">
          {alerts.map((alert, index) => (
            <div key={alert._id || index} className="card">
              <div className="card-header">
                <h3 className="card-title">
                  {alert.type?.replace('_', ' ').toUpperCase() || 'ALERT'}
                </h3>
                <span className={`status ${getAlertStatusClass(alert.priority || 'medium')}`}>
                  {alert.priority || 'Medium'}
                </span>
              </div>
              
              <div className="form-group">
                <strong>Message:</strong> {alert.message || 'No message'}
              </div>
              
              {alert.description && (
                <div className="form-group">
                  <strong>Description:</strong> {alert.description}
                </div>
              )}
              
              {alert.affectedItem && (
                <div className="form-group">
                  <strong>Affected Item:</strong> {alert.affectedItem}
                </div>
              )}
              
              <div className="form-group">
                <strong>Status:</strong>
                <span className={`status ${alert.resolved ? 'status-completed' : 'status-pending'}`}>
                  {alert.resolved ? 'Resolved' : 'Active'}
                </span>
              </div>
              
              {alert.timestamp && (
                <div className="form-group">
                  <strong>Created:</strong> {new Date(alert.timestamp).toLocaleString()}
                </div>
              )}
              
              {alert.resolvedAt && (
                <div className="form-group">
                  <strong>Resolved:</strong> {new Date(alert.resolvedAt).toLocaleString()}
                </div>
              )}
              <button onClick={() => handleEdit(alert)} className="btn btn-small">Edit</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Active Alerts</h3>
          <p>All systems are running smoothly. No alerts to display.</p>
          {isAuthenticated && (
            <p>You can trigger a test alert using the form above.</p>
          )}
        </div>
      )}

      {showForm && (
        <div className="modal">
          <AlertForm
            alert={editingAlert}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
};

// Helper function to get status class based on priority
const getAlertStatusClass = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'critical':
      return 'status-inactive';
    case 'medium':
      return 'status-pending';
    case 'low':
      return 'status-active';
    default:
      return 'status-pending';
  }
};

export default Alerts;
