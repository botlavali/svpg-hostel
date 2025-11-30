// admin-panel/services/authService.js
import axios from "axios";

const API_URL = "https://svpg-hostel.onrender.com/admin";

export const login = async (email, password) => {
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });
    if (res.data.success) {
      // save token + admin user object (backend must return { success, token, admin })
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.admin || null));
      return { success: true };
    }
    return { success: false, message: res.data.message };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Login failed" };
  }
};

export const logout = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};
