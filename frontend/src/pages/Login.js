import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/AuthModernBlue.css";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showSuccessBox, setShowSuccessBox] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/users/login", formData);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.removeItem("acceptedRules");

      setShowSuccessBox(true);
      setTimeout(() => navigate("/rules"), 1500);

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="auth-blue-container">

      <div className="auth-card text-center">
        <div className="logo-circle">
          <img src="/images/svpg-logo.png" alt="logo" />
        </div>

        <h3 className="text-white fw-bold mb-3">Login</h3>

        <form onSubmit={handleSubmit}>

          <div className="input-group mb-3">
            <span className="input-group-text bg-transparent text-white"><FaEnvelope /></span>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              className="form-control text-white"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group mb-4">
            <span className="input-group-text bg-transparent text-white"><FaLock /></span>
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="form-control text-white"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button className="btn btn-primary w-100 rounded-pill fw-bold">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-white mt-3">
          Don't have an account?{" "}
          <span className="text-warning" style={{ cursor: "pointer" }} onClick={() => navigate("/register")}>
            Register
          </span>
        </p>
      </div>

      {showSuccessBox && (
        <div className="popup-box">
          <div className="popup-content">
            <h4 className="text-success fw-bold">✅ Login Successful!</h4>
            <p>Redirecting...</p>
          </div>
        </div>
      )}
    </div>
  );
}
