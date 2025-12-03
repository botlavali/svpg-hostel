// src/pages/AdminRoomDetails.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import AdminLayout from "../layouts/AdminLayout";
import "./AdminRooms.css";

export default function AdminRoomDetails() {
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [shiftData, setShiftData] = useState(null);
  const [payModal, setPayModal] = useState({
    open: false,
    booking: null,
    amount: 0,
    code: "",
  });
  const [loading, setLoading] = useState(false);

  const ROOM_STRUCTURE = {
    1: [2, 2, 3, 3, 2, 2],
    2: [2, 2, 3, 3, 2, 2],
    3: [2, 2, 3, 3, 2, 2],
    4: [2, 2, 3, 3, 2, 2],
    5: [2, 2, 3, 3, 2, 2],
    6: [2, 2, 3, 3],
  };

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await api.get("/bookings");

      const payload = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.bookings || [];

      setBookings(payload);
    } catch (err) {
      console.error("Load error:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = bookings.filter((b) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      (b.name || "").toLowerCase().includes(q) ||
      (b.phone || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q) ||
      `${b.floor}${String(b.room).padStart(2, "0")}`.includes(q)
    );
  });

  async function checkout(id) {
    if (!window.confirm("Confirm checkout?")) return;
    try {
      await api.delete(`/bookings/${id}`);
      await loadBookings();
      alert("Checkout successful");
    } catch {
      alert("Checkout failed");
    }
  }

  async function openShift(booking) {
    try {
      const res = await api.get("/bookings");

      const all = Array.isArray(res.data)
        ? res.data
        : res.data?.data || res.data?.bookings || [];

      const allBeds = [];

      Object.entries(ROOM_STRUCTURE).forEach(([floor, rooms]) => {
        rooms.forEach((bedsCount, idx) => {
          const roomNo = idx + 1;

          for (let bed = 1; bed <= bedsCount; bed++) {
            const taken = all.find(
              (x) =>
                +x.floor === +floor &&
                +x.room === roomNo &&
                +x.bed === bed
            );

            allBeds.push({
              floor: Number(floor),
              room: roomNo,
              bed,
              status: taken ? "booked" : "free",
            });
          }
        });
      });

      const grouped = {};

      allBeds.forEach((b) => {
        grouped[b.floor] = grouped[b.floor] || {};
        grouped[b.floor][b.room] = grouped[b.floor][b.room] || [];
        grouped[b.floor][b.room].push(b);
      });

      setShiftData({ booking, grouped, selected: null });
    } catch (err) {
      alert("Could not load shift data");
    }
  }

  function selectShiftBed(floor, room, bed) {
    setShiftData((s) => ({ ...s, selected: { floor, room, bed } }));
  }

  async function confirmShift() {
    if (!shiftData.selected) return alert("Select a bed first");

    const sel = shiftData.selected;

    try {
      await api.put(`/bookings/${shiftData.booking._id}`, {
        floor: sel.floor,
        room: sel.room,
        bed: sel.bed,
      });

      await loadBookings();
      setShiftData(null);

      alert("Shift successful");
    } catch (err) {
      alert("Shift failed");
    }
  }

  function openNextMonthPay(booking) {
    const rent =
      ROOM_STRUCTURE[booking.floor][booking.room - 1] === 2 ? 11000 : 9000;

    setPayModal({
      open: true,
      booking,
      amount: rent,
      code: "",
    });
  }

  async function confirmNextMonthPay() {
    if (payModal.code.trim().toUpperCase() !== "MOHANSVPG")
      return alert("Invalid admin code");

    try {
      const b = payModal.booking;

      await api.post("/payments/manual", {
        userId: b.userId,
        bookingId: b._id,
        amount: payModal.amount,
        code: payModal.code.trim(),
        name: b.name,
        phone: b.phone,
        roomNumber: `${b.floor}${String(b.room).padStart(2, "0")}`,
        bedNumber: b.bed,
      });

      alert("Payment recorded");

      setPayModal({
        open: false,
        booking: null,
        amount: 0,
        code: "",
      });

      await loadBookings();
    } catch {
      alert("Payment failed");
    }
  }

