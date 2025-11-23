import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/AuthModernBlue.css";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showSuccessBox, setShowSuccessBox] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // ✔ FIX: removed extra /api
      const res = await api.post("/users/login", formData);

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("acceptedRules");

      setShowSuccessBox(true);

      setTimeout(() => navigate("/rules"), 1200);

    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "❌ Invalid login.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-blue-container">
      <div className="auth-right d-flex align-items-center justify-content-center bg-white">
        <div className="auth-card shadow-lg p-4 rounded-4 w-100" style={{ maxWidth: "400px" }}>
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary mb-1">Welcome Back!</h3>
            <p className="text-muted small">Login to your account</p>
          </div>

          {message.text && (
            <div className={`alert ${message.type === "error" ? "alert-danger" : "alert-success"} py-2 text-center`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                name="email"
                type="email"
                className="form-control form-control-lg"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <input
                name="password"
                type="password"
                className="form-control form-control-lg"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button className="btn btn-primary w-100 rounded-pill fw-bold" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      {showSuccessBox && (
        <div className="popup-box">
          <div className="popup-content">
            <h4 className="text-success fw-bold">✅ Login Successful</h4>
            <p>Redirecting to your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
