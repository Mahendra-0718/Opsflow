import axios from 'axios';

const API = axios.create({
  baseURL: 'https://opsflow-ta2a.onrender.com',
});

// Automatically attach JWT Token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
