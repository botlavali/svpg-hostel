import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    "https://svpg-backend.onrender.com", // ✅ CORRECT
});

export default api;
