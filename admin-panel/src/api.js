import axios from "axios";

const api = axios.create({
  baseURL: "https://mohansvpg-backend.onrender.com", // Render backend URL
  withCredentials: true,
});

export default api;
