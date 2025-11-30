// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://svpg-hostel.onrender.com", 
});

export default api;
