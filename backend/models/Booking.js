import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    altPhone: { type: String, default: "" },
    email: { type: String, default: "" },

    aadharNumber: { type: String, default: "" },
    joinDate: { type: String, default: "" },

    floor: { type: Number, required: true },
    room: { type: Number, required: true },
    bed: { type: Number, required: true },

    userId: {
      type: String,
      default: "unknown",
      index: true,
    },

    amountPaid: { type: Number, default: 0 },

    photo: { type: String, default: "" },
    aadharFile: { type: String, default: "" },
  },
  { timestamps: true }
);

bookingSchema.index({ floor: 1, room: 1, bed: 1 });

export default mongoose.model("Booking", bookingSchema);
