import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./AdminSidebar.css"; // IMPORTANT

export default function AdminSidebar({ onClose }) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminUser"));

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
        <NavLink className="sidebar-link" to="/admin/rooms">
          🛏 Rooms
        </NavLink>

        <NavLink className="sidebar-link" to="/admin/roomdetails">
          Room Details
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
