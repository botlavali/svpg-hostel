import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container-fluid">

        {/* LOGO */}
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={process.env.PUBLIC_URL + "/images/pg-icon.png"}
            alt="PG Logo"
            width="40"
            height="40"
            className="me-2 rounded-circle border border-light"
          />
          <span className="fw-bold fs-5">S.V PG for Gents Only</span>
        </NavLink>

        {/* MOBILE TOGGLE */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* NAV LINKS */}
        <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
          <ul className="navbar-nav align-items-center gap-2">

            <li className="nav-item">
              <NavLink to="/" className="nav-link">🏠 Home</NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/rooms" className="nav-link">🛏 Rooms</NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/roomdetails" className="nav-link">📋 Room Details</NavLink>
            </li>

            {/* <li className="nav-item">
              <NavLink to="/bookings" className="nav-link">📚 Bookings</NavLink>
            </li> */}

            {/* USER NOT LOGGED IN */}
            {!user && (
              <>
                <li className="nav-item">
                  <NavLink to="/register" className="btn btn-outline-light btn-sm px-3">
                    📝 Register
                  </NavLink>
                </li>

                <li className="nav-item">
                  <NavLink to="/login" className="btn btn-light btn-sm px-3">
                    🔑 Login
                  </NavLink>
                </li>
              </>
            )}

            {/* USER LOGGED IN */}
            {user && (
              <>
                <li className="nav-item">
                  <NavLink to="/paymentdetails" className="nav-link">
                    💳 Payments
                  </NavLink>
                </li>

                <li className="nav-item text-white me-2">
                  👤 <strong>{user.username || user.email}</strong>
                </li>

                <li className="nav-item">
                  <button onClick={handleLogout} className="btn btn-danger btn-sm px-3">
                    🚪 Logout
                  </button>
                </li>
              </>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
