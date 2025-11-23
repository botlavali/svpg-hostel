import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

function createAxiosWithToken(token) {
    const instance = axios.create({
        baseURL: API_BASE,
        headers: {
            'Content-Type': 'application/json',
        },
    });
    instance.interceptors.request.use(config => {
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    });
    return instance;
}

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('authToken'));
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('authUser');
        return raw ? JSON.parse(raw) : null;
    });
    const isAuthenticated = Boolean(token);

    useEffect(() => {
        if (token) localStorage.setItem('authToken', token);
        else localStorage.removeItem('authToken');
    }, [token]);

    useEffect(() => {
        if (user) localStorage.setItem('authUser', JSON.stringify(user));
        else localStorage.removeItem('authUser');
    }, [user]);

    const axiosAuth = useMemo(() => createAxiosWithToken(token), [token]);

    async function login({ email, password }) {
        const resp = await axios.post(`${API_BASE}/api/admin/login`, { email, password });
        const { token: t, user: u } = resp.data;
        setToken(t);
        setUser(u || null);
        return resp.data;
    }

    function logout() {
        setToken(null);
        setUser(null);
    }

    // optional: refresh user from server
    async function fetchProfile() {
        if (!token) return null;
        const resp = await axiosAuth.get('/api/admin/me');
        setUser(resp.data);
        return resp.data;
    }

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout, fetchProfile, axiosAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}