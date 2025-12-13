// backend/routes/bookings.js
import express from "express";
import multer from "multer";
import Booking from "../models/Booking.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({ storage });

const clean = (body) => {
  const out = {};
  for (const k in body) {
    out[k] = Array.isArray(body[k]) ? body[k][0] : body[k];
  }
  return out;
};

router.get("/", async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json({ success: true, bookings });
});

router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
  ]),
  async (req, res) => {
    req.body = clean(req.body);

    const booking = new Booking({
      ...req.body,
      floor: Number(req.body.floor),
      room: Number(req.body.room),
      bed: Number(req.body.bed),
      amountPaid: Number(req.body.amountPaid) || 0,
      photo: req.files?.photo?.[0]
        ? `uploads/${req.files.photo[0].filename}`
        : "",
      aadharFile: req.files?.aadharFile?.[0]
        ? `uploads/${req.files.aadharFile[0].filename}`
        : "",
    });

    const saved = await booking.save();
    res.json({ success: true, booking: saved });
  }
);

router.put("/:id", async (req, res) => {
  const updated = await Booking.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json({ success: true, updated });
});

router.delete("/:id", async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

router.get("/user/:id", async (req, res) => {
  const bookings = await Booking.find({ userId: req.params.id });
  res.json({ success: true, bookings });
});

export default router;
