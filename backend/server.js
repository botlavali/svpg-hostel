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

/* ---------------- CORS ---------------- */
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
      return cb(new Error("CORS blocked"));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ---------------- STATIC UPLOADS (FIX) ---------------- */
const UPLOADS_DIR = path.join(__dirname, "uploads");

app.use(
  "/uploads",
  express.static(UPLOADS_DIR, {
    fallthrough: false,
    maxAge: "1d",
  })
);

/* ---------------- ROUTES ---------------- */
import userRoutes from "./routes/users.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import adminRoutes from "./routes/admin.js";

app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({ success: true, msg: "SV PG Backend Running" });
});

/* ---------------- DB ---------------- */
const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

mongoose
  .connect(MONGO)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () =>
      console.log(`Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
