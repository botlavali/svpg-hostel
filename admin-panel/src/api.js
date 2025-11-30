// frontend/src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://37ptgzfs-5000.inc1.devtunnels.ms/", 
});

export default api;
