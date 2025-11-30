import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const firstLetter = user ? user.username?.charAt(0)?.toUpperCase() : null;

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-nav sticky-top">
      <div className="container-fluid">

        {/* LOGO */}
        <NavLink className="navbar-brand d-flex align-items-center" to="/">
          <img
            src={process.env.PUBLIC_URL + "/images/pg-icon.png"}
            className="nav-logo me-2"
            alt="logo"
          />
          S.V PG for Gents Only
        </NavLink>

        {/* TOGGLE BUTTON */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* NAV LINKS */}
        <div className="collapse navbar-collapse" id="navMenu">

          <ul className="navbar-nav mx-auto gap-2">

            <li className="nav-item">
              <NavLink className="nav-link" to="/">Home</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/rooms">Rooms</NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/roomdetails">Room Details</NavLink>
            </li>

            {user && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/paymentdetails">Payments</NavLink>
              </li>
            )}

          </ul>

          {/* USER INITIAL CIRCLE OR BUTTONS */}
          {!user ? (
            <>
              <NavLink to="/login" className="btn btn-light btn-sm ms-3">Login</NavLink>
              <NavLink to="/register" className="btn btn-outline-light btn-sm ms-2">Register</NavLink>
            </>
          ) : (
            <>
              {/* USER INITIAL BADGE */}
              <div className="user-circle ms-3">{firstLetter}</div>

              <button className="btn btn-danger btn-sm ms-2" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
}

export default Navbar;
