import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || ''}/api`,
});

// Auto-attach JWT token if present in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('pvpsit_user_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (localStorage.getItem('pvpsit_user_token')) {
        localStorage.removeItem('pvpsit_user_token');
        localStorage.removeItem('pvpsit_user_data');
      }
    }
    return Promise.reject(error);
  }
);

/* ================= Notice API Services ================= */

export const fetchNotices = async (params = {}) => {
  const response = await API.get('/notices', { params });
  return response.data;
};

export const fetchNoticeById = async (id) => {
  const response = await API.get(`/notices/${id}`);
  return response.data;
};

export const createNotice = async (noticeData) => {
  const response = await API.post('/notices', noticeData);
  return response.data;
};

export const updateNotice = async (id, noticeData) => {
  const response = await API.put(`/notices/${id}`, noticeData);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await API.delete(`/notices/${id}`);
  return response.data;
};

export const fetchNoticeStats = async () => {
  const response = await API.get('/notices/stats/summary');
  return response.data;
};

export const fetchCollegeConfig = async () => {
  const response = await API.get('/config');
  return response.data;
};

/* ================= Auth API Services ================= */

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await API.post('/auth/login', { email, password }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};

export const getUserProfile = async () => {
  const response = await API.get('/auth/profile');
  return response.data;
};

export default API;
