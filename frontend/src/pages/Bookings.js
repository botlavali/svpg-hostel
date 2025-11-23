import React, { useEffect, useState } from "react";
import api from "../api";
import "../styles/Bookings.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ PG structure (same as Rooms.js)
  const ROOM_STRUCTURE = {
    1: [2, 2, 3, 3, 2, 2],
    2: [2, 2, 3, 3, 2, 2],
    3: [2, 2, 3, 3, 2, 2],
    4: [2, 2, 3, 3, 2, 2],
    5: [2, 2, 3, 3, 2, 2],
    6: [2, 2, 3, 3], // 601–602 (2-sharing), 603–604 (3-sharing)
  };

  // ✅ Calculate totals
  const allBeds = Object.entries(ROOM_STRUCTURE).flatMap(([floor, rooms]) =>
    rooms.map((beds, i) => ({
      floor: Number(floor),
      room: i + 1,
      type: beds,
    }))
  );

  const totalBeds = allBeds.reduce((sum, r) => sum + r.type, 0);
  const totalTwoSharing = allBeds.filter((r) => r.type === 2).length * 2;
  const totalThreeSharing = allBeds.filter((r) => r.type === 3).length * 3;

  // ✅ Load Bookings
  const loadBookings = async () => {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data || []);
    } catch (err) {
      console.error("❌ Failed to load bookings:", err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // ✅ Search filter
  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.name?.toLowerCase().includes(term) ||
      b.email?.toLowerCase().includes(term) ||
      (b.phone && b.phone.toString().includes(term)) ||
      (b.aadharNumber && b.aadharNumber.toString().includes(term))
    );
  });

  // ✅ Stats
  const bookedBeds = bookings.length;
  const availableBeds = Math.max(0, totalBeds - bookedBeds);
  const bookedTwoSharing = bookings.filter(
    (b) => ROOM_STRUCTURE[b.floor]?.[b.room - 1] === 2
  ).length;
  const bookedThreeSharing = bookings.filter(
    (b) => ROOM_STRUCTURE[b.floor]?.[b.room - 1] === 3
  ).length;

  const availableTwoSharing = totalTwoSharing - bookedTwoSharing;
  const availableThreeSharing = totalThreeSharing - bookedThreeSharing;

  const getRoomNumber = (floor, room) =>
    `${floor}${String(room).padStart(2, "0")}`;

  return (
    <div className="container py-4">
      {/* ✅ Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4">
        <h3 className="fw-bold text-primary mb-3 mb-md-0">
          🏠 S.V PG Hostel — All Bookings
        </h3>

        <div className="d-flex flex-column flex-md-row align-items-md-center gap-3">
          <input
            type="text"
            className="form-control shadow-sm"
            placeholder="🔍 Search name, email, phone, Aadhaar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: "280px" }}
          />
        </div>
      </div>

      {/* ✅ Summary Stats */}
      <div className="row text-center mb-4">
        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-primary text-white">
            <h6 className="fw-bold mb-1">🛏 Total Beds</h6>
            <h5 className="fw-bold">{totalBeds}</h5>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-success text-white">
            <h6 className="fw-bold mb-1">✅ Booked</h6>
            <h5 className="fw-bold">{bookedBeds}</h5>
          </div>
        </div>

        <div className="col-md-4 mb-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-warning text-dark">
            <h6 className="fw-bold mb-1">🟡 Available</h6>
            <h5 className="fw-bold">{availableBeds}</h5>
          </div>
        </div>
      </div>

      {/* ✅ Sharing Stats Section */}
      <div className="row mb-4 text-center">
        <div className="col-md-6 mb-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
            <h6 className="text-primary fw-bold mb-1">🛌 2-Sharing Beds</h6>
            <p className="mb-0 fw-semibold">
              Total: {totalTwoSharing} | Booked: {bookedTwoSharing} | Available:{" "}
              {availableTwoSharing}
            </p>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card border-0 shadow-sm rounded-4 p-3 bg-light">
            <h6 className="text-primary fw-bold mb-1">🛏 3-Sharing Beds</h6>
            <p className="mb-0 fw-semibold">
              Total: {totalThreeSharing} | Booked: {bookedThreeSharing} |
              Available: {availableThreeSharing}
            </p>
          </div>
        </div>
      </div>

      {/* ✅ Bookings List */}
      <div className="row gy-4">
        {filteredBookings.map((b) => (
          <div className="col-md-6 col-lg-4" key={b._id}>
            <div className="card shadow-lg border-0 rounded-4 h-100 booking-card hover-card overflow-hidden">
              {/* Image */}
              {b.photo ? (
                <img
                  src={`http://localhost:5000/${b.photo}`}
                  alt={b.name}
                  className="card-img-top"
                  style={{
                    height: "200px",
                    objectFit: "cover",
                    borderTopLeftRadius: "16px",
                    borderTopRightRadius: "16px",
                  }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light text-muted"
                  style={{
                    height: "200px",
                    fontSize: "18px",
                    fontWeight: "500",
                  }}
                >
                  📷 No Image
                </div>
              )}

              {/* Card Body */}
              <div className="card-body text-center">
                <h5 className="card-title text-primary fw-bold mb-2">
                  👤 {b.name}
                </h5>
                <p className="text-muted small mb-1">✉️ {b.email}</p>
                <p className="text-muted small mb-1">📞 {b.phone || "N/A"}</p>
                <p className="text-muted small mb-1">📞 {b.altPhone || "N/A"}</p>

                <p className="mb-1 small">
                  🪪 <strong>Aadhaar:</strong> {b.aadharNumber}
                </p>

                <div className="mt-2">
                  <span className="badge bg-info text-dark me-1">
                    🏢 Floor {b.floor}
                  </span>
                  <span className="badge bg-warning text-dark me-1">
                    🚪 Room {getRoomNumber(b.floor, b.room)}
                  </span>
                  <span className="badge bg-success text-white">
                    🛏 Bed {b.bed}
                  </span>
                </div>

                <div className="mt-2">
                  <span className="badge bg-primary text-white">
                    💰 Paid: ₹{b.amountPaid || 0}
                  </span>
                </div>

                <p className="text-muted mt-2 small">
                  📅 Joined on {new Date(b.joinDate).toLocaleDateString()}
                </p>

                {b.aadharFile && (
                  <a
                    href={`http://localhost:5000/${b.aadharFile}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-sm btn-outline-secondary mt-2"
                  >
                    📄 View Aadhaar
                  </a>
                )}
              </div>

              <div className="card-footer bg-light text-center border-0 rounded-bottom-4">
                <small className="text-muted">
                  ⏰ Booked on {new Date(b.createdAt).toLocaleString()}
                </small>
              </div>
            </div>
          </div>
        ))}

        {filteredBookings.length === 0 && (
          <div className="text-center text-muted mt-5">
            <h5>😕 No bookings found</h5>
            <p>Try adjusting your search above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
