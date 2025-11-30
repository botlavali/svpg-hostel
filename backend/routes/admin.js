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

  // Hardcoded admin credentials
  if (email === "admin@gmail.com" && password === "admin123") {
    const adminData = {
      name: "Admin",
      email: "admin@gmail.com",
      role: "admin",
    };

    const token = jwt.sign(
      adminData,
      process.env.ADMIN_JWT_SECRET || "AdminSecretKey",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      admin: adminData, // FRONTEND NEEDS THIS
    });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials" });
});

/* --------------------------------------
    ADMIN AUTH MIDDLEWARE
--------------------------------------- */
function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";

  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const token = header.split(" ")[1];
    jwt.verify(token, process.env.ADMIN_JWT_SECRET || "AdminSecretKey");
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
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
  } catch {
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

    const revenueAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue =
      revenueAgg.length > 0 ? revenueAgg[0].total : 0;

    res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalPayments,
      totalRevenue,
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
