import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000", // adjust backend URL if different
});

export default api;
