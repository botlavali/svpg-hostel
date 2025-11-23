// routes/payments.js
import express from "express";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import PDFDocument from "pdfkit";

const router = express.Router();

/* -----------------------------------
   MANUAL PAYMENT
------------------------------------ */
router.post("/manual", async (req, res) => {
  try {
    const { userId, bookingId, amount, code, name, phone } = req.body;

    if (code !== "CQNPV5241F0004" && code !== "MOHANSVPG") {
      return res.status(400).json({ success: false, message: "Invalid admin code" });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(400).json({ success: false, message: "User not found" });

    let roomNumber = "";
    let bedNumber = "";

    if (bookingId) {
      const b = await Booking.findById(bookingId);
      if (!b)
        return res.status(400).json({ success: false, message: "Booking not found" });

      roomNumber = `${b.floor}${String(b.room).padStart(2, "0")}`;
      bedNumber = b.bed;
    }

    const payment = await Payment.create({
      userId,
      bookingId: bookingId || null,
      amount,
      code,
      name: name || user.name,
      phone: phone || user.phone,
      roomNumber,
      bedNumber,
    });

    res.json({ success: true, payment });
  } catch (err) {
    console.error("Manual Payment Error:", err);
    res.status(500).json({ success: false });
  }
});

/* -----------------------------------
   USER PAYMENTS
------------------------------------ */
router.get("/user/:id", async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.id })
      .populate("bookingId")
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    console.error("User Payments Error:", err);
    res.status(500).json({ success: false });
  }
});

/* -----------------------------------
   ADMIN - ALL PAYMENTS (GROUPED)
------------------------------------ */
router.get("/all", async (req, res) => {
  try {
    const all = await Payment.find()
      .populate("bookingId")
      .populate("userId")
      .sort({ createdAt: -1 });

    const grouped = {};

    all.forEach((p) => {
      const uid = p.userId?._id || "UNKNOWN";

      if (!grouped[uid]) {
        grouped[uid] = {
          userId: uid,
          userName: p.userId?.name || p.name || "Unknown",
          phone: p.userId?.phone || p.phone || "N/A",
          payments: [],
          totalAmount: 0,
        };
      }

      grouped[uid].payments.push(p);
      grouped[uid].totalAmount += p.amount;
    });

    res.json({ success: true, grouped: Object.values(grouped) });
  } catch (err) {
    console.error("All Payment Error:", err);
    res.status(500).json({ success: false });
  }
});

/* -----------------------------------
   RECEIPT PDF
------------------------------------ */
router.get("/:id/receipt", async (req, res) => {
  try {
    const p = await Payment.findById(req.params.id);
    if (!p)
      return res.status(404).json({ success: false, message: "Not found" });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt-${p._id}.pdf`);

    doc.pipe(res);
    doc.fontSize(18).text("S.V PG Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Name: ${p.name}`);
    doc.text(`Phone: ${p.phone}`);
    doc.text(`Room: ${p.roomNumber}`);
    doc.text(`Bed: ${p.bedNumber}`);
    doc.text(`Amount: ₹${p.amount}`);
    doc.text(`Date: ${p.createdAt.toLocaleString()}`);
    doc.end();
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ success: false });
  }
});

/* -----------------------------------
   DELETE PAYMENT
------------------------------------ */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Payment.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true });
  } catch (err) {
    console.error("Delete Payment Error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
