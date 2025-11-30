// frontend/src/pages/PaymentDetails.js
import React, { useCallback, useEffect, useState } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import "../styles/paymentDetails.css"; // CSS isolated

export default function PaymentDetails() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem("user");
  const [user] = useState(rawUser ? JSON.parse(rawUser) : null);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ---------------- Load User Payments ---------------- */
  const loadPayments = useCallback(async () => {
    if (!user || !user._id) return;

    setLoading(true);
    try {
      const res = await api.get(`/payments/user/${user._id}`);
      const data = res.data;

      const list = Array.isArray(data)
        ? data
        : data.payments || data.data || [];

      setPayments(list);
    } catch (err) {
      console.error("Payment Load Error:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadPayments();
  }, [user, loadPayments, navigate]);

  /* ---------------- PDF Receipt Download ---------------- */
  const downloadReceipt = async (paymentId) => {
    try {
      const res = await api.get(`/payments/${paymentId}/receipt`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `SVPG_Receipt_${paymentId}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download error:", err);
      alert("Receipt download failed.");
    }
  };

  /* ---------------- Excel Export ---------------- */
  const downloadExcel = () => {
    if (!payments?.length) return alert("No payments to export!");

    const excelData = payments.map((p) => {
      const room =
        p.roomNumber ||
        (p.bookingId
          ? `${p.bookingId.floor}${String(p.bookingId.room).padStart(2, "0")}`
          : "");

      const bed = p.bedNumber || (p.bookingId ? p.bookingId.bed : "");

      return {
        Name: p.name,
        Phone: p.phone,
        Room: room,
        Bed: bed,
        Amount: p.amount,
        Date: new Date(p.createdAt).toLocaleString(),
        PaymentID: p._id,
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "SVPG_Payments.xlsx");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="payment-page-wrapper">
      <div className="container py-4 payment-page">

        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fw-bold page-title">💳 Payment History</h2>

          <div>
            <button
              className="btn btn-outline-danger me-2 logout-btn"
              onClick={() => {
                localStorage.removeItem("user");
                navigate("/");
              }}
            >
              🚪 Logout
            </button>

            <button
              className="btn export-btn"
              onClick={downloadExcel}
              disabled={!payments?.length}
            >
              📊 Export Excel
            </button>
          </div>
        </div>

        {/* LOADING / EMPTY */}
        {loading ? (
          <div className="loading-text">Loading payments…</div>
        ) : payments.length === 0 ? (
          <p className="no-payment">No payments yet.</p>
        ) : (
          <div className="row g-4">
            {payments.map((p) => (
              <div key={p._id} className="col-md-6 col-lg-4">
                <div className="payment-card glass-card shadow-lg">

                  {/* Amount + Date */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="amount">₹{p.amount}</div>
                      <div className="date">
                        {new Date(p.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <span className="badge bg-success status-badge">Paid</span>
                  </div>

                  <hr />

                  {/* DETAILS */}
                  <p><strong>👤</strong> {p.name}</p>
                  <p><strong>📞</strong> {p.phone}</p>

                  <p>
                    <strong>🛏</strong>{" "}
                    {p.roomNumber
                      ? p.roomNumber
                      : p.bookingId
                      ? `${p.bookingId.floor}${String(p.bookingId.room).padStart(
                          2,
                          "0"
                        )}`
                      : "N/A"}{" "}
                    • Bed{" "}
                    {p.bedNumber || (p.bookingId ? p.bookingId.bed : "N/A")}
                  </p>

                  {/* EXTRA BOOKING INFO */}
                  {p.bookingId && (
                    <div className="booking-info mb-2">
                      <small>Booking name: {p.bookingId.name}</small><br />
                      <small>
                        Joined:{" "}
                        {p.bookingId.joinDate
                          ? new Date(
                              p.bookingId.joinDate
                            ).toLocaleDateString()
                          : "N/A"}
                      </small>
                    </div>
                  )}

                  {/* RECEIPT BUTTON */}
                  <div className="text-end mt-3">
                    <button
                      className="btn btn-outline-primary btn-sm receipt-btn"
                      onClick={() => downloadReceipt(p._id)}
                    >
                      📄 Download Receipt
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
