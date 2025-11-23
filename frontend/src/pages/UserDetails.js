import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
// import "./UserDetails.css";

function UserDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const booking = state?.booking;

  if (!booking) {
    return (
      <div className="userdetails-container">
        <h2>No booking found!</h2>
        <button onClick={() => navigate("/rooms")}>Back to Rooms</button>
      </div>
    );
  }

  return (
    <div className="userdetails-container">
      <h1>🏠 Booking Details</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Aadhaar</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Emergency</th>
            <th>Join Date</th>
            <th>Floor</th>
            <th>Room</th>
            <th>Bed</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{booking.name}</td>
            <td>{booking.aadharNumber}</td>
            <td>{booking.phone}</td>
            <td>{booking.email}</td>
            <td>{booking.emergency}</td>
            <td>{booking.joinDate}</td>
            <td>{booking.floor}</td>
            <td>{booking.room}</td>
            <td>{booking.bed}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={() => navigate("/rooms")} className="back-btn">
        Back to Rooms
      </button>
    </div>
  );
}

export default UserDetails;