function photoUrl(p) {
  if (!p) return "";

  let clean = p.replace(/\\/g, "/");
  clean = clean.replace(/^\.?\/*/, "");

  if (!clean.startsWith("uploads")) clean = "uploads/" + clean;

  return `https://svpg-hostel.onrender.com/${clean}`;
}



  return (
    <AdminLayout>
      <div className="room-page-wrapper">
        <div className="container py-4">

          <div className="d-flex justify-content-between mb-4">
            <h3 className="room-title">📘 Admin — Room Details</h3>

            <input
              className="form-control room-search"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && (
            <div className="text-muted mb-2">Loading...</div>
          )}

          <div className="row g-4">
            {filtered.map((b) => (
              <div
                className="col-12 col-md-6 col-lg-4"
                key={b._id}
              >
                <div className="card p-3 shadow-sm">

                  <div className="text-center mb-3">
                    {b.photo ? (
                      <img
                        src={photoUrl(b.photo)}
                        width="90"
                        height="90"
                        className="rounded-circle"
                        alt=""
                      />
                    ) : (
                      <div
                        className="rounded-circle bg-info d-flex justify-content-center align-items-center"
                        style={{ width: 90, height: 90, fontSize: 32 }}
                      >
                        {b.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>

                  <h4 className="text-center fw-bold">{b.name}</h4>
                  <p className="text-center opacity-75">{b.email}</p>

                  <hr />

                  <p>
                    <strong>Room:</strong> {b.floor}
                    {String(b.room).padStart(2, "0")}
                  </p>
                  <p>
                    <strong>Bed:</strong> {b.bed}
                  </p>
                  <p>
                    <strong>Phone:</strong> {b.phone}
                  </p>
                  <p>
                    <strong>Aadhaar:</strong> {b.aadharNumber || "N/A"}
                  </p>

                  <div className="d-flex gap-2 mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => openShift(b)}
                    >
                      🔁 Shift
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => openNextMonthPay(b)}
                    >
                      💳 Next Month
                    </button>

                    <button
                      className="btn btn-danger btn-sm ms-auto"
                      onClick={() => checkout(b._id)}
                    >
                      🚪 Checkout
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <h5 className="text-muted text-center mt-4">
              No results found
            </h5>
          )}
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {payModal.open && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content p-3">

              <h5>Next Month — {payModal.booking?.name}</h5>

              <p className="fw-bold text-primary">
                Amount: ₹{payModal.amount}
              </p>

              <label>Admin Code</label>
              <input
                className="form-control mb-2"
                placeholder="Enter MOHANSVPG"
                value={payModal.code}
                onChange={(e) =>
                  setPayModal((p) => ({
                    ...p,
                    code: e.target.value,
                  }))
                }
              />

              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setPayModal({ open: false })
                  }
                >
                  Cancel
                </button>

                <button
                  className="btn btn-primary"
                  onClick={confirmNextMonthPay}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHIFT MODAL */}
      {shiftData && (
        <div
          className="modal fade show d-block"
          style={{ background: "rgba(0,0,0,0.65)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content p-3">

              <div className="modal-header">
                <h5>Shift — {shiftData.booking?.name}</h5>

                <button
                  className="btn-close"
                  onClick={() => setShiftData(null)}
                />
              </div>

              <div className="modal-body">
                {Object.entries(shiftData.grouped).map(
                  ([floor, rooms]) => (
                    <div key={floor} className="mb-3">
                      <h6>Floor {floor}</h6>

                      <div className="d-flex flex-wrap gap-3">
                        {Object.entries(rooms).map(
                          ([roomNo, beds]) => (
                            <div
                              key={roomNo}
                              className="border rounded p-2"
                              style={{ width: 220 }}
                            >
                              <b>
                                Room {floor}
                                {String(roomNo).padStart(2, "0")}
                              </b>

                              <div className="mt-2 d-flex flex-wrap gap-1">
                                {beds.map((bedObj) => {
                                  const isSelected =
                                    shiftData.selected &&
                                    shiftData.selected.floor ===
                                      bedObj.floor &&
                                    shiftData.selected.room ===
                                      bedObj.room &&
                                    shiftData.selected.bed ===
                                      bedObj.bed;

                                  return (
                                    <button
                                      key={`${bedObj.floor}-${bedObj.room}-${bedObj.bed}`}
                                      disabled={
                                        bedObj.status !== "free"
                                      }
                                      className={
                                        isSelected
                                          ? "btn btn-sm btn-primary"
                                          : bedObj.status === "free"
                                          ? "btn btn-sm btn-outline-primary"
                                          : "btn btn-sm btn-danger"
                                      }
                                      onClick={() =>
                                        bedObj.status === "free" &&
                                        selectShiftBed(
                                          bedObj.floor,
                                          bedObj.room,
                                          bedObj.bed
                                        )
                                      }
                                      style={{ minWidth: 60 }}
                                    >
                                      Bed {bedObj.bed}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShiftData(null)}
                >
                  Close
                </button>

                <button
                  className="btn btn-success"
                  disabled={!shiftData.selected}
                  onClick={confirmShift}
                >
                  Confirm Shift
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
