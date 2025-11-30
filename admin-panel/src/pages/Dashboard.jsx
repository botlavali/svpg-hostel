import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import "./dashboard.css";

import { FaUsers, FaBed, FaMoneyBillAlt, FaRupeeSign } from "react-icons/fa";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const res = await api.get("/admin/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (err) {
      console.error("Dashboard Load Error:", err);
    }
  };

  const chartData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Bookings", value: stats.totalBookings },
    { name: "Payments", value: stats.totalPayments },
    { name: "Revenue", value: stats.totalRevenue },
  ];

  return (
    <AdminLayout>
      <div className="dash-bg">

        {/* HEADER */}
        <div className="dash-header glass-box">
          <h2>Dashboard Overview</h2>
          <p>Monitor your PG analytics & insights</p>
        </div>

        {/* STAT CARDS */}
        <div className="row g-4 mt-1">
          <DashCard title="Users" value={stats.totalUsers} icon={<FaUsers />} />
          <DashCard title="Bookings" value={stats.totalBookings} icon={<FaBed />} />
          <DashCard title="Payments" value={stats.totalPayments} icon={<FaMoneyBillAlt />} />
          <DashCard title="Revenue" value={`₹${stats.totalRevenue}`} icon={<FaRupeeSign />} />
        </div>

        {/* CHART */}
        <div className="glass-box mt-4 p-4">
          <h5 className="fw-bold mb-3">📊 Analytics Summary</h5>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData}>
              <CartesianGrid stroke="#ffffff40" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip wrapperStyle={{ backgroundColor: "#000", color: "#fff" }} />
              <Bar dataKey="value" fill="#00eaff" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>
    </AdminLayout>
  );
}

function DashCard({ title, value, icon }) {
  return (
    <div className="col-6 col-md-3">
      <div className="dash-card glass-box">
        <div className="dash-icon">{icon}</div>
        <div className="dash-title">{title}</div>
        <div className="dash-value">{value}</div>
      </div>
    </div>
  );
}
