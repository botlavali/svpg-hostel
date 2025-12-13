// backend/routes/bookings.js
import express from "express";
import multer from "multer";
import Booking from "../models/Booking.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

/* FIX ABSOLUTE UPLOAD PATH: save to backend/uploads */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We want to save to backend/uploads (one central folder)
const UPLOAD_DIR = path.join(__dirname, "..", "uploads"); // <-- backend/uploads

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/* MULTER STORAGE */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({ storage });

/* CLEAN DUPLICATE KEYS (multipart may send arrays) */
function clean(body) {
  const out = {};
  Object.keys(body).forEach((k) => {
    out[k] = Array.isArray(body[k]) ? body[k][0] : body[k];
  });
  return out;
}

/* GET ALL BOOKINGS */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("GET /bookings error:", err);
    res.status(500).json({ success: false });
  }
});

/* CREATE BOOKING - accepts photo + aadharFile */
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
        floor: Number(req.body.floor),
        room: Number(req.body.room),
        bed: Number(req.body.bed),
        amountPaid: Number(req.body.amountPaid) || 0,
        // store relative paths that match static serve: `/uploads/<filename>`
        photo: req.files?.photo?.[0]
<<<<<<< HEAD
           photo: req.files?.photo?.[0]
  ? `uploads/${req.files.photo[0].filename}`
  : "",

aadharFile: req.files?.aadharFile?.[0]
  ? `uploads/${req.files.aadharFile[0].filename}`
  : "",


>>>>>>> 071c4d6a (Fix uploads serving and photo URL issue)

      });

      const saved = await booking.save();
      res.json({ success: true, booking: saved });
    } catch (err) {
      console.error("POST /bookings error:", err);
      res.status(500).json({ success: false });
    }
  }
);

/* UPDATE SHIFT or other fields */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, updated });
  } catch (err) {
    console.error("PUT /bookings/:id error:", err);
    res.status(500).json({ success: false });
  }
});

/* DELETE BOOKING */
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /bookings/:id error:", err);
    res.status(500).json({ success: false });
  }
});

/* USER BOOKINGS */
router.get("/user/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("GET /bookings/user/:id error:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
