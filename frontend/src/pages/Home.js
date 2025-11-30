import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    const user = localStorage.getItem("user");
    const acceptedRules = localStorage.getItem("acceptedRules");

    if (!user) return navigate("/register");
    if (!acceptedRules) return navigate("/rules");
    navigate("/rooms");
  };

  return (
    <div className="home-container">
      <div className="logo-wrapper">
        <img src="/images/svpg-logo.png" alt="SV PG Logo" className="main-logo" />
      </div>

      <h1 className="title">Welcome to S.V Gents PG</h1>
      <p className="subtitle">
        Comfortable rooms, fast booking, and a safe stay — all in one place.
      </p>

      <button className="btn btn-primary btn-lg start-btn" onClick={handleStart}>
        🚀 Get Started
      </button>
    </div>
  );
}
