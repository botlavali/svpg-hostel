import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",   // NO /api
});

export default api;
