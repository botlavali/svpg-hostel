// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
    name: { type: String },
    phone: { type: String },
    roomNumber: { type: String },
    bedNumber: { type: String },
    amount: { type: Number, required: true },
    code: { type: String }, // admin confirmation code or txn id
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
