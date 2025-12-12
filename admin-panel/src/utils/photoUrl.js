const BACKEND_BASE = process.env.REACT_APP_API_URL || "https://svpg-backend.onrender.com";

/**
 * Normalize stored path and return absolute URL to backend uploads.
 * Accepts values like:
 *   "uploads/xyz.jpg"   or  "xyz.jpg"   or  "routes\\uploads\\xyz.jpg"
 */
export default function photoUrl(p) {
  if (!p) return "";
  // normalize windows backslashes -> forward slashes
  let clean = String(p).replace(/\\/g, "/");
  // remove leading ./ or //
  clean = clean.replace(/^\.?\/*/, "");
  // ensure the path starts with uploads/
  if (!clean.startsWith("uploads")) {
    clean = `uploads/${clean}`;
  }
  // remove duplicate slashes just in case:
  clean = clean.replace(/\/+/g, "/");
  return `${BACKEND_BASE}/${clean}`;
}
