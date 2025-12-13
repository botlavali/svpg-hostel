import express from "express";
import jwt from "jsonwebtoken";
import Booking from "../models/Booking.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

const router = express.Router();

/* =====================================================
   ADMIN LOGIN
===================================================== */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "admin123") {
    const admin = {
      name: "Admin",
      email,
      role: "admin",
    };

    const token = jwt.sign(
      admin,
      process.env.ADMIN_JWT_SECRET || "AdminSecretKey",
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      admin,
    });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid credentials" });
});

/* =====================================================
   ADMIN AUTH MIDDLEWARE
===================================================== */
function adminAuth(req, res, next) {
  const auth = req.headers.authorization || "";

  if (!auth.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const token = auth.split(" ")[1];
    jwt.verify(token, process.env.ADMIN_JWT_SECRET || "AdminSecretKey");
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
}

/* =====================================================
   ✅ PAYMENTS (USED BY ADMIN PANEL)
   URL: /admin/payments
===================================================== */
router.get("/payments", adminAuth, async (req, res) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .lean();

    // GROUP PAYMENTS BY USER
    const groupedMap = {};

    payments.forEach((p) => {
      if (!groupedMap[p.userId]) {
        groupedMap[p.userId] = {
          userId: p.userId,
          userName: p.name || "Unknown",
          phone: p.phone || "",
          payments: [],
          totalAmount: 0,
        };
      }

      groupedMap[p.userId].payments.push(p);
      groupedMap[p.userId].totalAmount += p.amount || 0;
    });

    const grouped = Object.values(groupedMap);

    res.json({ success: true, grouped });
  } catch (err) {
    console.error("ADMIN PAYMENTS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


/* =====================================================
   DASHBOARD OVERVIEW
===================================================== */
router.get("/overview", adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalPayments = await Payment.countDocuments();

    const revenueAgg = await Payment.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    return res.json({
      success: true,
      totalUsers,
      totalBookings,
      totalPayments,
      totalRevenue,
    });
  } catch (err) {
    console.error("ADMIN OVERVIEW ERROR:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error" });
  }
});

export default router;
