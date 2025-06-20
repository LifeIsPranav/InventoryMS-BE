import React, { useEffect, useState } from "react";
import { usersAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const { isAuthenticated, isAdmin } = useAuth();

  const roles = ['admin', 'staff', 'supplier', 'driver'];

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.data?.users || []);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await usersAPI.deleteUser(userId);
      setUsers(users.filter(u => u._id !== userId));
    } catch (err) {
      setError('Failed to delete user');
      console.error('Error deleting user:', err);
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await usersAPI.updateUser(userId, updates);
      fetchUsers();
    } catch (err) {
      setError('Failed to update user');
      console.error('Error updating user:', err);
    }
  };

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone?.includes(searchTerm);
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!isAuthenticated) {
    return (
      <div className="empty-state">
        <h3>Login Required</h3>
        <p>Please login to view users.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-24">
        <h1>Users ({filteredUsers.length})</h1>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="form-select"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Shift</th>
                <th>Wage/Hr</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <strong>{user.name}</strong>
                  </td>
                  <td>
                    {user.email && <div>{user.email}</div>}
                    {user.phone && <div>{user.phone}</div>}
                  </td>
                  <td>
                    <span className={`status ${getRoleClass(user.role)}`}>
                      {user.role?.toUpperCase()}
                    </span>
                  </td>
                  <td>{user.shift || '-'}</td>
                  <td>₹{user.wagePerHour || 0}</td>
                  <td>
                    {user.hoursThisMonth || 0}
                    {user.extraShift && (
                      <span className="status status-pending">Extra</span>
                    )}
                  </td>
                  <td>
                    <span className={`status ${user.active ? 'status-active' : 'status-inactive'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-8">
                      {isAdmin && user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleUpdateUser(user._id, { active: !user.active })}
                            className={`btn btn-small ${user.active ? 'btn-danger' : 'btn-primary'}`}
                          >
                            {user.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="btn btn-small btn-danger"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <h3>No Users Found</h3>
          <p>
            {searchTerm || roleFilter 
              ? 'No users match your search criteria.' 
              : 'No users available.'
            }
          </p>
        </div>
      )}

      {/* Role Statistics */}
      <div className="grid grid-2 mt-24">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Users by Role</h2>
          </div>
          {roles.map(role => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="form-group">
                <strong>{role.charAt(0).toUpperCase() + role.slice(1)}:</strong> {count}
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">User Status</h2>
          </div>
          <div className="form-group">
            <strong>Active:</strong> {users.filter(u => u.active).length}
          </div>
          <div className="form-group">
            <strong>Inactive:</strong> {users.filter(u => !u.active).length}
          </div>
          <div className="form-group">
            <strong>Working Extra Shifts:</strong> {users.filter(u => u.extraShift).length}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get role-based styling
const getRoleClass = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'status-inactive';
    case 'staff':
      return 'status-active';
    case 'supplier':
      return 'status-pending';
    case 'driver':
      return 'status-completed';
    default:
      return 'status-active';
  }
};

export default Users;
