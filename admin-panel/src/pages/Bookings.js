// src/pages/Bookings.js
import React, { useEffect, useState } from "react";
import api from "../api";
import "./Bookings.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const res = await api.get("/bookings");

      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.bookings || res.data?.data || [];

      setBookings(list);
      setFilteredList(list);
    } catch (e) {
      setErr("Failed to load bookings");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const del = async (id) => {
    if (!window.confirm("Delete booking?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      load();
    } catch {
      alert("Delete failed");
    }
  };

  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) return setFilteredList(bookings);

    const k = value.toLowerCase();

    setFilteredList(
      bookings.filter((b) =>
        [b.name, b.email, b.phone, `${b.floor}${b.room}`, b.bed]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(k)
      )
    );
  };

  // ⭐ CORRECT FIX FOR PHOTO URL ⭐
function photoUrl(p) {
  if (!p) return "";

  let clean = p.replace(/\\/g, "/");
  clean = clean.replace(/^\.?\/*/, "");

  if (!clean.startsWith("uploads")) {
    clean = "uploads/" + clean;
  }

  return `https://svpg-hostel.onrender.com/${clean}`;
}





  return (
    <div className="booking-page">
      <div className="booking-search-box">
        <input
          type="text"
          className="booking-search-input"
          placeholder="Search name, phone, room, bed..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {err && <div className="alert alert-danger text-center">{err}</div>}

      <div className="booking-grid">
        {filteredList.map((b) => (
          <div className="booking-card glass-card" key={b._id}>
            <div className="booking-header">
              <div className="booking-avatar">
                {b.photo ? (
                  <img src={photoUrl(b.photo)} alt="" />
                ) : (
                  <span>{b.name?.[0]?.toUpperCase()}</span>
                )}
              </div>

              <div>
                <h4 className="booking-name">{b.name}</h4>
                <small className="booking-email">{b.email}</small>
              </div>
            </div>

            <hr className="booking-line" />

            <div className="booking-room-box">
              <strong>Room:</strong>{" "}
              <span className="room-highlight">
                {b.floor}
                {String(b.room).padStart(2, "0")}
              </span>{" "}
              — Bed <strong>{b.bed}</strong>
            </div>

            <div className="booking-details">
              <p>📞 <strong>Phone:</strong> {b.phone}</p>

              <p>
                🆔 <strong>Aadhaar File:</strong>{" "}
                {b.aadharFile ? (
                  <a
                    href={photoUrl(b.aadharFile)}
                    target="_blank"
                    rel="noreferrer"
                    className="booking-link"
                  >
                    View File
                  </a>
                ) : (
                  "No file"
                )}
              </p>

              <p>📅 <strong>Join Date:</strong> {b.joinDate?.substring(0, 10)}</p>
            </div>

            <hr className="booking-line" />

            <button className="delete-btn" onClick={() => del(b._id)}>
              🗑 Delete Booking
            </button>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <h5 className="text-center text-muted mt-4">No bookings found</h5>
      )}
    </div>
  );
}
