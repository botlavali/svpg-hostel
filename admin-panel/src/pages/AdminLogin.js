import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "./adminLogin.css";  // <-- IMPORTANT

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await api.post("/admin/login", form);

      if (res.data.success) {
        localStorage.setItem("adminToken", res.data.token);
        localStorage.setItem("adminUser", JSON.stringify(res.data.admin));
        navigate("/admin/dashboard");
      } else {
        setErr(res.data.message);
      }
    } catch (error) {
      setErr(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">

      <div className="login-card glass-box">

        <div className="login-header">
          <div className="login-icon">👑</div>
          <h2>Admin Login</h2>
          <p>Access the SV PG Admin Panel</p>
        </div>

        {err && <div className="error-box">{err}</div>}

        <form onSubmit={submit}>
          <input
            className="input-box"
            name="email"
            value={form.email}
            onChange={handle}
            placeholder="Admin Email"
            required
          />

          <input
            className="input-box"
            type="password"
            name="password"
            value={form.password}
            onChange={handle}
            placeholder="Password"
            required
          />

          <button className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>

    </div>
  );
}
