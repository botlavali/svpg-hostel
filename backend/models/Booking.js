// models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    altPhone: { type: String },
    email: { type: String },
    aadharNumber: { type: String },
    joinDate: { type: Date, required: true },
    floor: { type: String, required: true },
    room: { type: Number, required: true },
    bed: { type: Number, required: true },
    amountPaid: { type: Number, default: 0 },
    photo: { type: String }, // path to uploaded photo
    aadharFile: { type: String }, // path to uploaded aadhaar
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
