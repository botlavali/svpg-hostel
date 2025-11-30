// backend/server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import Routes
import usersRouter from "./routes/users.js";
import bookingsRouter from "./routes/bookings.js";
import paymentsRouter from "./routes/payments.js";
import adminRouter from "./routes/admin.js";

const app = express();

/* ----------------------------------------------------
   SECURITY (Helmet relaxed for SPA)
---------------------------------------------------- */
app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

/* ----------------------------------------------------
   CORS — FIXED (NO SYNTAX ERRORS)
   IMPORTANT: Do not use trailing slash!
---------------------------------------------------- */
app.use(
  cors({
    origin: [
      "https://svpghostel.vercel.app",  // your frontend domain
      "http://localhost:3000"           // for local development
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

/* ----------------------------------------------------
   BODY PARSERS
---------------------------------------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ----------------------------------------------------
   STATIC UPLOAD DIRECTORY — FINAL WORKING CONFIG
---------------------------------------------------- */
const uploadPath = path.join(__dirname, "routes/uploads");
console.log("📁 Serving uploads from:", uploadPath);

app.use("/uploads", express.static(uploadPath));

/* ----------------------------------------------------
   API ROUTES
---------------------------------------------------- */
app.use("/users", usersRouter);
app.use("/bookings", bookingsRouter);
app.use("/payments", paymentsRouter);
app.use("/admin", adminRouter);

/* ----------------------------------------------------
   HEALTH CHECK
---------------------------------------------------- */
app.get("/", (req, res) => {
  res.json({ success: true, message: "SV PG Backend Running" });
});

/* ----------------------------------------------------
   MONGODB CONNECTION
---------------------------------------------------- */
/* ----------------------------------------------------
   MONGODB CONNECTION  ⭐ FIXED ⭐
---------------------------------------------------- */
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

async function connectDB() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    console.log("🔗 URL:", MONGO_URL);

    await mongoose.connect(MONGO_URL, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("📦 MongoDB Connected ✔");

    app.listen(PORT, () =>
      console.log(`🚀 Server running → http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB CONNECTION ERROR:", err);  // FULL ERROR
    console.log("⏳ Retrying in 5 sec...");
    setTimeout(connectDB, 5000);
  }
}
connectDB();

