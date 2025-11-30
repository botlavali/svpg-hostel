// routes/admin.js
import express from "express";
import jwt from "jsonwebtoken";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const router = express.Router();

/* --------------------------------------
    SIMPLE ADMIN LOGIN
--------------------------------------- */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // Hardcoded admin login (You can modify based on your DB)
  if (email === "admin@gmail.com" && password === "admin123") {
    const token = jwt.sign({ role: "admin" }, process.env.ADMIN_JWT_SECRET, {
      expiresIn: "7d",
    });
    return res.json({ success: true, token });
  }

  return res.status(401).json({ success: false, message: "Invalid credentials" });
});

/* --------------------------------------
    ADMIN AUTH MIDDLEWARE
--------------------------------------- */
function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    jwt.verify(token, process.env.ADMIN_JWT_SECRET || "AdminSecretKey");
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* --------------------------------------
       PAYMENTS LIST
--------------------------------------- */
router.get("/payments", adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("bookingId")
      .populate("userId")
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    console.error("Admin Payments Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* --------------------------------------
       DASHBOARD OVERVIEW
--------------------------------------- */
router.get("/overview", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments();

    const totalAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const totalRevenue = totalAgg.length ? totalAgg[0].total : 0;

    res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalPayments,
      totalRevenue
    });
  } catch (err) {
    console.error("Overview Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
