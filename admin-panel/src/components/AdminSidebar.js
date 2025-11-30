import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css"; // IMPORTANT

export default function AdminSidebar({ onClose }) {
  const navigate = useNavigate();

  // SAFE JSON PARSE — prevents dashboard crash
  let admin = null;
  try {
    const stored = localStorage.getItem("adminUser");
    admin = stored ? JSON.parse(stored) : null;
  } catch (err) {
    console.error("Admin parse error:", err);
    admin = null;
  }

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <div className="sidebar-container glass-sidebar">

      <h3 className="sidebar-title" onClick={onClose}>
        SV PG Admin
      </h3>

      <div className="sidebar-menu">

        <NavLink className="sidebar-link" to="/admin/dashboard" onClick={onClose}>
          📊 Dashboard
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/rooms" onClick={onClose}>
          🛏 Rooms
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/roomdetails" onClick={onClose}>
          📝 Room Details
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/bookings" onClick={onClose}>
          📘 Bookings
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/payments" onClick={onClose}>
          💳 Payments
        </NavLink>
      </div>

      <hr className="sidebar-divider" />

      <div className="sidebar-footer">
        <p className="admin-name">👑 {admin?.name || "Admin"}</p>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>

    </div>
  );
}
