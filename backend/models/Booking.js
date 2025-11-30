// backend/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String, default: "" },
    email: { type: String, required: true },

    // Make Aadhaar optional to avoid blocking admin quick bookings.
    aadharNumber: { type: String, required: false, default: "" },

    joinDate: { type: String, required: true },

    floor: { type: Number, required: true },
    room: { type: Number, required: true },
    bed: { type: Number, required: true },

    // Keep userId as string (flexible)
    userId: { type: String, default: "admin" },

    amountPaid: { type: Number, default: 0 },

    photo: { type: String, default: "" },
    aadharFile: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
