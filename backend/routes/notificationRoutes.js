// backend/routes/notificationRoutes.js
import express from "express";
import { sendWhatsAppMessage } from "../services/whatsappService.js";

const router = express.Router();

// Health endpoint to check config
router.get("/status", (req, res) => {
  res.json({
    whatsappConfigured: !!(process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID),
    whatsappPhoneId: process.env.WHATSAPP_PHONE_ID || null,
  });
});

// Manual send endpoint
router.post("/send", async (req, res) => {
  try {
    const { phone, name, room, bed, amount } = req.body;
    if (!phone || !name || !room || !bed || !amount) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const message = `🏠 S.V PG Hostel Booking Confirmed ✅
Hi ${name}, your booking is confirmed.
Room: ${room}, Bed: ${bed}
Amount Paid: ₹${amount}
Thank you for staying at S.V PG Hostel!`;

    const result = await sendWhatsAppMessage({ to: phone, message });

    if (!result.success) {
      return res.status(500).json({ success: false, message: result.message });
    }

    res.json({ success: true, message: "WhatsApp message sent", data: result.data });
  } catch (err) {
    console.error("❌ Notification route error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
