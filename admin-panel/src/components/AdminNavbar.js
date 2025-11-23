import React from "react";
import { NavLink, useNavigate } from "react-router-dom";

export default function AdminNavbar({ closeSidebar }) {
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("adminUser"));

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    navigate("/admin/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h4 className="fw-bold text-center mb-4" onClick={closeSidebar}>
        SV PG Admin
      </h4>

      <NavLink className="admin-link" to="/admin/dashboard" onClick={closeSidebar}>
        📊 Dashboard
      </NavLink>

      <NavLink className="admin-link" to="/admin/bookings" onClick={closeSidebar}>
        📘 Bookings
      </NavLink>

      <NavLink className="admin-link" to="/admin/payments" onClick={closeSidebar}>
        💳 Payments
      </NavLink>

      <div className="text-center mt-4">
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
