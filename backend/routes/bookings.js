// routes/bookings.js
import express from "express";
import multer from "multer";
import Booking from "../models/Booking.js";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`)
});
const upload = multer({ storage });

// room structure (same as frontend)
const ROOM_STRUCTURE = {
  1: [2,2,3,3,2,2],
  2: [2,2,3,3,2,2],
  3: [2,2,3,3,2,2],
  4: [2,2,3,3,2,2],
  5: [2,2,3,3,2,2],
  6: [2,2,3,3]
};

// GET all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create booking (multipart)
router.post("/", upload.fields([{ name: "photo", maxCount: 1 }, { name: "aadharFile", maxCount: 1 }]), async (req, res) => {
  try {
    const {
      name, phone, altPhone, email, aadharNumber, joinDate, floor, room, bed, userId, amountPaid
    } = req.body;

    if (!name || !phone || !joinDate || !floor || !room || !bed) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // ensure seat isn't double-booked
    const exists = await Booking.findOne({ floor, room, bed });
    if (exists) return res.status(400).json({ message: "Bed already booked" });

    const photo = req.files?.photo?.[0]?.path || "";
    const aadharFile = req.files?.aadharFile?.[0]?.path || "";

    const booking = new Booking({
      userId,
      name, phone, altPhone, email, aadharNumber,
      joinDate, floor, room: Number(room), bed: Number(bed),
      amountPaid: Number(amountPaid) || 0,
      photo, aadharFile
    });

    await booking.save();
    res.json({ success: true, booking });
  } catch (err) {
    console.error("CREATE BOOKING ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get available beds for a floor/room
router.get("/available", async (req, res) => {
  try {
    const { floor, room } = req.query;
    if (!floor || !room) return res.status(400).json({ success: false, message: "Missing floor or room" });

    const bookings = await Booking.find({ floor, room }).select("bed");
    const bedsInRoom = ROOM_STRUCTURE[floor]?.[room - 1];
    if (!bedsInRoom) return res.status(400).json({ success: false, message: "Invalid floor/room" });

    const allBeds = Array.from({ length: bedsInRoom }, (_, i) => i + 1);
    const bookedBeds = bookings.map(b => b.bed);
    const available = allBeds.filter(b => !bookedBeds.includes(b));
    res.json({ success: true, available });
  } catch (err) {
    console.error("AVAILABLE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Shift booking
router.post("/shift", async (req, res) => {
  try {
    const { bookingId, toFloor, toRoom, toBed } = req.body;
    if (!bookingId || !toFloor || !toRoom || !toBed) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    // check target free
    const exists = await Booking.findOne({ floor: toFloor, room: toRoom, bed: toBed });
    if (exists) return res.status(400).json({ success: false, message: "Bed already booked" });

    const updated = await Booking.findByIdAndUpdate(bookingId, { floor: toFloor, room: toRoom, bed: toBed }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Booking not found" });

    res.json({ success: true, message: "Shifted successfully", updated });
  } catch (err) {
    console.error("SHIFT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update booking details
router.put("/:id", async (req, res) => {
  try {
    const allowed = ["name", "phone", "altPhone", "email"];
    const updates = {};
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const updated = await Booking.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("UPDATE BOOKING ERROR:", err);
    res.status(500).json({ success: false });
  }
});

// Delete
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE BOOKING ERROR:", err);
    res.status(500).json({ success: false });
  }
});

export default router;
