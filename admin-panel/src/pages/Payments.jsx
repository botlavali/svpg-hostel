import React, { useEffect, useState } from "react";
import api from "../api";

export default function Payments() {
  const [usersPayments, setUsersPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");

  // Load All Payments
  const load = async () => {
    try {
      const res = await api.get("/payments/all");
      setUsersPayments(res.data.grouped || []);
      setFiltered(res.data.grouped || []);
    } catch (e) {
      setErr(e.response?.data?.message || e.message);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Delete Payment
  const deletePayment = async (paymentId, userId) => {
    if (!window.confirm("Delete this payment?")) return;

    try {
      await api.delete(`/api/payments/${paymentId}`);

      const updated = usersPayments.map((u) => {
        if (u.userId !== userId) return u;

        const newPayments = u.payments.filter((p) => p._id !== paymentId);

        return {
          ...u,
          payments: newPayments,
          totalAmount: newPayments.reduce((acc, x) => acc + x.amount, 0),
        };
      });

      setUsersPayments(updated);
      setFiltered(updated);
    } catch (err) {
      alert("Delete failed");
      console.error(err);
    }
  };

  // Search filter
  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFiltered(usersPayments);
      return;
    }

    const s = value.toLowerCase();

    const result = usersPayments.filter((block) => {
      const nameMatch = block.userName?.toLowerCase().includes(s);
      const phoneMatch = block.phone?.includes(s);

      const paymentMatch = block.payments.some((p) => {
        const room = `${p.bookingId?.floor || ""}${String(
          p.bookingId?.room || ""
        ).padStart(2, "0")}`;

        return (
          room.includes(s) ||
          `${p.bookingId?.bed}`.includes(s) ||
          p.amount.toString().includes(s)
        );
      });

      return nameMatch || phoneMatch || paymentMatch;
    });

    setFiltered(result);
  };

  return (
    <div className="container py-3">

      {/* HEADER */}
      <div
        className="text-white py-4 px-3 mb-4 shadow-lg"
        style={{
          background: "linear-gradient(135deg, #4e54c8, #8f94fb)",
          borderRadius: "16px",
        }}
      >
        <h2 className="fw-bold mb-1">💳 Payments Dashboard</h2>
        <p className="mb-0 opacity-75">All user payment records & details</p>
      </div>

      {/* Search Bar */}
      <input
        type="text"
        className="form-control mb-4 shadow-sm"
        placeholder="Search name, phone, room or bed..."
        value={search}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ borderRadius: "12px", padding: "12px" }}
      />

      {err && <div className="alert alert-danger">{err}</div>}

      <div className="row g-4">
        {filtered.map((user) => (
          <div className="col-md-6 col-lg-4" key={user.userId}>
            <div
              className="shadow-lg p-3"
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.1)",
              }}
            >
              {/* Header */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="fw-bold text-primary">{user.userName}</h5>
                <span className="badge bg-dark">User</span>
              </div>

              <small className="text-muted d-block mb-2">📞 {user.phone}</small>

              <hr />

              {/* Payment Records */}
              <div style={{ maxHeight: "240px", overflowY: "auto" }}>
                {user.payments.length === 0 ? (
                  <div className="alert alert-warning p-2 text-center">
                    No payments available
                  </div>
                ) : (
                  user.payments.map((p) => (
                    <div
                      key={p._id}
                      className="p-3 mb-3 shadow-sm"
                      style={{
                        background: "linear-gradient(135deg, #fdfbfb, #ebedee)",
                        borderRadius: "14px",
                        borderLeft: "5px solid #4e54c8",
                      }}
                    >
                      <div className="d-flex justify-content-between mb-1">
                        <strong className="text-success">₹{p.amount}</strong>
                        <span className="badge bg-success">PAID</span>
                      </div>

                      <div className="mb-1">
                        <strong>Room/Bed:</strong>{" "}
                        {p.bookingId
                          ? `${p.bookingId.floor}${String(
                              p.bookingId.room
                            ).padStart(2, "0")} • Bed ${p.bookingId.bed}`
                          : "N/A"}
                      </div>

                      <div className="mb-1">
                        <strong>Code:</strong> {p.code}
                      </div>

                      <small className="text-muted">
                        {new Date(p.createdAt).toLocaleString()}
                      </small>

                      <button
                        className="btn btn-danger btn-sm w-100 mt-2"
                        style={{ borderRadius: "10px" }}
                        onClick={() => deletePayment(p._id, user.userId)}
                      >
                        🗑 Delete Payment
                      </button>
                    </div>
                  ))
                )}
              </div>

              <hr />

              {/* Total */}
              <div
                className="d-flex justify-content-between fw-bold p-2 rounded"
                style={{
                  background: "linear-gradient(135deg, #d9afd9, #97d9e1)",
                  borderRadius: "12px",
                }}
              >
                <span>Total Paid:</span>
                <span className="text-dark">₹{user.totalAmount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <h5 className="text-center text-muted mt-4">No payment records found.</h5>
      )}
    </div>
  );
}
