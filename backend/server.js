import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Fix dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();   // ✅ app MUST be defined BEFORE app.use()

// CORS FIX FOR VERCEL FRONTEND
app.use(
  cors({
    origin: [
      "https://svpghostel.vercel.app",
      "http://localhost:3000",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);

app.options("*", cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "routes/uploads")));

// your routes...
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log("Server running");
    });
  })
  .catch(err => console.log(err));
