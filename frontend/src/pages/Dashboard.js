import React, { useEffect, useState } from "react";
import { alertsAPI, inventoryAPI, productsAPI, usersAPI } from "../api";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalInventories: 0,
    totalUsers: 0,
    totalAlerts: 0,
    lowStockProducts: 0,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        productsRes,
        inventoryRes,
        usersRes,
        alertsRes
      ] = await Promise.all([
        productsAPI.getAll().catch(() => ({ data: { data: { products: [] } } })),
        inventoryAPI.getAll().catch(() => ({ data: { data: { inventories: [] } } })),
        usersAPI.getAll().catch(() => ({ data: { data: { users: [] } } })),
        alertsAPI.getAll().catch(() => ({ data: { data: { alerts: [] } } }))
      ]);

      const products = productsRes.data.data?.products || [];
      const inventories = inventoryRes.data.data?.inventories || [];
      const users = usersRes.data.data?.users || [];
      const alerts = alertsRes.data.data?.alerts || [];

      // Calculate low stock products locally
      const lowStock = products.filter(p => 
        p && typeof p === 'object' && 
        p.quantity !== undefined && 
        p.thresholdLimit !== undefined &&
        p.quantity <= p.thresholdLimit
      );

      // Debug log to see the structure
      console.log('Dashboard data:', { products, alerts, lowStock });

      setStats({
        totalProducts: products.length,
        totalInventories: inventories.length,
        totalUsers: users.length,
        totalAlerts: alerts.length,
        lowStockProducts: lowStock.length,
      });

      // Get recent products (last 5) with safety checks
      const safeProducts = products.filter(p => p && typeof p === 'object').slice(-5).reverse();
      setRecentProducts(safeProducts);
      
      // Get alerts with safety checks
      const safeAlerts = alerts.filter(a => a && typeof a === 'object').slice(0, 5);
      setActiveAlerts(safeAlerts);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="mb-24">Dashboard</h1>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalInventories}</div>
          <div className="stat-label">Inventories</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.lowStockProducts}</div>
          <div className="stat-label">Low Stock Items</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalAlerts}</div>
          <div className="stat-label">Active Alerts</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Products</h2>
          </div>
          {recentProducts.length > 0 ? (
            <div>
              {recentProducts.map((product) => (
                <div key={product._id} className="list-item">
                  <div className="list-item-content">
                    <strong>{product.productName || 'Unknown Product'}</strong>
                    <div>Quantity: {product.quantity || 0}</div>
                    <div>Price: ₹{product.price || 0}</div>
                  </div>
                  <div className="list-item-actions">
                    <span className={`status ${(product.quantity || 0) <= (product.thresholdLimit || 0) ? 'status-inactive' : 'status-active'}`}>
                      {(product.quantity || 0) <= (product.thresholdLimit || 0) ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Products Yet</h3>
              <p>Start by adding some products to your inventory.</p>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Active Alerts</h2>
          </div>
          {activeAlerts.length > 0 ? (
            <div>
              {activeAlerts.map((alert, index) => (
                <div key={alert._id || index} className="list-item">
                  <div className="list-item-content">
                    <strong>{alert.type || 'System Alert'}</strong>
                    <div>{alert.message || 'Alert notification'}</div>
                  </div>
                  <div className="list-item-actions">
                    <span className="status status-pending">
                      Active
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No Active Alerts</h3>
              <p>All systems are running smoothly.</p>
            </div>
          )}
        </div>
      </div>

      {stats.lowStockProducts > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">⚠️ Low Stock Alert</h2>
          </div>
          <p>You have {stats.lowStockProducts} products that need restocking. Check the Products page for details.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
