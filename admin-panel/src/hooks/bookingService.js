import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function getToken() {
    return localStorage.getItem('authToken');
}

function authHeaders() {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function listBookings({ page = 1, limit = 20, filter = {} } = {}) {
    const params = { page, limit, ...filter };
    const resp = await axios.get(`${API_BASE}/bookings`, {
        params,
        headers: { ...authHeaders() },
    });
    return resp.data;
}

export async function getBooking(bookingId) {
    const resp = await axios.get(`${API_BASE}/bookings/${bookingId}`, {
        headers: { ...authHeaders() },
    });
    return resp.data;
}

export async function createBooking(payload) {
    // payload: { userId, roomId, startDate, endDate, guests, meta }
    const resp = await axios.post(`${API_BASE}/bookings`, payload, {
        headers: { ...authHeaders() },
    });
    return resp.data;
}

export async function updateBooking(bookingId, updates) {
    const resp = await axios.put(`${API_BASE}/bookings/${bookingId}`, updates, {
        headers: { ...authHeaders() },
    });
    return resp.data;
}

export async function cancelBooking(bookingId) {
    const resp = await axios.post(`${API_BASE}/bookings/${bookingId}/cancel`, null, {
        headers: { ...authHeaders() },
    });
    return resp.data;
}

// convenience wrapper when using axios instance from useAuth
export function bookingServiceFromAxios(axiosInstance) {
    return {
        listBookings: (opts) => axiosInstance.get('/bookings', { params: { ...(opts || {}) } }).then(r => r.data),
        getBooking: (id) => axiosInstance.get(`/bookings/${id}`).then(r => r.data),
        createBooking: (payload) => axiosInstance.post('/bookings', payload).then(r => r.data),
        updateBooking: (id, updates) => axiosInstance.put(`/bookings/${id}`, updates).then(r => r.data),
        cancelBooking: (id) => axiosInstance.post(`/bookings/${id}/cancel`).then(r => r.data),
    };
}