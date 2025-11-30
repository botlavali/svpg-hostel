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

// Initialize Express
const app = express();

// ------------------------
// ✅ SECURE CORS SETUP
// ------------------------
const allowedOrigins = [
  "https://svpghostel.vercel.app",      // main frontend (users)
  "https://svpg-hostel.vercel.app",
 "https://svpg-hostel-sxi8-1efxcewec-botlavalis-projects.vercel.app"// admin frontend
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
// Serve uploads folder correctly for Render & local
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
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
