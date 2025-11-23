import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
export default function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    const user = localStorage.getItem("user");
    const acceptedRules = localStorage.getItem("acceptedRules");

    if (!user) {
      navigate("/register"); // Not logged in → Register page
      return;
    }

    if (!acceptedRules) {
      navigate("/rules"); // Logged in but rules not accepted
      return;
    }

    navigate("/rooms"); // Logged in & accepted rules
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🏠 Welcome to S.V Gents PG</h1>
        <p style={styles.text}>
          Comfortable rooms, fast booking, safe stay — everything in one place!
        </p>

        <button style={styles.button} onClick={handleStart}>
          🚀 Get Started
        </button>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3c72, #2a5298)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },

  card: {
    background: "#fff",
    padding: "60px 40px",
    borderRadius: "16px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
    textAlign: "center",
    width: "100%",
    maxWidth: "500px",
    animation: "fadeIn 0.9s ease",
  },

  title: {
    fontSize: "2.4rem",
    fontWeight: "bold",
    color: "#0d6efd",
    marginBottom: "15px",
  },

  text: {
    fontSize: "1.1rem",
    color: "#666",
    marginBottom: "30px",
  },

  button: {
    background: "#0d6efd",
    color: "#fff",
    border: "none",
    fontSize: "1.2rem",
    padding: "12px 25px",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.3s",
  },
};

/* Hover effect */
styles.button[":hover"] = {
  background: "#084298",
};
