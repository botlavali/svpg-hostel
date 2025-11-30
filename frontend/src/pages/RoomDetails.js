// frontend/src/pages/RoomDetails.js
import React, { useEffect, useState, useCallback, useMemo } from "react";

import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/RoomDetails.css";

export default function RoomDetails() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [bookings, setBookings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [payModal, setPayModal] = useState({
    open: false,
    booking: null,
    amount: 0,
    code: "",
  });

  const [updateModal, setUpdateModal] = useState({
    open: false,
    booking: null,
  });

  const [receiptModal, setReceiptModal] = useState({
    open: false,
    booking: null,
  });

  const ADVANCE = 20000;

  // Room layout
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
  const loadBookings = useCallback(async () => {
    try {
      if (!user?._id) return;
      const res = await api.get(`/bookings/user/${user._id}`);
      const payload = Array.isArray(res.data)
        ? res.data
        : res.data?.bookings || res.data?.data || [];
      setBookings(payload);
    } catch (err) {
      console.error("Load bookings failed:", err);
      setBookings([]);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadBookings();
  }, [user, navigate, loadBookings]);

  // Rent helper
  const getMonthlyRent = (b) =>
    roomStructure[b.floor][b.room - 1] === 2 ? 11000 : 9000;

  // Payment Modal Open
  const openPayModal = (booking) => {
    const correctSharing = roomStructure[booking.floor][booking.room - 1];
    setPayModal({
      open: true,
      booking: { ...booking, sharing: correctSharing },
      amount: getMonthlyRent({ ...booking, sharing: correctSharing }),
      code: "",
    });
  };

  // Confirm payment
  const doPayment = async () => {
    try {
      if (payModal.code.trim().toUpperCase() !== "MOHANSVPG")
        return alert("Invalid confirmation code");

      const b = payModal.booking;

      const res = await api.post("/payments/manual", {
        userId: user._id,
        bookingId: b._id,
        amount: payModal.amount,
        code: payModal.code.trim(),
        name: b.name,
        phone: b.phone,
        email: b.email,
        roomNumber: `${b.floor}${String(b.room).padStart(2, "0")}`,
        bedNumber: b.bed,
      });

      if (!res.data?.success)
        return alert(res.data?.message || "Payment failed");

      alert("Payment Saved");
      setPayModal({ open: false, booking: null, amount: 0, code: "" });
      loadBookings();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed");
    }
  };

  // Update booking details
  const saveUpdate = async () => {
    try {
      const b = updateModal.booking;
      await api.put(`/bookings/${b._id}`, {
        name: b.name,
        phone: b.phone,
        email: b.email,
      });
      alert("Updated successfully");
      setUpdateModal({ open: false, booking: null });
      loadBookings();
    } catch (err) {
      alert("Update failed");
    }
  };

  // Download text receipt
  const downloadReceipt = (b) => {
    const text = `
--- SV PG Receipt ---
Name: ${b.name}
Phone: ${b.phone}
Email: ${b.email || "N/A"}
Room: ${b.floor}${String(b.room).padStart(2, "0")}
Bed: ${b.bed}
Amount Paid: ₹${b.amountPaid || 0}
----------------------
    `.trim();

    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `SVPG_Receipt_${b.name.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // Photo URL fix
  function photoUrl(p) {
    if (!p) return "";

    // Fix backslashes → /
    let clean = p.replace(/\\/g, "/");

    // Remove starting ./ or /
    clean = clean.replace(/^\.?\/*/, "");

    // Ensure path starts with uploads/
    if (!clean.startsWith("uploads")) {
      clean = "uploads/" + clean;
    }

    return `https://37ptgzfs-5000.inc1.devtunnels.ms/${clean}`;
  }


  // Search filter
  const filtered = bookings.filter((b) => {
    const s = searchTerm.toLowerCase();
    return (
      (b.name || "").toLowerCase().includes(s) ||
      (b.phone || "").includes(s) ||
      `${b.floor}${String(b.room).padStart(2, "0")}`.includes(s)
    );
  });

  return (
    <div className="room-page-wrapper">
      <div className="container py-4 room-container">
        <div className="d-flex justify-content-between mb-3">
          <h3>🏠 My Booking Details</h3>
          <input
            placeholder="Search name, phone, room..."
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
                    {b.photo ? (
                      <img
                        src={photoUrl(b.photo)}
                        alt=""
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginRight: 12,
                          border: "2px solid #ddd",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: "50%",
                          background: "#ccc",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          marginRight: 12,
                        }}
                      >
                        {b.name?.[0]?.toUpperCase()}
                      </div>
                    )}

                    <div>
                      <h5 className="mb-1">{b.name}</h5>
                      <div className="text-muted small">
                        Room: {b.floor}
                        {String(b.room).padStart(2, "0")} • Bed {b.bed}
                      </div>
                      <div className="small mt-1">
                        <strong>📞</strong> {b.phone} •{" "}
                        <strong>📧</strong> {b.email || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="text-end">
                    <div className="text-success fw-bold">
                      ₹{b.amountPaid || 0}
                    </div>
                    <div className="text-muted small">
                      {new Date(b.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <hr />

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-warning"
                    onClick={() =>
                      setUpdateModal({ open: true, booking: b })
                    }
                  >
                    ✏ Update
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={() =>
                      setReceiptModal({ open: true, booking: b })
                    }
                  >
                    🧾 Receipt
                  </button>

                  <button
                    className="btn btn-primary"
                    onClick={() => openPayModal(b)}
                  >
                    💳 Pay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* UPDATE MODAL */}
        {updateModal.open && (
          <div
            className="modal fade show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-sm">
              <div className="modal-content p-3">
                <h5>Edit Details</h5>

                <label>Name</label>
                <input
                  className="form-control mb-2"
                  value={updateModal.booking.name}
                  onChange={(e) =>
                    setUpdateModal((p) => ({
                      ...p,
                      booking: { ...p.booking, name: e.target.value },
                    }))
                  }
                />

                <label>Phone</label>
                <input
                  className="form-control mb-2"
                  value={updateModal.booking.phone}
                  onChange={(e) =>
                    setUpdateModal((p) => ({
                      ...p,
                      booking: { ...p.booking, phone: e.target.value },
                    }))
                  }
                />

                <label>Email</label>
                <input
                  className="form-control mb-2"
                  value={updateModal.booking.email || ""}
                  onChange={(e) =>
                    setUpdateModal((p) => ({
                      ...p,
                      booking: { ...p.booking, email: e.target.value },
                    }))
                  }
                />

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setUpdateModal({ open: false, booking: null })
                    }
                  >
                    Cancel
                  </button>

                  <button className="btn btn-primary" onClick={saveUpdate}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECEIPT MODAL */}
        {receiptModal.open && (
          <div
            className="modal fade show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-md">
              <div className="modal-content p-3">
                <h5>Booking Receipt</h5>

                <div className="p-2">
                  <p>
                    <strong>Name:</strong> {receiptModal.booking.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {receiptModal.booking.phone}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {receiptModal.booking.email || "N/A"}
                  </p>
                  <p>
                    <strong>Room:</strong> {receiptModal.booking.floor}
                    {String(receiptModal.booking.room).padStart(2, "0")}
                  </p>
                  <p>
                    <strong>Bed:</strong> {receiptModal.booking.bed}
                  </p>
                  <p>
                    <strong>Sharing:</strong> {receiptModal.booking.sharing}
                  </p>
                  <p>
                    <strong>Advance:</strong> ₹{ADVANCE}
                  </p>
                  <p>
                    <strong>Monthly Rent:</strong> ₹
                    {getMonthlyRent(receiptModal.booking)}
                  </p>
                  <p>
                    <strong>Total Paid:</strong> ₹
                    {receiptModal.booking.amountPaid || 0}
                  </p>
                </div>

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setReceiptModal({ open: false, booking: null })
                    }
                  >
                    Close
                  </button>

                  <button
                    className="btn btn-success"
                    onClick={() => downloadReceipt(receiptModal.booking)}
                  >
                    Download Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PAY MODAL */}
        {payModal.open && (
          <div
            className="modal fade show d-block"
            style={{ background: "rgba(0,0,0,.5)" }}
          >
            <div className="modal-dialog modal-sm">
              <div className="modal-content p-3">
                <h5>Pay Next Month — {payModal.booking?.name}</h5>

                <p className="fw-bold text-primary">
                  {getMonthlyRent(payModal.booking) === 11000
                    ? "2 Sharing — ₹11,000"
                    : "3 Sharing — ₹9,000"}
                </p>

                <input
                  className="form-control mb-2"
                  placeholder="Enter confirmation code"
                  value={payModal.code}
                  onChange={(e) =>
                    setPayModal((p) => ({ ...p, code: e.target.value }))
                  }
                />

                <div className="d-flex justify-content-between">
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      setPayModal({
                        open: false,
                        booking: null,
                        amount: 0,
                        code: "",
                      })
                    }
                  >
                    Cancel
                  </button>

                  <button className="btn btn-primary" onClick={doPayment}>
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
