// frontend/src/utils/photoUrl.js
const BACKEND_BASE = process.env.REACT_APP_API_URL || "https://svpg-backend.onrender.com";

export default function photoUrl(p) {
  if (!p) return "";
  let clean = p.replace(/\\/g, "/");
  clean = clean.replace(/^\.?\/*/, "");
  if (!clean.startsWith("uploads")) clean = "uploads/" + clean;
  return `${BACKEND_BASE}/${clean}`;
}
