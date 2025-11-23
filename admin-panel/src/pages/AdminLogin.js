import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

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
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        height: "100vh",
        background: "linear-gradient(135deg, #0d6efd, #6610f2)",
      }}
    >
      <div className="card shadow-lg p-4" style={{ width: "380px", borderRadius: "12px" }}>
        
        <div className="text-center mb-3">
          <div
            style={{
              width: 70,
              height: 70,
              borderRadius: "50%",
              background: "#0d6efd",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: 32,
              color: "white",
              margin: "0 auto 10px auto",
            }}
          >
            👑
          </div>
          <h4 className="fw-bold">Admin Login</h4>
          <p className="text-muted">Access the SV PG Admin Panel</p>
        </div>

        {err && (
          <div className="alert alert-danger py-2 text-center">{err}</div>
        )}

        <form onSubmit={submit}>
          <input
            className="form-control mb-3"
            name="email"
            value={form.email}
            onChange={handle}
            placeholder="Admin Email"
            required
          />

          <input
            className="form-control mb-3"
            type="password"
            name="password"
            value={form.password}
            onChange={handle}
            placeholder="Password"
            required
          />

          <button
            className="btn btn-primary w-100 py-2 fw-bold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

      </div>
    </div>
  );
}
