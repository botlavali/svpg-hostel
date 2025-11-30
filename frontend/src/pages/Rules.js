import React from "react";
import "../styles/Rules.css";
import { useNavigate } from "react-router-dom";

export default function Rules() {
  const navigate = useNavigate();

  const handleAccept = () => {
    localStorage.setItem("acceptedRules", "true");
    navigate("/rooms");
  };

  return (
    <div className="rules-container">
      <div className="rules-card shadow-lg">
        <h2 className="rules-title text-center mb-4">🏠 S.V PG Hostel – Terms & Conditions</h2>

        <ul className="rules-list">
          <li>1️⃣ If you wish to vacate the PG after <b>11 months</b>, inform 30 days prior; otherwise, <b>30 days’ rent</b> will be charged.</li>
          <li>2️⃣ Vacating within 1 year requires paying the remaining months’ rent.</li>
          <li>3️⃣ Rent must be paid <b>before the 5th</b> of each month. Late fee: <span className="highlight">₹500</span>.</li>
          <li>4️⃣ Outside visitors are not allowed without prior permission.</li>
          <li>5️⃣ Electrical appliances are strictly not allowed.</li>
          <li>6️⃣ Ensure lights, fan, and TV are <b>switched off</b> before leaving the room.</li>
          <li>7️⃣ Management is not responsible for <b>personal belongings</b> (Gold, Cash, Laptop, etc.).</li>
          <li>8️⃣ <b>Smoking and drinking</b> are prohibited inside the PG premises.</li>
          <li>9️⃣ Do not take food into rooms — dining hall use only.</li>
          <li>🔟 Damages to PG property must be compensated fully.</li>
          <li>11️⃣ Lost keys will incur a <b>replacement charge</b>.</li>
          <li>12️⃣ Gate closes at <b>9:00 PM</b>. Late entry requires prior notice.</li>
          <li>13️⃣ Gents & Ladies should not interact near PG premises.</li>
          <li>14️⃣ Guest accommodation: <b>₹700 per day</b>.</li>
        </ul>

        <div className="food-timing">
          <h5 className="mt-4 mb-3">🍴 Food Timings</h5>
          <p>Breakfast: <b>7:00 AM – 9:00 AM</b></p>
          <p>Lunch: <b>1:00 PM – 2:00 PM</b></p>
          <p>Dinner: <b>7:30 PM – 9:00 PM</b></p>
        </div>

        <div className="alert-box mt-4">
          ⚠️ PG is <b>not responsible</b> for loss of personal belongings.
        </div>

        <div className="text-center mt-4">
          <button className="btn btn-primary accept-btn" onClick={handleAccept}>
            ✅ I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
