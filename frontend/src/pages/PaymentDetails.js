// frontend/src/pages/PaymentDetails.js
import React, { useCallback, useEffect, useState } from "react";
import api from "../api";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";

export default function PaymentDetails() {
  const navigate = useNavigate();
  const rawUser = localStorage.getItem("user");
const [user] = useState(rawUser ? JSON.parse(rawUser) : null);

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = useCallback(async () => {
    if (!user || !user._id) return;
    setLoading(true);
    try {
      const res = await api.get(`/payments/user/${user._id}`);
      // Accept both { success: true, payments: [...] } and direct array
      const data = res.data;
      const list = Array.isArray(data) ? data : data.payments || data.data || [];
      setPayments(list);
    } catch (err) {
      console.error("Payment Load Error:", err);
      // if 401/404 maybe user invalid — remove and redirect to login
      if (err?.response?.status === 404 || err?.response?.status === 400) {
        // show friendly message and clear
        console.warn("Payments not found for user. Logging out user.");
        // optionally navigate to login
      }
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

  // Download PDF receipt
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
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download error:", err);
      alert("Receipt download failed. Check server logs or route.");
    }
  };

  // Export to Excel
  const downloadExcel = () => {
    if (!payments || payments.length === 0) return alert("No payments to export!");
    const excelData = payments.map((p) => {
      // Payment object might have bookingId populated or roomNumber fields
      const room = p.roomNumber || (p.bookingId ? `${p.bookingId.floor}${String(p.bookingId.room).padStart(2,"0")}` : "");
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

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold mb-0">💳 Payment History</h2>
        <div>
          <button className="btn btn-outline-secondary me-2" onClick={() => { localStorage.removeItem("user"); navigate("/"); }}>
            Logout
          </button>
          <button className="btn btn-success" onClick={downloadExcel} disabled={!payments?.length}>
            📊 Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading payments…</div>
      ) : payments.length === 0 ? (
        <p>No payments yet.</p>
      ) : (
        <div className="row g-4">
          {payments.map((p) => (
            <div key={p._id} className="col-md-6 col-lg-4">
              <div className="card p-3 shadow-sm h-100">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="text-success fw-bold">₹{p.amount}</div>
                    <div className="text-muted small">{new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                  <span className="badge bg-success">Paid</span>
                </div>

                <hr />

                <p><strong>👤</strong> {p.name}</p>
                <p><strong>📞</strong> {p.phone}</p>

                <p>
                  <strong>🛏</strong>{" "}
                  {p.roomNumber ? p.roomNumber : (p.bookingId ? `${p.bookingId.floor}${String(p.bookingId.room).padStart(2,"0")}` : "N/A")}
                  {" • Bed "} {p.bedNumber || (p.bookingId ? p.bookingId.bed : "N/A")}
                </p>

                {p.bookingId && (
                  <div className="mb-2">
                    <small>Booking name: {p.bookingId.name}</small><br />
                    <small>Joined: {p.bookingId.joinDate ? new Date(p.bookingId.joinDate).toLocaleDateString() : "N/A"}</small>
                  </div>
                )}

                <div className="text-end mt-2">
                  <button className="btn btn-outline-primary btn-sm me-2" onClick={() => downloadReceipt(p._id)}>
                    📄 Receipt
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
