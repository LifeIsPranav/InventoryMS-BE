import Alerts from "./pages/Alerts";
import Dashboard from "./pages/Dashboard";
import Header from "./components/Header";
import Inventory from "./pages/Inventory";
import InventoryDetail from "./pages/InventoryDetail";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import ProductDetail from "./pages/ProductDetail";
import Products from "./pages/Products";
import Profile from "./pages/Profile";
import React from "react";
import Register from "./pages/Register";
import Storage from "./pages/Storage";
import Transportation from "./pages/Transportation";
import Users from "./pages/Users";
import Wages from "./pages/Wages";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/inventory/:id" element={<InventoryDetail />} />
              <Route path="/users" element={<Users />} />
              <Route path="/transportation" element={<Transportation />} />
              <Route path="/storage" element={<Storage />} />
              <Route path="/wages" element={<Wages />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
