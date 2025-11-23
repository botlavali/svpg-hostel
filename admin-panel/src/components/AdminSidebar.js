import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminSidebar({ onClose }) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminUser"));

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h4 className="fw-bold text-center mb-4 text-white" onClick={onClose}>
        SV PG Admin
      </h4>

      <NavLink className="admin-link" to="/admin/dashboard" onClick={onClose}>
        📊 Dashboard
      </NavLink>

      <NavLink className="admin-link" to="/admin/bookings" onClick={onClose}>
        📘 Bookings
      </NavLink>

      <NavLink className="admin-link" to="/admin/payments" onClick={onClose}>
        💳 Payments
      </NavLink>

      <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />

      <div className="text-center mt-4 text-white">
        <div className="mb-2">👑 {admin?.name || "Admin"}</div>
        <button className="btn btn-danger btn-sm" onClick={logout}>
          Logout
        </button>
      </div>

      <style>{`
        .admin-link {
          display: block;
          padding: 12px;
          color: white;
          text-decoration: none;
          margin-bottom: 10px;
          border-radius: 5px;
          font-size: 17px;
        }
        .admin-link:hover {
          background: rgba(255,255,255,0.2);
        }
        .admin-link.active {
          background: rgba(255,255,255,0.3);
        }
      `}</style>
    </div>
  );
}
