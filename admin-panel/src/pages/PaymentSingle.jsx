import React, { useEffect, useCallback, useState } from "react";
import { useParams } from "react-router-dom";


export default function PaymentSingle() {
  const { id } = useParams();
  const [payment, setPayment] = useState(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/payments/${id}`);
      setPayment(res.data.payment);
    } catch (e) {
      setErr("Error loading payment.");
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]); // 🔥 ESLint FIXED

  if (err) return <div className="alert alert-danger">{err}</div>;
  if (!payment) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h3 className="fw-bold mb-4 text-primary">💳 Payment Details</h3>

      <div className="card shadow p-4 border-0" style={{ borderRadius: "12px" }}>
        <h4 className="text-success mb-3">₹{payment.amount} — Paid</h4>

        <p><strong>👤 Name:</strong> {payment.userId?.name}</p>
        <p><strong>📞 Phone:</strong> {payment.userId?.phone}</p>

        <p>
          <strong>🛏 Room / Bed:</strong>{" "}
          {payment.bookingId
            ? `${payment.bookingId.floor}${String(
                payment.bookingId.room
              ).padStart(2, "0")} — Bed ${payment.bookingId.bed}`
            : "Not linked"}
        </p>

        <p><strong>🔑 Code:</strong> {payment.code}</p>

        <p className="text-muted">
          <strong>📅 Date:</strong>{" "}
          {new Date(payment.createdAt).toLocaleString()}
        </p>

        <hr />

        <button className="btn btn-outline-primary">📄 Download Receipt</button>
      </div>
    </div>
  );
}
