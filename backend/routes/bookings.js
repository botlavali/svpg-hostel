// backend/routes/bookings.js
import express from "express";
import multer from "multer";
import Booking from "../models/Booking.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

/* PATH SETUP */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* MULTER */
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});
const upload = multer({ storage });

/* CLEAN BODY */
const clean = (body = {}) => {
  const out = {};
  Object.keys(body).forEach((k) => {
    out[k] = Array.isArray(body[k]) ? body[k][0] : body[k];
  });
  return out;
};

/* =====================================================
   ✅ ADMIN — GET ALL BOOKINGS
   This is what api.get("/bookings") hits
===================================================== */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      bookings,
    });
  } catch (err) {
    console.error("ADMIN BOOKINGS ERROR:", err);
    return res.json({
      success: true,
      bookings: [],
    });
  }
});


/* ✅ DELETE BOOKING */
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    return res.json({ success: true });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    return res.status(500).json({ success: false });
  }
});


/* ✅ UPDATE BOOKING (SHIFT BED) */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(
      req.params.id,
      {
        floor: req.body.floor,
        room: req.body.room,
        bed: req.body.bed,
      },
      { new: true }
    );

    return res.json({ success: true, booking: updated });
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);
    return res.status(500).json({ success: false });
  }
});

/* =====================================================
   ✅ USER — GET OWN BOOKINGS
===================================================== */
router.get("/user/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, bookings });
  } catch (err) {
    console.error("USER BOOKINGS ERROR:", err);
    return res.json({ success: true, bookings: [] });
  }
});

/* =====================================================
   ✅ CREATE BOOKING
===================================================== */
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      req.body = clean(req.body);

      const booking = new Booking({
        ...req.body,
        userId: req.body.userId || "unknown",
        floor: Number(req.body.floor),
        room: Number(req.body.room),
        bed: Number(req.body.bed),
        amountPaid: Number(req.body.amountPaid) || 0,
        photo: req.files?.photo?.[0]
          ? `uploads/${path.basename(req.files.photo[0].path)}`
          : "",
        aadharFile: req.files?.aadharFile?.[0]
          ? `uploads/${path.basename(req.files.aadharFile[0].path)}`
          : "",
      });

      const saved = await booking.save();
      return res.json({ success: true, booking: saved });
    } catch (err) {
      console.error("BOOKING SAVE ERROR:", err);
      return res.json({ success: false, message: "Booking failed" });
    }
  }
);

export default router;
