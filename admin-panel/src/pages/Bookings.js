import React, { useEffect, useState } from "react";
import api from "../api";

export default function Bookings() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  // 🛏 ROOM STRUCTURE (your hostel)
  const roomStructure = {
    1: [2, 2, 3, 3, 2, 2],
    2: [2, 2, 3, 3, 2, 2],
    3: [2, 2, 3, 3, 2, 2],
    4: [2, 2, 3, 3, 2, 2],
    5: [2, 2, 3, 3, 2, 2],
    6: [2, 2, 3, 3],
  };

  const TOTAL_BEDS = Object.values(roomStructure).flat().reduce((a, b) => a + b, 0);
  const TOTAL_2_SHARING = Object.values(roomStructure)
    .flat()
    .filter((x) => x === 2).length * 2;
  const TOTAL_3_SHARING = Object.values(roomStructure)
    .flat()
    .filter((x) => x === 3).length * 3;

  const load = async () => {
    try {
      const res = await api.get("/bookings");
      setList(res.data || []);
      setFilteredList(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || e.message || "Load failed");
    }
  };

  useEffect(() => {
    load();
  }, []);

  // 🔍 SEARCH FILTER
  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFilteredList(list);
      return;
    }

    const s = value.toLowerCase();

    const result = list.filter((b) => {
      const room = `${b.floor}${String(b.room).padStart(2, "0")}`;
      return (
        b.name?.toLowerCase().includes(s) ||
        b.phone?.includes(s) ||
        b.email?.toLowerCase().includes(s) ||
        room.includes(s) ||
        String(b.bed).includes(s) ||
        b.aadharNumber?.includes(s)
      );
    });

    setFilteredList(result);
  };

  // DELETE BOOKING
  const del = async (id) => {
    if (!window.confirm("Delete booking?")) return;
    try {
      await api.delete(`/api/bookings/${id}`);
      load();
    } catch (e) {
      alert("Delete failed");
    }
  };

  // 📊 STATISTICS
  const bookedBeds = list.length;
  const totalAvailable = TOTAL_BEDS - bookedBeds;

  const booked2 = list.filter((b) => roomStructure[b.floor][b.room - 1] === 2).length;
  const booked3 = list.filter((b) => roomStructure[b.floor][b.room - 1] === 3).length;

  const available2 = TOTAL_2_SHARING - booked2;
  const available3 = TOTAL_3_SHARING - booked3;

  return (
    <div className="mt-4 container">

      {/* ---------- STAT CARDS ---------- */}
      <h3 className="fw-bold mb-3">📚 Booking Statistics</h3>

      <div className="row g-4 mb-4">
        <GradientCard title="Total Beds" value={TOTAL_BEDS} gradient="#667eea, #764ba2" />
        <GradientCard title="Booked Beds" value={bookedBeds} gradient="#ff416c, #ff4b2b" />
        <GradientCard title="Available Beds" value={totalAvailable} gradient="#11998e, #38ef7d" />
        <GradientCard title="2-Sharing (Booked)" value={booked2} gradient="#f7971e, #ffd200" />
        <GradientCard title="2-Sharing (Available)" value={available2} gradient="#20c997, #2cccff" />
        <GradientCard title="3-Sharing (Booked)" value={booked3} gradient="#fc4a1a, #f7b733" />
        <GradientCard title="3-Sharing (Available)" value={available3} gradient="#6a11cb, #2575fc" />
      </div>

      {/* Search */}
      <h3 className="fw-bold mb-3 mt-4">📘 Bookings List</h3>
      <div className="mb-3">
        <input
          type="text"
          value={search}
          placeholder="Search name, phone, room, bed, email..."
          className="form-control form-control-lg shadow-sm"
          style={{ borderRadius: "12px" }}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {err && <div className="alert alert-danger">{err}</div>}

      {/* ---------- CARD LIST ---------- */}
      <div className="row g-4">
        {filteredList.map((b) => (
          <div className="col-md-6 col-lg-4" key={b._id}>
            <div
              className="shadow booking-card"
              style={{
                borderRadius: "18px",
                padding: "20px",
                background: "white",
                transition: "0.3s",
              }}
            >
              {/* PHOTO & NAME */}
              <div className="d-flex align-items-center mb-3">
                {b.photo ? (
                  <img
                    src={`http://localhost:5000/${b.photo}`}
                    alt="User"
                    width="65"
                    height="65"
                    className="rounded-circle border me-3"
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: 65, height: 65, fontSize: 24 }}
                  >
                    {b.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <h5 className="fw-bold mb-1">{b.name}</h5>
                  <small className="text-muted">{b.email}</small>
                </div>
              </div>

              {/* ROOM */}
              <div
                className="p-2 rounded mb-2"
                style={{ background: "#f0f4ff" }}
              >
                <strong>🛏 Room: </strong>
                <span className="text-primary fw-bold">
                  {b.floor}
                  {String(b.room).padStart(2, "0")} — Bed {b.bed}
                </span>
              </div>

              {/* Phone */}
              <p className="mb-1">
                <strong>📞 Phone:</strong> {b.phone}
              </p>

              {/* Aadhaar */}
              <p className="mb-1">
                <strong>🆔 Aadhaar:</strong>{" "}
                {b.aadharFile ? (
                  <a
                    href={`http://localhost:5000/${b.aadharFile}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fw-bold text-primary"
                  >
                    View File
                  </a>
                ) : (
                  "No File"
                )}
              </p>

              <p className="text-muted mb-1">
                <strong>📅 Join Date:</strong> {b.joinDate?.substring(0, 10)}
              </p>

              <hr />

              <div className="text-end">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => del(b._id)}
                >
                  🗑 Delete Booking
                </button>
              </div>
            </div>

            <style>
              {`
                .booking-card:hover {
                  transform: translateY(-6px) scale(1.02);
                  box-shadow: 0px 12px 25px rgba(0,0,0,0.15);
                }
              `}
            </style>
          </div>
        ))}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center text-muted mt-4">No bookings found.</div>
      )}
    </div>
  );
}

/* ---------- BEAUTIFUL GRADIENT STAT CARDS ---------- */
function GradientCard({ title, value, gradient }) {
  return (
    <div className="col-md-4 col-lg-2">
      <div
        className="shadow text-white p-3"
        style={{
          borderRadius: "18px",
          background: `linear-gradient(135deg, ${gradient})`,
          transition: "0.3s",
          minHeight: "120px",
        }}
      >
        <h6 className="mb-1">{title}</h6>
        <h2 className="fw-bold">{value}</h2>
      </div>

      <style>
        {`
          div.shadow:hover {
            transform: translateY(-6px) scale(1.03);
            box-shadow: 0px 14px 30px rgba(0,0,0,0.25);
          }
        `}
      </style>
    </div>
  );
}
