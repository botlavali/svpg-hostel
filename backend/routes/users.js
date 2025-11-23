// routes/users.js
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, name, email, phone, password } = req.body;
    if (!password || (!email && !phone)) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = email ? await User.findOne({ email }) : null;
    if (exists) return res.status(400).json({ message: "User already exists" });

    const user = new User({ username, name, email, phone, password });
    await user.save();

    // return user object (omit password)
    const safeUser = { _id: user._id, name: user.name, username: user.username, email: user.email, phone: user.phone, role: user.role };

    res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Missing email or password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    // Optionally create JWT (not required by frontend but included)
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || "devsecret", { expiresIn: "7d" });

    const safeUser = { _id: user._id, name: user.name, username: user.username, email: user.email, phone: user.phone, role: user.role };

    res.json({ success: true, user: safeUser, token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
