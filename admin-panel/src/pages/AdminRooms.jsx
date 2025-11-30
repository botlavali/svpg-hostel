// src/pages/AdminRooms.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../api";
import "./AdminRooms.css";

export default function AdminRooms() {
  const [bookings, setBookings] = useState([]);
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [formFloor, setFormFloor] = useState(null);

  const formRef = useRef(null);
  const payRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    aadharNumber: "",
    joinDate: "",
    photo: null,
    aadharFile: null,
  });

  const [confirmCode, setConfirmCode] = useState("");

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

  // Load all bookings
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/bookings");
        const data = Array.isArray(res.data.bookings)
          ? res.data.bookings
          : [];

        setBookings(data);
      } catch (err) {
        console.error("Load error:", err);
      }
    })();
  }, []);

  // Find if booked
  const findBooking = (f, r, b) =>
    bookings.find(
      (x) => +x.floor === +f && +x.room === +r && +x.bed === +b
    );

  // Bed clicked
  const toggleBed = (floor, room, bed) => {
    if (findBooking(floor, room, bed)) {
      alert("❌ Already booked!");
      return;
    }

    setSelectedBeds([{ floor, room, bed }]);
    setFormFloor(floor);
    setFormVisible(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const bedAmount = selectedBeds.length
    ? roomStructure[selectedBeds[0].floor][selectedBeds[0].room - 1] === 2
      ? 11000
      : 9000
    : 0;

  const finalAmount = bedAmount + 20000; // 20k advance

  // Handle input
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((p) => ({
      ...p,
      [name]: files ? files[0] : value,
    }));
  };

  // Submit form (show payment box)
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPayment(true);
    setTimeout(() => {
      payRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  // Pay and confirm
  const handlePayNow = async () => {
    if (confirmCode !== "MOHANSVPG") {
      alert("Wrong confirmation code!");
      return;
    }

    try {
      const bed = selectedBeds[0];

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("phone", formData.phone);
      fd.append("email", formData.email);
      fd.append("aadharNumber", formData.aadharNumber);
      fd.append("joinDate", formData.joinDate);

      fd.append("floor", bed.floor);
      fd.append("room", bed.room);
      fd.append("bed", bed.bed);

      fd.append("amountPaid", finalAmount);

      if (formData.photo) fd.append("photo", formData.photo);
      if (formData.aadharFile) fd.append("aadharFile", formData.aadharFile);

      const res = await api.post("/bookings", fd);
      const newBooking = res.data.booking;

      await api.post("/payments/manual", {
        userId: newBooking.userId,
        bookingId: newBooking._id,
        amount: finalAmount,
        code: confirmCode,
        name: formData.name,
        phone: formData.phone,
        roomNumber: `${newBooking.floor}${String(newBooking.room).padStart(
          2,
          "0"
        )}`,
        bedNumber: newBooking.bed,
      });

      alert("Booking Successful! 🎉");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Booking failed");
    }
  };

  return (
    <AdminLayout>
      <div className="admin-rooms-container">
        <h2 className="page-title">Admin – Rooms</h2>

        {/* Floors */}
        {Object.entries(roomStructure).map(([floor, rooms]) => (
          <div key={floor} className="floor-section">
            <h4 className="floor-title">Floor {floor}</h4>

            <div className="rooms-grid">
              {rooms.map((bedsCount, index) => {
                const room = index + 1;

                return (
                  <div className="room-card" key={room}>
                    <h5 className="room-title">
                      Room {floor}
                      {String(room).padStart(2, "0")}
                    </h5>

                    <div className="bed-grid">
                      {Array.from({ length: bedsCount }).map((_, i) => {
                        const bed = i + 1;
                        const booked = findBooking(+floor, room, bed);

                        return (
                          <button
                            key={bed}
                            className={
                              booked ? "bed-btn booked" : "bed-btn"
                            }
                            disabled={!!booked}
                            onClick={() => toggleBed(+floor, room, bed)}
                          >
                            Bed {bed}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* FORM under correct floor */}
            {formVisible && formFloor === +floor && (
              <div ref={formRef} className="dark-form">
                <h4 className="form-title">New Booking</h4>
                <form className="form-grid" onSubmit={handleSubmit}>
                  <div>
                    <label>Name</label>
                    <input name="name" required onChange={handleChange} />
                  </div>

                  <div>
                    <label>Phone</label>
                    <input name="phone" required onChange={handleChange} />
                  </div>

                  <div>
                    <label>Email</label>
                    <input name="email" onChange={handleChange} />
                  </div>

                  <div>
                    <label>Aadhar Number</label>
                    <input
                      name="aadharNumber"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Join Date</label>
                    <input
                      type="date"
                      name="joinDate"
                      required
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <label>Photo</label>
                    <input type="file" name="photo" onChange={handleChange} />
                  </div>

                  <div>
                    <label>Aadhar File</label>
                    <input
                      type="file"
                      name="aadharFile"
                      onChange={handleChange}
                    />
                  </div>

                  <button className="submit-btn">Proceed to Payment</button>
                </form>
              </div>
            )}
          </div>
        ))}

        {/* PAYMENT BOX */}
        {showPayment && (
          <div ref={payRef} className="dark-modal">
            <div className="modal-card neon-glow">
              <h3>Confirm Payment</h3>
              <p className="modal-amount">Amount: ₹{finalAmount}</p>

              <input
                className="modal-input"
                placeholder="Enter Admin Code"
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
              />

              <button className="pay-btn" onClick={handlePayNow}>
                Pay & Confirm
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowPayment(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
