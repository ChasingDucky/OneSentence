import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token 过期或无效
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// 消息相关
export const messageAPI = {
  create: (data) => api.post('/messages', data),
  getToday: () => api.get('/messages/today'),
  getHistory: (limit = 30) => api.get(`/messages/history?limit=${limit}`),
  getById: (id) => api.get(`/messages/${id}`),
};

// 反应相关
export const reactionAPI = {
  add: (msgId, reactionType) => api.post(`/reactions/${msgId}`, { reactionType }),
  remove: (msgId) => api.delete(`/reactions/${msgId}`),
  addFavorite: (msgId) => api.post(`/reactions/favorites/${msgId}`),
  removeFavorite: (msgId) => api.delete(`/reactions/favorites/${msgId}`),
  getFavorites: () => api.get('/reactions/favorites'),
};

// 举报相关
export const reportAPI = {
  create: (msgId, reason) => api.post(`/reports/${msgId}`, { reason }),
};

// 管理员相关
export const adminAPI = {
  runPairing: () => api.post('/admin/pairing/run'),
  getStats: () => api.get('/admin/stats'),
};

export default api;
