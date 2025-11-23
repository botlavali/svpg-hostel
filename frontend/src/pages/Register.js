import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaPhone, FaLock } from "react-icons/fa";
import api from "../api";
import "../styles/AuthModernBlue.css";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccessBox, setShowSuccessBox] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ❗ FIXED API PATH — no double /api
      const res = await api.post("/users/register", formData);

      console.log("REGISTER SUCCESS:", res.data);

      setShowSuccessBox(true);

      // Redirect to login after 2s
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      console.error("❌ Registration Error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-blue-container">

      {/* LEFT SIDE */}
      <div className="auth-left d-none d-md-flex flex-column justify-content-center align-items-center text-white text-center">
        <div className="brand-circle mb-3">🏠</div>
        <h2 className="fw-bold mb-2">Welcome to S.V PG Hostel</h2>
        <p className="small px-5">
          Comfortable, secure and premium living experience.
        </p>
        <button
          className="btn btn-outline-light rounded-pill mt-3 px-4"
          onClick={() => navigate("/login")}
        >
          Sign In
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="auth-right d-flex align-items-center justify-content-center bg-white">
        <div className="auth-card shadow-lg p-4 rounded-4 w-100" style={{ maxWidth: "400px" }}>
          <div className="text-center mb-4">
            <h3 className="fw-bold text-primary mb-1">Create Account</h3>
            <p className="text-muted small">Join the S.V PG community</p>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <FaUser />
              </span>
              <input
                name="username"
                className="form-control"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <FaEnvelope />
              </span>
              <input
                name="email"
                type="email"
                className="form-control"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-3">
              <span className="input-group-text bg-light">
                <FaPhone />
              </span>
              <input
                name="phone"
                className="form-control"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-group mb-4">
              <span className="input-group-text bg-light">
                <FaLock />
              </span>
              <input
                name="password"
                type="password"
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="btn btn-primary w-100 rounded-pill fw-bold"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
            </button>

            <p className="text-center mt-3 small">
              Already have an account?{" "}
              <span
                className="text-primary fw-semibold link-text"
                onClick={() => navigate("/login")}
              >
                Login here
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* SUCCESS POPUP */}
      {showSuccessBox && (
        <div className="popup-box">
          <div className="popup-content">
            <h4 className="text-success fw-bold">✅ Registration Successful!</h4>
            <p>You’ll be redirected to login shortly.</p>
          </div>
        </div>
      )}

    </div>
  );
}
