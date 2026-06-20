import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'https://talon-clash.onrender.com'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const adminLogin = (username, password) =>
  API.post('/api/admin/login', { username, password });

export const getStats = () => API.get('/api/admin/stats');

export const getPlayers = (search, page) =>
  API.get(`/api/admin/players?search=${search || ''}&page=${page || 1}`);

export const banPlayer = (telegram_id, reason, banned) =>
  API.post('/api/admin/players/ban', { telegram_id, reason, banned });

export const setPlayerCredits = (telegram_id, stars) =>
  API.post('/api/admin/players/credits', { telegram_id, stars });

export const getStoreItems = () => API.get('/api/admin/store');

export const saveStoreItem = (item) => API.post('/api/admin/store/item', item);

export const deleteStoreItem = (id) => API.delete(`/api/admin/store/item/${id}`);

export const getQuests = () => API.get('/api/admin/quests');

export const saveQuest = (quest) => API.post('/api/admin/quests/quest', quest);

export const getAnnouncements = () => API.get('/api/admin/announcements');

export const createAnnouncement = (data) => API.post('/api/admin/announcements', data);

export const getConfig = () => API.get('/api/admin/config');

export const updateConfig = (key, value) =>
  API.post('/api/admin/config', { key, value });

export const getEvolutions = () => API.get('/api/admin/evolutions');

export const updateEvolution = (data) => API.post('/api/admin/evolutions', data);
