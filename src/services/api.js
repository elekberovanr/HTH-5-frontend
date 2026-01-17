import axios from 'axios';

import { API_BASE_URL } from "../config/apiBase"; 

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});


export const getFavorites = async () => {
  const res = await API.get('/favorites');
  return res.data;
};

export const addFavorite = async (productId) => {
  const res = await API.post('/favorites', { productId });
  return res.data;
};

export const removeFavorite = async (productId) => {
  const res = await API.delete(`/favorites/${productId}`);
  return res.data;
};

export const fetchCategories = async () => {
  const res = await API.get('categories');
  return Array.isArray(res.data) ? res.data : res.data.categories || [];
};


export default API;
