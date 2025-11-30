import express from "express";
import multer from "multer";
import Booking from "../models/Booking.js";

const router = express.Router();

/* ----------------------------------------------------
   MULTER STORAGE
---------------------------------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

/* ----------------------------------------------------
   CLEAN BODY → FIX DUPLICATE FIELDS
---------------------------------------------------- */
function clean(body) {
  const fixed = {};
  Object.keys(body).forEach((key) => {
    const value = body[key];

    // If array → take first value
    if (Array.isArray(value)) fixed[key] = value[0];
    else fixed[key] = value;
  });
  return fixed;
}

/* ----------------------------------------------------
   GET ALL BOOKINGS
---------------------------------------------------- */
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (err) {
    console.error("GET BOOKINGS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ----------------------------------------------------
   CREATE BOOKING
---------------------------------------------------- */
router.post(
  "/",
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadharFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      // FIX FORM DUPLICATION FROM FRONTEND
      req.body = clean(req.body);

      const {
        name,
        phone,
        altPhone,
        email,
        aadharNumber,
        joinDate,
        floor,
        room,
        bed,
        userId,
        amountPaid,
      } = req.body;

      // VALIDATION
      if (!name || !phone || !email || !aadharNumber || !joinDate || !floor || !room || !bed) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const booking = new Booking({
        name,
        phone,
        altPhone,
        email,
        aadharNumber,
        joinDate,

        floor: Number(floor),
        room: Number(room),
        bed: Number(bed),

        userId: userId || "admin",

        amountPaid: Number(amountPaid) || 0,

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
      console.error("CREATE BOOKING ERROR:", err);
      res.status(500).json({
        success: false,
        message: "Server error",
        error: err.message,
      });
    }
  }
);

/* ----------------------------------------------------
   AVAILABLE BEDS
---------------------------------------------------- */
router.get("/available", async (req, res) => {
  try {
    const { floor, room } = req.query;

    if (!floor || !room)
      return res.status(400).json({
        success: false,
        message: "Missing floor or room",
      });

    const structure = {
      1: [2, 2, 3, 3, 2, 2],
      2: [2, 2, 3, 3, 2, 2],
      3: [2, 2, 3, 3, 2, 2],
      4: [2, 2, 3, 3, 2, 2],
      5: [2, 2, 3, 3, 2, 2],
      6: [2, 2, 3, 3],
    };

    const bedsInRoom = structure[floor]?.[room - 1];

    if (!bedsInRoom)
      return res.status(400).json({
        success: false,
        message: "Invalid floor/room",
      });

    const booked = await Booking.find({ floor, room }).select("bed");

    const allBeds = Array.from({ length: bedsInRoom }, (_, i) => i + 1);
    const bookedBeds = booked.map((b) => b.bed);

    const available = allBeds.filter((b) => !bookedBeds.includes(b));

    res.json({ success: true, available });
  } catch (err) {
    console.error("AVAILABLE ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ----------------------------------------------------
   SHIFT BED
---------------------------------------------------- */
router.post("/shift", async (req, res) => {
  try {
    const { bookingId, toFloor, toRoom, toBed } = req.body;

    if (!bookingId || !toFloor || !toRoom || !toBed)
      return res.status(400).json({
        success: false,
        message: "Missing fields",
      });

    const exists = await Booking.findOne({
      floor: Number(toFloor),
      room: Number(toRoom),
      bed: Number(toBed),
    });

    if (exists)
      return res.status(400).json({
        success: false,
        message: "Bed already booked",
      });

    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      {
        floor: Number(toFloor),
        room: Number(toRoom),
        bed: Number(toBed),
      },
      { new: true }
    );

    res.json({ success: true, updated });
  } catch (err) {
    console.error("SHIFT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
});

/* ----------------------------------------------------
   DELETE BOOKING
---------------------------------------------------- */
router.delete("/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
