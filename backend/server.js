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

// Simple CORS (adapt allowed origins as needed)
const allowedOrigins = [
  "https://svpg-hostel.onrender.com",
  "https://svpg-hostel-sxi8.vercel.app/",
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.warn("Blocked CORS origin:", origin);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// Serve uploads from multiple possible locations (robust)
const uploads1 = path.join(__dirname, "uploads");
const uploads2 = path.join(__dirname, "routes", "uploads");
console.log("📁 Static uploads candidate 1:", uploads1);
console.log("📁 Static uploads candidate 2:", uploads2);

// Serve whichever exists (but serve both — harmless if empty)
app.use("/uploads", express.static(uploads1));
app.use("/uploads", express.static(uploads2));

// Routes (adjust import paths if needed)
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

// Healthcheck
app.get("/", (req, res) => {
  res.json({ success: true, message: "SV PG Backend Running" });
});

// Connect DB and start
const MONGO = process.env.MONGO_URL || process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!MONGO) {
      console.error("❌ MONGO connection string not set (MONGO_URL or MONGO_URI).");
      process.exit(1);
    }

    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO, { serverSelectionTimeoutMS: 15000 });
    console.log("📦 MongoDB Connected ✔");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB connect error:", err);
    setTimeout(start, 5000);
  }
}
start();

// audit: update 2025-12-12T04:33:49Z
