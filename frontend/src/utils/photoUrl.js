// frontend/src/utils/photoUrl.js
const BACKEND_BASE =
  process.env.REACT_APP_API_URL || "https://svpg-backend.onrender.com";

/**
 * Normalize image paths from DB
 * Works for:
 * - "uploads/file.jpg"
 * - "routes/uploads/file.jpg"
 * - "file.jpg"
 * - full http URL
 */
export default function photoUrl(p) {
  if (!p) return "";

  // If already full URL → return as-is
  if (p.startsWith("http://") || p.startsWith("https://")) return p;

  let clean = String(p).replace(/\\/g, "/").trim();

  // remove leading ./ or / 
  clean = clean.replace(/^\.?\/*/, "");

  // normalize "routes/uploads/" → "uploads/"
  clean = clean.replace(/^routes\/uploads\//, "uploads/");

  // If no folder prefix → add "uploads/"
  if (!clean.startsWith("uploads/")) {
    clean = `uploads/${clean}`;
  }

  return `${BACKEND_BASE}/${clean}`;
}
