import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          InventoryMS
        </Link>

        <nav className="nav">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Dashboard
          </Link>
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
            Products
          </Link>
          <Link to="/inventory" className={`nav-link ${isActive('/inventory') ? 'active' : ''}`}>
            Inventory
          </Link>
          <Link to="/transportation" className={`nav-link ${isActive('/transportation') ? 'active' : ''}`}>
            Transport
          </Link>
          <Link to="/storage" className={`nav-link ${isActive('/storage') ? 'active' : ''}`}>
            Storage
          </Link>
          <Link to="/alerts" className={`nav-link ${isActive('/alerts') ? 'active' : ''}`}>
            Alerts
          </Link>
          <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
            Orders
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/wages" className={`nav-link ${isActive('/wages') ? 'active' : ''}`}>
                Wages
              </Link>
              <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
                Users
              </Link>
            </>
          )}
        </nav>

        <div className="auth-section">
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="user-info">
                {user?.name} ({user?.role})
              </Link>
              <button onClick={handleLogout} className="btn btn-small">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-small">
                Login
              </Link>
              <Link to="/register" className="btn btn-small btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
