import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            if (window.location.pathname.startsWith('/connect') && window.location.pathname !== '/connect') {
                window.location.href = '/connect';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (username, password, name) => api.post('/auth/register', { username, password, name }),
    getMe: () => api.get('/auth/me'),
};

// Mosque Identity API
export const mosqueAPI = {
    getIdentity: () => api.get('/mosque/identity'),
    updateIdentity: (data) => api.put('/mosque/identity', data),
};

// Prayer Times API
export const prayerAPI = {
    getTimes: (date) => api.get('/prayer-times', { params: { date } }),
    getMonthly: (month, year) => api.get('/prayer-times/monthly', { params: { month, year } }),
};

// Settings API
export const settingsAPI = {
    getPrayer: () => api.get('/settings/prayer'),
    updatePrayer: (data) => api.put('/settings/prayer', data),
    getLayout: () => api.get('/settings/layout'),
    updateLayout: (data) => api.put('/settings/layout', data),
};

// Content API
export const contentAPI = {
    getAll: (activeOnly = false) => api.get('/content', { params: { active_only: activeOnly } }),
    create: (data) => api.post('/content', data),
    update: (id, data) => api.put(`/content/${id}`, data),
    delete: (id) => api.delete(`/content/${id}`),
};

// Agenda API
export const agendaAPI = {
    getAll: (activeOnly = false, upcomingOnly = false) => 
        api.get('/agenda', { params: { active_only: activeOnly, upcoming_only: upcomingOnly } }),
    create: (data) => api.post('/agenda', data),
    update: (id, data) => api.put(`/agenda/${id}`, data),
    delete: (id) => api.delete(`/agenda/${id}`),
};

// Running Text API
export const runningTextAPI = {
    getAll: (activeOnly = false) => api.get('/running-text', { params: { active_only: activeOnly } }),
    create: (data) => api.post('/running-text', data),
    update: (id, data) => api.put(`/running-text/${id}`, data),
    delete: (id) => api.delete(`/running-text/${id}`),
};

// Upload API
export const uploadAPI = {
    upload: (file) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
};

// Stats API
export const statsAPI = {
    get: () => api.get('/stats'),
};

export default api;
