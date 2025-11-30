// frontend/src/pages/Payments.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import "./payments.css";

export default function Payments() {
  const [usersPayments, setUsersPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [err, setErr] = useState("");

  // Load all grouped payments
  useEffect(() => {
    async function load() {
      try {
        const token = localStorage.getItem("adminToken");

        const res = await api.get("/payments/all", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // backend returns grouped -> array of { userId, userName, phone, payments: [], totalAmount }
        const data = res.data.grouped || [];

        setUsersPayments(data);
        setFiltered(data);
      } catch (e) {
        console.error("Payments Load Error:", e);
        setErr("Failed to load payments");
      }
    }
    load();
  }, []);

  // DELETE payment function
  const deletePayment = async (paymentId) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      const token = localStorage.getItem("adminToken");

      const res = await api.delete(`/payments/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Delete failed");
      }

      // Remove payment from local state
      const refreshed = usersPayments.map((u) => {
        const newPayments = (u.payments || []).filter((p) => p._id !== paymentId);
        const newTotal = newPayments.reduce((sum, p) => sum + (p.amount || 0), 0);

        return {
          ...u,
          payments: newPayments,
          totalAmount: newTotal,
        };
      }).filter(u => (u.payments || []).length > 0); // optionally remove users with no payments

      setUsersPayments(refreshed);

      // Re-apply search filter so UI stays consistent
      if (!search.trim()) {
        setFiltered(refreshed);
      } else {
        handleSearch(search, refreshed);
      }

      alert("Payment deleted");
    } catch (err) {
      console.error("Payment Delete Error:", err);
      alert(err.response?.data?.message || err.message || "Failed to delete");
    }
  };

  // Search filter, accepts optional source list
  const handleSearch = (value, source = null) => {
    setSearch(value);

    const listToFilter = source || usersPayments;

    if (!value.trim()) return setFiltered(listToFilter);

    const s = value.toLowerCase();

    const result = listToFilter.filter(
      (u) =>
        (u.userName || "").toLowerCase().includes(s) ||
        (u.phone || "").toLowerCase().includes(s)
    );

    setFiltered(result);
  };

  return (
    <div className="payments-wrapper">
      {/* HEADER */}
      <div className="payments-header">
        <h2 className="fw-bold">💳 Payments</h2>
        <p className="text-light opacity-75">All users & payments</p>
      </div>

      {/* SEARCH */}
      <input
        type="text"
        className="search-box"
        placeholder="Search name or phone..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
      />

      {err && <div className="alert alert-danger">{err}</div>}

      {/* PAYMENT CARDS */}
      <div className="row g-4">
        {filtered.map((user) => (
          <div className="col-md-6 col-lg-4" key={user.userId}>
            <div className="user-box">
              {/* USER HEADER */}
              <div className="user-title">
                {user.userName}
                <span className="user-tag">User</span>
              </div>

              <div className="user-phone">📞 {user.phone}</div>

              <hr className="divider" />

              {/* PAYMENTS LIST */}
              <div className="payments-scroll-area">
                {(user.payments || []).map((p) => {
                  const b = p.bookingId;

                  // Room & Bed formatting
                  let roomBed = "N/A";
                  if (b && b.floor && b.room && b.bed) {
                    roomBed = `${b.floor}${String(b.room).padStart(2, "0")} • Bed ${b.bed}`;
                  }

                  return (
                    <div key={p._id} className="payment-inner-box">
                      <div className="pay-amount">
                        ₹{p.amount}
                        <span className="pay-status">PAID</span>
                      </div>

                      <div className="pay-row">
                        <strong>Room/Bed:</strong> {roomBed}
                      </div>

                      <div className="pay-row">
                        <strong>Code:</strong> {p.code}
                      </div>

                      <div className="pay-row">
                        <strong>Name:</strong> {p.name}
                      </div>

                      <div className="pay-row">
                        <strong>Phone:</strong> {p.phone}
                      </div>

                      <div className="pay-row">
                        <strong>User ID:</strong> {p.userId}
                      </div>

                      <div className="pay-date">
                        {new Date(p.createdAt).toLocaleString()}
                      </div>

                      <button
                        className="delete-btn"
                        onClick={() => deletePayment(p._id)}
                      >
                        🗑 Delete Payment
                      </button>
                    </div>
                  );
                })}
              </div>

              <hr className="divider" />

              {/* TOTAL */}
              <div className="total-paid-box">
                <span>Total Paid:</span>
                <strong>₹{user.totalAmount}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !err && (
        <h5 className="text-light text-center mt-4">
          No payment records found.
        </h5>
      )}
    </div>
  );
}
