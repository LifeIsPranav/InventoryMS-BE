import React, { useEffect, useState } from "react";
import WageForm from "../components/WageForm";
import { wagesAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Wages = () => {
  const [wages, setWages] = useState([]);
  const [overworkedEmployees, setOverworkedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [calculating, setCalculating] = useState(false);
  const [activeTab, setActiveTab] = useState('wages');
  const [showForm, setShowForm] = useState(false);
  const [editingWage, setEditingWage] = useState(null);

  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWagesData();
    }
  }, [isAuthenticated]);

  const fetchWagesData = async () => {
    try {
      setLoading(true);
      const [wagesRes, overworkedRes] = await Promise.all([
        wagesAPI.getAll().catch(() => ({ data: { data: { wages: [] } } })),
        wagesAPI.getOverworked().catch(() => ({ data: { data: { employees: [] } } }))
      ]);

      setWages(wagesRes.data.data?.wages || []);
      setOverworkedEmployees(overworkedRes.data.data?.employees || []);
    } catch (err) {
      setError('Failed to fetch wages data');
      console.error('Error fetching wages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateWages = async () => {
    try {
      setCalculating(true);
      await wagesAPI.calculate();
      fetchWagesData();
    } catch (err) {
      setError('Failed to calculate wages');
      console.error('Error calculating wages:', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleCreate = () => {
    setEditingWage(null);
    setShowForm(true);
  };

  const handleEdit = (wage) => {
    setEditingWage(wage);
    setShowForm(true);
  };

  const handleSubmit = async (wageData) => {
    setLoading(true);
    setError('');
    try {
      const method = editingWage ? 'PUT' : 'POST';
      const url = editingWage ? `/api/v1/wages/${editingWage.userId}` : '/api/v1/wages/calculate';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(wageData),
      });
      if (!res.ok) throw new Error('Failed to save wage');
      setShowForm(false);
      fetchWagesData();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        <h3>Login Required</h3>
        <p>Please login to view wages information.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading wages data...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Wages Management</h1>
        {isAdmin && (
          <button
            onClick={handleCalculateWages}
            className="btn btn-primary"
            disabled={calculating}
          >
            {calculating ? 'Calculating...' : 'Calculate Wages'}
          </button>
        )}
      </div>

      {error && <div className="error">{error}</div>}

      {/* Tab Navigation */}
      <div className="flex gap-16 mb-24">
        <button
          onClick={() => setActiveTab('wages')}
          className={`btn ${activeTab === 'wages' ? 'btn-primary' : ''}`}
        >
          Wage Records ({wages.length})
        </button>
        <button
          onClick={() => setActiveTab('overworked')}
          className={`btn ${activeTab === 'overworked' ? 'btn-primary' : ''}`}
        >
          Overworked ({overworkedEmployees.length})
        </button>
      </div>

      {/* Wages Tab */}
      {activeTab === 'wages' && (
        <div>
          {wages.length > 0 ? (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Role</th>
                    <th>Hours This Month</th>
                    <th>Wage Per Hour</th>
                    <th>Extra Shifts</th>
                    <th>Total Earnings</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {wages.map((wage) => (
                    <tr key={wage._id || wage.userId}>
                      <td>
                        <strong>{wage.employeeName || wage.name || 'Unknown'}</strong>
                        {wage.email && <div>{wage.email}</div>}
                      </td>
                      <td>{wage.role || '-'}</td>
                      <td>{wage.hoursThisMonth || 0} hrs</td>
                      <td>₹{wage.wagePerHour || 0}/hr</td>
                      <td>
                        <span className={`status ${wage.extraShift ? 'status-pending' : 'status-active'}`}>
                          {wage.extraShift ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td>
                        <strong>
                          ₹{((wage.hoursThisMonth || 0) * (wage.wagePerHour || 0)).toFixed(2)}
                        </strong>
                      </td>
                      <td>
                        <span className={`status ${wage.active ? 'status-active' : 'status-inactive'}`}>
                          {wage.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleEdit(wage)} className="btn btn-small">Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Wage Records</h3>
              <p>No wage data available. Try calculating wages first.</p>
              {isAdmin && (
                <button
                  onClick={handleCalculateWages}
                  className="btn btn-primary mt-16"
                  disabled={calculating}
                >
                  {calculating ? 'Calculating...' : 'Calculate Wages'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Overworked Tab */}
      {activeTab === 'overworked' && (
        <div>
          {overworkedEmployees.length > 0 ? (
            <div className="grid grid-2">
              {overworkedEmployees.map((employee) => (
                <div key={employee._id} className="card">
                  <div className="card-header">
                    <h3 className="card-title">{employee.name}</h3>
                    <span className="status status-inactive">Overworked</span>
                  </div>
                  
                  <div className="form-group">
                    <strong>Role:</strong> {employee.role}
                  </div>
                  
                  <div className="form-group">
                    <strong>Hours This Month:</strong> {employee.hoursThisMonth || 0}
                  </div>
                  
                  <div className="form-group">
                    <strong>Extra Shifts:</strong> {employee.extraShift ? 'Yes' : 'No'}
                  </div>
                  
                  <div className="form-group">
                    <strong>Wage Per Hour:</strong> ₹{employee.wagePerHour || 0}
                  </div>
                  
                  {employee.shift && (
                    <div className="form-group">
                      <strong>Shift:</strong> {employee.shift}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <strong>Contact:</strong> {employee.email || employee.phone || 'Not available'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Overworked Employees</h3>
              <p>All employees are working within normal hours.</p>
            </div>
          )}
        </div>
      )}

      {/* Summary Statistics */}
      <div className="grid grid-3 mt-24">
        <div className="stat-card">
          <div className="stat-number">
            {wages.reduce((sum, w) => sum + ((w.hoursThisMonth || 0) * (w.wagePerHour || 0)), 0).toFixed(0)}
          </div>
          <div className="stat-label">Total Wages (₹)</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {wages.reduce((sum, w) => sum + (w.hoursThisMonth || 0), 0)}
          </div>
          <div className="stat-label">Total Hours</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {wages.filter(w => w.extraShift).length}
          </div>
          <div className="stat-label">Extra Shifts</div>
        </div>
      </div>

      {/* Wage Form Modal */}
      {showForm && (
        <div className="modal">
          <WageForm
            wage={editingWage}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}
    </div>
  );
};

export default Wages;
