// frontend/src/pages/Rooms.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Rooms.css";

export default function Rooms() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bookedBeds, setBookedBeds] = useState([]);
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [pendingBookingData, setPendingBookingData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    altPhone: "",
    email: "",
    aadharNumber: "",
    joinDate: "",
    photo: null,
    aadharFile: null,
  });

  const [bedAmountInput, setBedAmountInput] = useState("");
  const [confirmCode, setConfirmCode] = useState("");

  // Check login & rules before loading
  useEffect(() => {
    const u = localStorage.getItem("user");
    const accepted = localStorage.getItem("acceptedRules");
    if (!u) {
      navigate("/login");
      return;
    }
    if (!accepted) {
      navigate("/rules");
      return;
    }

    try {
      const parsed = JSON.parse(u);
      const displayName =
        parsed.name || parsed.username || parsed.email?.split("@")[0];
      setUser({ ...parsed, displayName });
      loadBookings();
    } catch (err) {
      console.error("Invalid user in localStorage:", err);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // NOTE: use /api/bookings because your backend mounts bookingRoutes on /api/bookings
  const loadBookings = async () => {
    try {
      const res = await api.get("/bookings");
      // backend returns either array or { success: true, data: [...] } — handle both
      const payload = res.data?.success && res.data?.data ? res.data.data : res.data;
      setBookedBeds(payload || []);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      // keep bookedBeds empty
      setBookedBeds([]);
    }
  };

  // Room structure
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

  const findBooking = (floor, room, bed) =>
    bookedBeds.find(
      (x) => +x.floor === +floor && +x.room === +room && +x.bed === +bed
    );

  const isSelected = (f, r, b) =>
    selectedBeds.some((s) => s.floor === f && s.room === r && s.bed === b);

  const toggleBed = (floor, room, bed) => {
    if (findBooking(floor, room, bed)) return alert("❌ Already booked!");
    const key = `${floor}-${room}-${bed}`;
    if (isSelected(floor, room, bed)) {
      setSelectedBeds((p) => p.filter((s) => s.key !== key));
      if (selectedBeds.length <= 1) setFormVisible(false);
      return;
    }
    if (selectedBeds.length >= 3)
      return alert("⚠️ Max 3 beds per booking allowed.");
    setSelectedBeds((p) => [...p, { key, floor, room, bed }]);
    setFormVisible(true);
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBeds.length) return alert("Select at least one bed.");
    setPendingBookingData({ formData, selectedBeds });
    setBedAmountInput(String(computedBedAmount));
    setShowPaymentInfo(true);
  };

  // Auto calculate amount
  const computedBedAmount = useMemo(() => {
    let total = 0;
    for (const s of selectedBeds) {
      const bedsPerRoom = roomStructure[s.floor][s.room - 1];
      total += bedsPerRoom === 2 ? 11000 : 9000;
    }
    return total;
  }, [selectedBeds, roomStructure]);

  const advance = 20000;
  const finalAmount =
    Number(bedAmountInput || computedBedAmount) + Number(advance || 0);

  // Manual payment + Booking
 const handlePayNow = async () => {
  try {
    if (!pendingBookingData) {
      alert("No booking data available.");
      return;
    }

    const userId = user?._id || user?.id || user;

    let createdBookings = [];

    // 1) Create booking(s)
    for (const bed of pendingBookingData.selectedBeds) {
      const data = new FormData();

      // append all form fields
      for (const [k, v] of Object.entries(pendingBookingData.formData || {})) {
        if (v instanceof File) data.append(k, v);
        else data.append(k, String(v));
      }

      data.append("floor", bed.floor);
      data.append("room", bed.room);
      data.append("bed", bed.bed);
      data.append("userId", userId);
      data.append("amountPaid", finalAmount);

      // ⭐ FIXED URL (NO SECOND /api)
      const bookingRes = await api.post("/bookings", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const booking =
        bookingRes.data?.booking ||
        bookingRes.data?.data ||
        bookingRes.data;

      createdBookings.push(booking);
    }

    if (createdBookings.length === 0) {
      return alert("No bookings created.");
    }

    const firstBooking = createdBookings[0];

    // 2) Save payment
    const payRes = await api.post("/payments/manual", {
      userId,
      bookingId: firstBooking._id,
      amount: finalAmount,
      code: confirmCode,
      name: formData.name,
      phone: formData.phone,
      roomNumber: `${firstBooking.floor}${String(firstBooking.room).padStart(2, "0")}`,
      bedNumber: firstBooking.bed,
    });

    if (!payRes.data?.success) {
      return alert(payRes.data?.message || "Payment failed");
    }

    alert("Booking + Payment Successful!");
    navigate("/roomdetails");

  } catch (err) {
    console.error("Booking error:", err.response?.data || err);
    alert("Booking failed (see console)");
  }
};


  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="container-fluid p-4">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-12 col-md-3 col-lg-2 mb-4">
          {user ? (
            <div className="card shadow-sm p-3 text-center h-100">
              <div
                className="mx-auto rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mb-3"
                style={{ width: 80, height: 80, fontSize: 28 }}
              >
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <h6 className="text-secondary mb-1">Welcome</h6>
              <p className="fw-bold text-primary mb-3">{user.displayName}</p>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => navigate("/roomdetails")}
                >
                  📖 My Bookings
                </button>
                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center mt-4 text-muted">Loading...</div>
          )}
        </aside>

        {/* Main Section */}
        <main className="col-12 col-md-9 col-lg-10">
          <h2 className="mb-3">🏠 S.V PG Hostel Gents — Beds Booking</h2>

          {Object.entries(roomStructure).map(([floor, rooms]) => (
            <section key={floor} className="mb-4">
              <h5 className="fw-bold mb-3">Floor {floor}</h5>
              <div className="row g-3">
                {rooms.map((bedsPerRoom, rIdx) => {
                  const roomIndex = rIdx + 1;
                  const roomNo = `${floor}${String(roomIndex).padStart(2, "0")}`;
                  return (
                    <div key={roomIndex} className="col-12 col-md-4 col-lg-2">
                      <div className="card shadow-sm border-0 room-card">
                        <div className="card-body text-center">
                          <h6 className="text-secondary">Room {roomNo}</h6>
                          <div className="mb-2">
                            <span className="badge bg-light text-dark border">
                              {bedsPerRoom === 2 ? "₹11,000/bed" : "₹9,000/bed"}
                            </span>
                          </div>
                          <div className="d-flex flex-wrap justify-content-center gap-2">
                            {Array.from({ length: bedsPerRoom }).map((_, i) => {
                              const bed = i + 1;
                              const booked = findBooking(floor, roomIndex, bed);
                              const selected = isSelected(floor, roomIndex, bed);

                              const classes = booked
                                ? "bed-icon booked"
                                : selected
                                  ? "bed-icon selected"
                                  : "bed-icon available";

                              return (
                                <button
                                  key={bed}
                                  className={classes}
                                  onClick={() => toggleBed(floor, roomIndex, bed)}
                                  disabled={!!booked}
                                  title={booked ? "Booked" : `Room ${roomNo} - Bed ${bed}`}
                                >
                                  <div className="bed-icon-inner">
                                    <span className="bed-icon-emoji">🛏</span>
                                    <div className="bed-label">
                                      {booked ? booked.name || "Booked" : selected ? `Sel ${bed}` : `Bed ${bed}`}
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          {/* Booking Form */}
          {formVisible && (
            <div className="card fixed-bottom mb-3 mx-3 p-3 shadow-lg border-0 form-card">
              <form className="row g-2" onSubmit={handleSubmit}>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input name="name" className="form-control" placeholder="Enter your full name" value={formData.name} onChange={handleFormChange} required />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">Mobile Number</label>
                  <input name="phone" className="form-control" placeholder="Mobile Number" value={formData.phone} onChange={handleFormChange} required />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">Alternate Number</label>
                  <input name="altPhone" className="form-control" placeholder="Alternate Number" value={formData.altPhone} onChange={handleFormChange} />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Email Address</label>
                  <input name="email" className="form-control" placeholder="Email" value={formData.email} onChange={handleFormChange} required />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">Aadhaar Number</label>
                  <input name="aadharNumber" className="form-control" placeholder="Aadhaar Number" value={formData.aadharNumber} onChange={handleFormChange} required />
                </div>

                <div className="col-md-2">
                  <label className="form-label fw-semibold">Joining Date</label>
                  <input name="joinDate" type="date" className="form-control" value={formData.joinDate} onChange={handleFormChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Upload Your Photo</label>
                  <input name="photo" type="file" accept="image/*" className="form-control" onChange={handleFormChange} required />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Upload Aadhaar Card</label>
                  <input name="aadharFile" type="file" accept="image/*,.pdf" className="form-control" onChange={handleFormChange} required />
                </div>

                <div className="col-md-2 d-grid">
                  <button className="btn btn-primary" type="submit">Confirm Booking</button>
                </div>
              </form>
            </div>
          )}

          {/* Payment Modal */}
          {showPaymentInfo && (
            <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.45)" }}>
              <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">
                  <div className="modal-header bg-primary text-white">
                    <h5>💳 Confirm Payment</h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => setShowPaymentInfo(false)} />
                  </div>
                  <div className="modal-body">
                    <p>2-bed → ₹11,000 | 3-bed → ₹9,000</p>
                    <p className="fw-bold text-primary">Advance ₹{advance} | Beds: {selectedBeds.length}</p>
                    <div className="p-2 rounded bg-light">
                      <div className="d-flex justify-content-between">
                        <span>Bed total:</span>
                        <span>₹{computedBedAmount}</span>
                      </div>
                      <div className="d-flex justify-content-between border-top pt-2 fw-bold text-primary">
                        <span>Total payable:</span>
                        <span>₹{finalAmount}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label>Enter Confirmation Code</label>
                      <input className="form-control" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} placeholder="Enter S.V PG code" />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-outline-secondary" onClick={() => setShowPaymentInfo(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={() => {
                      if (!confirmCode.trim()) return alert("Enter confirmation code!");
                      if (confirmCode.trim().toUpperCase() !== "MOHANSVPG") return alert("❌ Invalid code!");
                      handlePayNow();
                    }}>Pay & Confirm</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
