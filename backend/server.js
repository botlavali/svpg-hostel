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
   CORS — Allow Frontend Access
---------------------------------------------------- */
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

/* ----------------------------------------------------
   BODY PARSERS
---------------------------------------------------- */
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

/* ----------------------------------------------------
   STATIC UPLOAD DIRECTORY — FINAL FIX
   Multer saves files inside:
   backend/routes/uploads/
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
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URL);

    console.log("📦 MongoDB Connected ✔");

    app.listen(PORT, () =>
      console.log(`🚀 Server running → http://localhost:${PORT}`)
    );
  } catch (err) {
    console.error("❌ MongoDB Error:", err.message);
    console.log("Retrying in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
}

connectDB();
