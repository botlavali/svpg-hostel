import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import {
  FaUsers,
  FaBed,
  FaMoneyBillAlt,
  FaRupeeSign,
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalPayments: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const res = await api.get("/admin/overview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(res.data);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      }
    };

    load();
  }, []);

  const chartData = [
    { name: "Users", value: stats.totalUsers },
    { name: "Bookings", value: stats.totalBookings },
    { name: "Payments", value: stats.totalPayments },
    { name: "Revenue", value: stats.totalRevenue },
  ];

  return (
    <AdminLayout>
      {/* HEADER */}
      <div
        className="text-white py-5 px-4 mb-4 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #1f1c2c, #928dab)",
          borderRadius: "16px",
        }}
      >
        <h1 className="fw-bold mb-0">📊 Admin Dashboard</h1>
        <p className="mb-0 opacity-75">Overview of your PG performance</p>
      </div>

      {/* STAT CARDS */}
      <div className="row g-4">
        <DashboardCard
          icon={<FaUsers />}
          label="Total Users"
          value={stats.totalUsers}
          gradient="linear-gradient(135deg, #667eea, #764ba2)"
        />

        <DashboardCard
          icon={<FaBed />}
          label="Total Bookings"
          value={stats.totalBookings}
          gradient="linear-gradient(135deg, #11998e, #38ef7d)"
        />

        <DashboardCard
          icon={<FaMoneyBillAlt />}
          label="Total Payments"
          value={stats.totalPayments}
          gradient="linear-gradient(135deg, #f7971e, #ffd200)"
        />

        <DashboardCard
          icon={<FaRupeeSign />}
          label="Total Revenue"
          value={`₹${stats.totalRevenue}`}
          gradient="linear-gradient(135deg, #fc4a1a, #f7b733)"
        />
      </div>

      {/* BAR GRAPH */}
      <div className="mt-5 p-4 shadow-lg rounded"
        style={{ background: "#fff" }}
      >
        <h4 className="fw-bold mb-3">📊 Summary Bar Chart</h4>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#4a90e2" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* LINE GRAPH */}
      <div className="mt-5 p-4 shadow-lg rounded"
        style={{ background: "#fff" }}
      >
        <h4 className="fw-bold mb-3">📈 Revenue Trend</h4>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="value"
              stroke="#ff6b6b"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}

function DashboardCard({ icon, label, value, gradient }) {
  return (
    <div className="col-md-6 col-lg-3">
      <div
        className="dashboard-card shadow-lg text-white"
        style={{
          background: gradient,
          borderRadius: "40px",
          padding: "25px",
          minHeight: "150px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "0.3s",
        }}
      >
        <div style={{ fontSize: "45px", opacity: 0.9 }}>{icon}</div>

        <div>
          <h6 className="mb-1" style={{ opacity: 0.8 }}>{label}</h6>
          <h2 className="fw-bold mb-0">{value}</h2>
        </div>
      </div>
    </div>
  );
}
