// backend/routes/bookings.js
import express from "express";
import multer from "multer";
import Booking from "../models/Booking.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

/* -------------------------
   Paths / __dirname fix
   ------------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Save uploads into backend/uploads (one level up from routes)
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

// Ensure folder exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("📁 Created upload folder:", UPLOAD_DIR);
}

/* -------------------------
   Multer storage
   ------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${ts}-${safe}`);
  },
});

/* Optional: add file filter / limits if you want
   e.g. fileFilter: (req, file, cb) => { ... }
   limits: { fileSize: 5 * 1024 * 1024 } // 5 MB
*/
const upload = multer({ storage });

/* -------------------------
   Helpers
   ------------------------- */
function clean(body) {
  const out = {};
  Object.keys(body || {}).forEach((k) => {
    out[k] = Array.isArray(body[k]) ? body[k][0] : body[k];
  });
  return out;
}

/* -------------------------
   Routes
   ------------------------- */

// GET all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("GET /bookings error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// CREATE booking (with files)
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // Clean duplicate-array values that sometimes appear from form-data
      req.body = clean(req.body);

      const booking = new Booking({
        ...req.body,
        floor: Number(req.body.floor),
        room: Number(req.body.room),
        bed: Number(req.body.bed),
        amountPaid: Number(req.body.amountPaid) || 0,

        // Save relative path (frontend will prefix backend base URL)
        photo: req.files?.photo?.[0]
          ? "uploads/" + path.basename(req.files.photo[0].path)
          : "",

        aadharFile: req.files?.aadharFile?.[0]
          ? "uploads/" + path.basename(req.files.aadharFile[0].path)
          : "",
      });

      const saved = await booking.save();
      res.json({ success: true, booking: saved });
    } catch (err) {
      console.error("POST /bookings error:", err);
      res.status(500).json({ success: false, message: "Upload/save failed" });
    }
  }
);

// UPDATE booking (shift or details)
router.put("/:id", async (req, res) => {
  try {
    const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, updated });
  } catch (err) {
    console.error("PUT /bookings/:id error:", err);
    res.status(500).json({ success: false, message: "Update failed" });
  }
});

// DELETE booking
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /bookings/:id error:", err);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
});

// GET bookings for a user
router.get("/user/:id", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("GET /bookings/user/:id error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
