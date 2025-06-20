import React, { useState } from "react";
import { authAPI } from "../api";
import { useAuth } from "../contexts/AuthContext";

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile form data
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Only send fields that have changed
      const updates = {};
      if (profileData.name !== user.name) updates.name = profileData.name;
      if (profileData.email !== user.email) updates.email = profileData.email;
      if (profileData.phone !== user.phone) updates.phone = profileData.phone;

      if (Object.keys(updates).length === 0) {
        setError('No changes to update');
        return;
      }

      await authAPI.updateProfile(updates);
      setSuccess('Profile updated successfully');
      
      // Update local user data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 4 || passwordData.newPassword.length > 10) {
      setError('Password must be between 4 and 10 characters');
      return;
    }

    setLoading(true);

    try {
      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccess('Password updated successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="empty-state">
        <h3>Please Login</h3>
        <p>You need to be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-24">My Profile</h1>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      {/* Tab Navigation */}
      <div className="flex gap-16 mb-24">
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : ''}`}
        >
          Profile Information
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`btn ${activeTab === 'password' ? 'btn-primary' : ''}`}
        >
          Change Password
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Update Profile</h2>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={profileData.name}
                  onChange={handleProfileChange}
                  className="form-input"
                  minLength="3"
                  maxLength="20"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleProfileChange}
                  className="form-input"
                  maxLength="10"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Current Information</h2>
            </div>
            
            <div className="form-group">
              <strong>Name:</strong> {user.name}
            </div>
            
            <div className="form-group">
              <strong>Email:</strong> {user.email || 'Not provided'}
            </div>
            
            <div className="form-group">
              <strong>Phone:</strong> {user.phone || 'Not provided'}
            </div>
            
            <div className="form-group">
              <strong>Role:</strong>
              <span className={`status ${user.role === 'admin' ? 'status-inactive' : 'status-active'}`}>
                {user.role?.toUpperCase()}
              </span>
            </div>
            
            {user.shift && (
              <div className="form-group">
                <strong>Shift:</strong> {user.shift}
              </div>
            )}
            
            {user.wagePerHour && (
              <div className="form-group">
                <strong>Wage per Hour:</strong> ₹{user.wagePerHour}
              </div>
            )}
            
            <div className="form-group">
              <strong>Status:</strong>
              <span className={`status ${user.active ? 'status-active' : 'status-inactive'}`}>
                {user.active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="card" style={{ maxWidth: '500px' }}>
          <div className="card-header">
            <h2 className="card-title">Change Password</h2>
          </div>
          <form onSubmit={handleUpdatePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword" className="form-label">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="newPassword" className="form-label">
                New Password (4-10 characters)
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="form-input"
                minLength="4"
                maxLength="10"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="form-input"
                minLength="4"
                maxLength="10"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}

      {/* Logout Section */}
      <div className="card mt-24">
        <div className="card-header">
          <h2 className="card-title">Account Actions</h2>
        </div>
        <p>Need to sign out?</p>
        <button
          onClick={logout}
          className="btn btn-danger mt-16"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
