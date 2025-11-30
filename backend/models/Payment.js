import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },   // ✔ Not ObjectId
    bookingId: { type: String, required: true }, // ✔ Not ObjectId
    amount: { type: Number, required: true },
    code: { type: String },
    name: { type: String },
    phone: { type: String },
    roomNumber: { type: String },
    bedNumber: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
