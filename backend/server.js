import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsFolder = path.join(__dirname, "routes", "uploads");
console.log("📁 Serving static uploads from (uploadsFolder):", uploadsFolder);
// Initialize Express
const app = express();

// ------------------------
// ✅ SECURE CORS SETUP
// ------------------------
const allowedOrigins = [
  "https://svpghostel.vercel.app",   // main frontend (users)
  "https://svpg-hostel.vercel.app",
  "https://svpg-hostel-sxi8.vercel.app",
  "https://your-frontend-render-url.onrender.com",// admin frontend
  "http://localhost:3000",
  "http://localhost:3001"
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman, server-to-server
      if (allowedOrigins.includes(origin)) return callback(null, true);
      console.log("❌ CORS Blocked:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  })
);

// Preflight handler
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(200);
  }
  next();
});

// ------------------------
// Middleware
// ------------------------
app.use(express.json());

// ------------------------
// ✅ STATIC FILES (PHOTO FIX)
// ------------------------
app.use(
  "/uploads",
  express.static(path.join(__dirname, "routes", "uploads"))
);

// This will serve images like:
// https://svpg-backend.onrender.com/uploads/filename.jpg

// ------------------------
// Import Routes
// ------------------------
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);
app.use(
  "/uploads",
  express.static(uploadsFolder, {
    maxAge: "1d",
    fallthrough: true, // let next handler run if file missing
  })
);

// Helpful 404 JSON when file not found (useful for debugging)
app.get("/uploads/:file", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Upload not found on server",
    file: req.params.file,
    lookedAt: uploadsFolder,
  });
});
// ------------------------
// MongoDB + Start Server
// ------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("📦 MongoDB Connected ✔");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running → http://localhost:${port}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB error:", err));
