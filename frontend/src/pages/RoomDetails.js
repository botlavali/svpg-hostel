// frontend/src/pages/RoomDetails.js
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/RoomDetails.css";

export default function RoomDetails() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [shiftModal, setShiftModal] = useState({ open: false, booking: null, available: {} });
  const [payModal, setPayModal] = useState({ open: false, booking: null, amount: 0, code: "" });

  const [updateModal, setUpdateModal] = useState({ open: false, booking: null });
  const [receiptModal, setReceiptModal] = useState({ open: false, booking: null });

  // room structure (keeps parity with backend)
  const roomStructure = useMemo(
    () => ({
      1: [2, 2, 3, 3, 2, 2],
      2: [2, 2, 3, 3, 2, 2],
      3: [2, 2, 3, 3, 2, 2],
      4: [2, 2, 3, 3, 2, 2],
      5: [2, 2, 3, 3, 2, 2],
      6: [2, 2, 3, 3],
    }),
    []
  );

  // Load bookings
// Load bookings
const loadBookings = useCallback(async () => {
  try {
    const res = await api.get("/bookings"); // CORRECT (api adds /api)
    setBookings(res.data || []);
  } catch (err) {
    console.error("Load bookings failed:", err);
  }
}, []);


  useEffect(() => {
    if (!user) return navigate("/login");
    loadBookings();
  }, [navigate, user, loadBookings]);

  // Monthly rent based on sharing
  function getMonthlyRent(b) {
    if (!b) return 0;
    if (b.sharing === 2) return 11000;
    if (b.sharing === 3) return 9000;
    return 9000;
  }

  // -----------------------------
  // SHIFT BED
  // -----------------------------
  const fetchAvailableBeds = async (floor, room) => {
    try {
      const res = await api.get("/bookings/available", { params: { floor, room } });
      // res.data.available should be array of available bed numbers
      return res.data.available || [];
    } catch (err) {
      console.error("Fetch available beds failed:", err);
      return [];
    }
  };

  const openShiftModal = async (booking) => {
    const available = {};
    try {
      for (const [floor, rooms] of Object.entries(roomStructure)) {
        available[floor] = {};
        for (let i = 0; i < rooms.length; i++) {
          const roomNo = i + 1;
          available[floor][roomNo] = await fetchAvailableBeds(floor, roomNo);
        }
      }
      setShiftModal({ open: true, booking, available });
    } catch (err) {
      console.error("Open shift modal error:", err);
    }
  };

  async function confirmShift(target) {
    try {
      const res = await api.post("/bookings/shift", {
        bookingId: shiftModal.booking._id,
        toFloor: target.floor,
        toRoom: target.room,
        toBed: target.bed,
      });

      if (res.data && res.data.success) {
        alert("Shift successful");
        setShiftModal({ open: false, booking: null, available: {} });
        await loadBookings();
      } else {
        alert(res.data?.message || "Shift failed");
      }
    } catch (err) {
      console.error("Shift error:", err);
      alert(err?.response?.data?.message || "Shift failed");
    }
  }

  // -----------------------------
  // PAY NEXT MONTH (always available)
  // -----------------------------
  const openPayModal = (booking) => {
    setPayModal({
      open: true,
      booking,
      amount: getMonthlyRent(booking),
      code: "",
    });
  };

  const confirmPayNow = async () => {
    try {
      if (!payModal.code || payModal.code.trim().toUpperCase() !== "MOHANSVPG") {
        return alert("Invalid confirmation code");
      }

      const b = payModal.booking;

      const res = await api.post("/payments/manual", {
        userId: user._id,
        bookingId: b._id,
        amount: payModal.amount,
        code: payModal.code.trim(),
        // required fields for backend
        name: b.name,
        phone: b.phone,
        roomNumber: `${b.floor}${String(b.room).padStart(2, "0")}`,
        bedNumber: b.bed,
      });

      if (res.data && res.data.success) {
        alert("Payment saved");
        setPayModal({ open: false, booking: null, amount: 0, code: "" });
        await loadBookings();
      } else {
        alert(res.data?.message || "Payment failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert(err?.response?.data?.message || "Payment failed");
    }
  };

  // -----------------------------
  // UPDATE BOOKING
  // -----------------------------
  const openUpdateModal = (booking) => {
    setUpdateModal({ open: true, booking: { ...booking } });
  };

  const saveUpdatedBooking = async () => {
    const b = updateModal.booking;
    try {
      const res = await api.put(`/bookings/${b._id}`, {
        name: b.name,
        phone: b.phone,
        email: b.email,
      });

      if (res.data && res.data.success) {
        alert("Updated successfully");
        setUpdateModal({ open: false, booking: null });
        await loadBookings();
      } else {
        alert(res.data?.message || "Update failed");
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  // -----------------------------
  // RECEIPT
  // -----------------------------
  const openReceiptModal = (booking) => {
    setReceiptModal({ open: true, booking });
  };

  const downloadReceipt = (booking) => {
    // build a small text receipt (client-side) OR call backend PDF endpoint.
    // If you prefer backend PDF, call /payments/:id/receipt (we already added that).
    // For now download a simple text receipt:
    const text = `
SV PG Receipt

Name: ${booking.name}
Phone: ${booking.phone}
Email: ${booking.email}
Room: ${booking.floor}${String(booking.room).padStart(2, "0")}
Bed: ${booking.bed}
Sharing: ${booking.sharing}
Rent: ₹${getMonthlyRent(booking)}
Join: ${booking.joinDate?.slice(0, 10)}
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SVPG_Receipt_${booking.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // FILTER
  const filtered = bookings.filter((b) => {
    const s = searchTerm.toLowerCase();
    const room = `${b.floor}${String(b.room).padStart(2, "0")}`;
    return (
      (b.name || "").toLowerCase().includes(s) ||
      (b.phone || "").includes(s) ||
      room.includes(s) ||
      String(b.bed).includes(s) ||
      (b.email || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>🏠 My Booking Details</h3>
        <input
          placeholder="Search name, phone, room, bed..."
          className="form-control"
          style={{ maxWidth: 360 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row g-4">
        {filtered.map((b) => (
          <div key={b._id} className="col-md-6">
            <div className="card p-3 shadow-sm">
              <div className="d-flex justify-content-between">
                <div className="d-flex">
                  {b.photo && (
                    <img
                      src={`https://mohansvpg-frontend.onrender.com/${b.photo}`}
                      alt={b.name}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: "50%",
                        objectFit: "cover",
                        marginRight: 12,
                        border: "2px solid #ddd",
                      }}
                    />
                  )}
                  <div>
                    <h5 className="mb-1">{b.name}</h5>
                    <div className="text-muted small">
                      Room: {b.floor}
                      {String(b.room).padStart(2, "0")} • Bed {b.bed}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-success fw-bold">₹{b.amountPaid || 0}</div>
                  <div className="text-muted small">{new Date(b.createdAt).toLocaleString()}</div>
                </div>
              </div>

              <hr />

              <p className="mb-1"><strong>📞</strong> {b.phone}</p>
              <p className="mb-1"><strong>📧</strong> {b.email}</p>
              <p className="mb-1"><strong>Join:</strong> {b.joinDate?.substring(0, 10)}</p>

              <div className="d-flex gap-2 mt-3">
                <button className="btn btn-warning" onClick={() => openUpdateModal(b)}>
                  ✏ Update
                </button>

                <button className="btn btn-success" onClick={() => openReceiptModal(b)}>
                  🧾 Receipt
                </button>

                <button className="btn btn-outline-primary" onClick={() => openShiftModal(b)}>
                  🔁 Shift
                </button>

                {/* PAY BUTTON: now ALWAYS visible (no 5-day restriction) */}
                <button className="btn btn-primary" onClick={() => openPayModal(b)}>
                  💳 Pay Next Month
                </button>

                <button
                  className="btn btn-danger ms-auto"
                  onClick={async () => {
                    if (!window.confirm("Checkout (delete) booking?")) return;
                    await api.delete(`/bookings/${b._id}`);
                    await loadBookings();
                  }}
                >
                  🚪 Checkout
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPDATE MODAL */}
      {updateModal.open && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content p-3">
              <h5>Edit Details</h5>

              <label>Name</label>
              <input
                className="form-control mb-2"
                value={updateModal.booking.name}
                onChange={(e) =>
                  setUpdateModal((prev) => ({ ...prev, booking: { ...prev.booking, name: e.target.value } }))
                }
              />

              <label>Phone</label>
              <input
                className="form-control mb-2"
                value={updateModal.booking.phone}
                onChange={(e) =>
                  setUpdateModal((prev) => ({ ...prev, booking: { ...prev.booking, phone: e.target.value } }))
                }
              />

              <label>Email</label>
              <input
                className="form-control"
                value={updateModal.booking.email}
                onChange={(e) =>
                  setUpdateModal((prev) => ({ ...prev, booking: { ...prev.booking, email: e.target.value } }))
                }
              />

              <div className="d-flex justify-content-between mt-3">
                <button className="btn btn-secondary" onClick={() => setUpdateModal({ open: false, booking: null })}>
                  Cancel
                </button>

                <button className="btn btn-primary" onClick={saveUpdatedBooking}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {receiptModal.open && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content p-3">
              <h5>Receipt</h5>
              <p><b>Name:</b> {receiptModal.booking.name}</p>
              <p><b>Phone:</b> {receiptModal.booking.phone}</p>
              <p><b>Email:</b> {receiptModal.booking.email}</p>
              <p><b>Room:</b> {receiptModal.booking.floor}{String(receiptModal.booking.room).padStart(2, "0")}</p>
              <p><b>Bed:</b> {receiptModal.booking.bed}</p>
              <p><b>Sharing:</b> {receiptModal.booking.sharing}</p>
              <p><b>Rent:</b> ₹{getMonthlyRent(receiptModal.booking)}</p>

              <div className="d-flex gap-2 mt-2">
                <button className="btn btn-outline-secondary" onClick={() => setReceiptModal({ open: false, booking: null })}>
                  Close
                </button>

                <button className="btn btn-success" onClick={() => downloadReceipt(receiptModal.booking)}>
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAY MODAL */}
      {payModal.open && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content p-3">
              <h5>Pay Next Month — {payModal.booking?.name}</h5>
              <p>Amount: ₹{payModal.amount}</p>

              <label>Enter Confirmation Code</label>
              <input
                className="form-control mb-2"
                value={payModal.code}
                onChange={(e) => setPayModal((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="MOHANSVPG"
              />

              <div className="d-flex justify-content-between">
                <button className="btn btn-secondary" onClick={() => setPayModal({ open: false, booking: null, amount: 0, code: "" })}>
                  Cancel
                </button>

                <button className="btn btn-primary" onClick={confirmPayNow}>
                  Pay & Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHIFT MODAL */}
      {shiftModal.open && (
        <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,.5)" }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5>Shift bed for {shiftModal.booking?.name}</h5>
                <button className="btn-close" onClick={() => setShiftModal({ open: false, booking: null, available: {} })}></button>
              </div>

              <div className="modal-body">
                {Object.entries(shiftModal.available).map(([floor, rooms]) => (
                  <div key={floor} className="mb-3">
                    <h6>Floor {floor}</h6>

                    <div className="d-flex flex-wrap gap-2">
                      {Object.entries(rooms).map(([roomNo, beds]) => (
                        <div key={roomNo} className="border rounded p-2" style={{ minWidth: 180 }}>
                          <div className="fw-bold">Room {floor}{String(roomNo).padStart(2, "0")}</div>
                          <div className="text-muted small">Beds: {beds.length ? beds.join(", ") : "None"}</div>

                          <div className="mt-2 d-flex flex-wrap gap-1">
                            {beds.map((bn) => (
                              <button
                                key={bn}
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  if (!window.confirm(`Move to Room ${floor}${String(roomNo).padStart(2, "0")} Bed ${bn}?`)) return;
                                  confirmShift({ floor, room: roomNo, bed: bn });
                                }}
                              >
                                Bed {bn}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="modal-footer">
                <button className="btn btn-outline-secondary" onClick={() => setShiftModal({ open: false, booking: null, available: {} })}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
