// frontend/src/pages/Welcome.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/welcome.css";

export default function Welcome() {
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimate(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="welcome-wrapper">

      {/* Floating BG Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="welcome-box">
        {/* Logo */}
        <div className={`welcome-logo ${animate ? "show" : ""}`}>
          <span>S.V</span>
        </div>

        {/* Text */}
        <h1 className={`welcome-title ${animate ? "show" : ""}`}>
          Welcome to <span>S.V Gents PG</span>
        </h1>

        <p className={`welcome-subtitle ${animate ? "show" : ""}`}>
          Premium Rooms • Easy Booking • Hassle-Free Living
        </p>

        {/* Button */}
        <button
          className={`welcome-btn ${animate ? "show" : ""}`}
          onClick={() => navigate("/register")}
        >
          Get Started 🚀
        </button>
      </div>
    </div>
  );
}
