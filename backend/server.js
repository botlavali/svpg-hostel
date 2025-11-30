import cors from "cors";

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
