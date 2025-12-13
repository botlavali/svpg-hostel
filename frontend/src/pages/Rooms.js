
// frontend/src/pages/Rooms.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
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
  const [successPopup, setSuccessPopup] = useState(false);

  // Active floor to render the inline top form / payment under
  const [activeFloor, setActiveFloor] = useState(null);

  // -----------------------------
  // LOGIN CHECK
  // -----------------------------
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
    } catch (err) {
      console.error("Invalid user in localStorage:", err);
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // -----------------------------
  // LOAD BOOKINGS
  // -----------------------------
  const loadBookings = useCallback(async () => {
    if (!user?._id) return;

    try {
      const res = await api.get(`/bookings/user/${user._id}`);
      const data = Array.isArray(res.data?.bookings) ? res.data.bookings : [];
      setBookedBeds(data);
    } catch (err) {
      console.error("Load bookings failed:", err);
      setBookedBeds([]);
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) loadBookings();
  }, [user, loadBookings]);

  // -----------------------------
  // ROOM STRUCTURE
  // -----------------------------
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
      // remove selection
      setSelectedBeds((p) => {
        const next = p.filter((s) => s.key !== key);
        if (next.length === 0) {
          setFormVisible(false);
          setActiveFloor(null);
        }
        return next;
      });
      return;
    }

    if (selectedBeds.length >= 3)
      return alert("⚠️ Max 3 beds per booking allowed.");

    setSelectedBeds((prev) => [...prev, { key, floor, room, bed }]);
    setFormVisible(true);
    setActiveFloor(String(floor));
  };

  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  // -----------------------------
  // PRICE CALCULATION
  // -----------------------------
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
    Number(bedAmountInput || computedBedAmount) + Number(advance);

  // -----------------------------
  // FORM SUBMISSION => SHOW PAYMENT INLINE
  // -----------------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBeds.length) return alert("Select at least one bed.");
    setPendingBookingData({ formData, selectedBeds });
    setBedAmountInput(String(computedBedAmount));
    setShowPaymentInfo(true);
    // Keep the activeFloor same so payment shows in same floor
  };

  // -----------------------------
  // PAYMENT + BOOKING
  // -----------------------------
  const handlePayNow = async () => {
    try {
      if (!pendingBookingData) {
        alert("No booking data available.");
        return;
      }

      const userId = user?._id;

      let createdBookings = [];

      for (const bed of pendingBookingData.selectedBeds) {
        const data = new FormData();

        for (const [k, v] of Object.entries(pendingBookingData.formData)) {
          if (v instanceof File) data.append(k, v);
          else data.append(k, String(v));
        }

        data.append("floor", bed.floor);
        data.append("room", bed.room);
        data.append("bed", bed.bed);
        data.append("userId", userId);
        data.append("amountPaid", finalAmount);

        const bookingRes = await api.post("/bookings", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const booking =
          bookingRes.data?.booking ||
          bookingRes.data?.data ||
          bookingRes.data;

        createdBookings.push(booking);
      }

      if (createdBookings.length === 0)
        return alert("No bookings created.");

      const firstBooking = createdBookings[0];

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

      if (!payRes.data?.success)
        return alert(payRes.data?.message || "Payment failed");

      setSuccessPopup(true);

      // small cleanup for UI
      setSelectedBeds([]);
      setPendingBookingData(null);
      setFormVisible(false);
      setShowPaymentInfo(false);
      setActiveFloor(null);

      setTimeout(() => {
        setSuccessPopup(false);
        navigate("/roomdetails");
      }, 2000);
    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking failed (see console)");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="container-fluid p-4 rooms-wrapper">
      <div className="row">
        {/* Sidebar */}
        <aside className="col-12 col-md-3 col-lg-2 mb-4">
          {user ? (
            <div className="card shadow-sm p-3 text-center h-100 sidebar-card">
              <div
                className="mx-auto profile-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: 80, height: 80, fontSize: 28 }}
              >
                {user.displayName?.[0]?.toUpperCase() || "U"}
              </div>
              <h6 className="text-secondary mb-1">Welcome</h6>
              <p className="fw-bold mb-3">{user.displayName}</p>
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

        {/* Main */}
        <main className="col-12 col-md-9 col-lg-10">
          <h2 className="mb-3 page-title">🏠 S.V PG Hostel Gents — Beds Booking</h2>

          {Object.entries(roomStructure).map(([floor, rooms]) => {
            const floorIsActive = activeFloor === String(floor);
            return (
              <section key={floor} className={`mb-4 ${floorIsActive ? "floor-active" : ""}`}>
                <div className="floor-header mb-2">
                  <h5 className="fw-bold mb-0 floor-title">Floor {floor}</h5>
                  {/* optional: if you want a small selected count badge */}
                  {floorIsActive && selectedBeds.length > 0 && (
                    <div className="badge-selected">{selectedBeds.length} selected</div>
                  )}
                </div>

                {/* INLINE BOOKING FORM (shows under floor title when formVisible & on this floor) */}
                {formVisible && activeFloor === String(floor) && (
                  <div className="top-form-card mb-3">
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

                {/* INLINE PAYMENT CARD (appears just below the booking form when showPaymentInfo && same floor) */}
                {showPaymentInfo && activeFloor === String(floor) && (
                  <div className="top-form-card mb-3" aria-live="polite">
                    <div className="row g-2 align-items-center">
                      <div className="col-12">
                        <h6 className="mb-1">💳 Payment — Confirm details</h6>
                        <p className="mb-2 small">2-bed → ₹11,000 | 3-bed → ₹9,000</p>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Bed total</label>
                        <div className="form-control" aria-readonly>{`₹${computedBedAmount}`}</div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Advance</label>
                        <div className="form-control" aria-readonly>{`₹${advance}`}</div>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Total payable</label>
                        <div className="form-control fw-bold" aria-readonly>{`₹${finalAmount}`}</div>
                      </div>

                      <div className="col-md-6 mt-2">
                        <label className="form-label">Enter Confirmation Code</label>
                        <input className="form-control" value={confirmCode} onChange={(e) => setConfirmCode(e.target.value)} placeholder="Enter S.V PG code" />
                      </div>

                      <div className="col-md-6 mt-2 d-flex gap-2">
                        <button
                          className="btn btn-outline-secondary flex-fill"
                          onClick={() => {
                            // go back to booking form so user can edit
                            setShowPaymentInfo(false);
                          }}
                        >
                          ← Back to form
                        </button>

                        <button
                          className="btn btn-primary flex-fill"
                          onClick={() => {
                            if (!confirmCode.trim()) return alert("Enter confirmation code!");
                            if (confirmCode.trim().toUpperCase() !== "MOHANSVPG") return alert("❌ Invalid code!");
                            handlePayNow();
                          }}
                        >
                          Pay & Confirm
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rooms Grid */}
                <div className="row g-3">
                  {rooms.map((bedsPerRoom, rIdx) => {
                    const roomIndex = rIdx + 1;
                    const roomNo = `${floor}${String(roomIndex).padStart(2, "0")}`;
                    return (
                      <div key={roomIndex} className="col-12 col-md-4 col-lg-2">
                        <div className="card shadow-sm border-0 room-card">
                          <div className="card-body text-center">
                            <h6 className="mb-2">Room {roomNo}</h6>
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
            );
          })}

          {/* removed modal: payment is inline now */}
        </main>
      </div>

      {/* SUCCESS CONFETTI POPUP */}
      {successPopup && (
        <div className="success-overlay">
          <div className="success-popup glass">
            <div className="success-icon">✅</div>
            <h3>Booking Successful!</h3>
            <p className="muted">Thanks — redirecting to My Bookings...</p>
          </div>

          <div className="confetti-layer" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className={`confetti c${(i % 6) + 1}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
