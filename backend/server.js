// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS (keep your allowedOrigins)
const allowedOrigins = [
  "https://svpghostel.vercel.app",
  "https://svpg-hostel.vercel.app",
  "https://svpg-hostel-sxi8.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.log("❌ CORS Blocked:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ------------------------
// STATIC FILES (only uploads)
// ------------------------
const UPLOADS_DIR = path.join(__dirname, "uploads");
console.log("📁 Serving static uploads from:", UPLOADS_DIR);

// serve /uploads
app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    maxAge: "1d",
    index: false,
    fallthrough: true,
  })
);

// Helpful JSON 404 for missing files under /uploads
app.get("/uploads/:file", (req, res) => {
  // If express.static served the file, this handler will not run.
  res.status(404).json({
    success: false,
    message: "Upload not found",
    file: req.params.file,
  });
});

// Import your routes AFTER static middleware (so uploads can be served)
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => res.json({ success: true, msg: "SV PG Backend Running" }));

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI || process.env.MONGO_URL;

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("📦 MongoDB Connected ✔");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });
