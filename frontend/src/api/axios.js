import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000', // your FastAPI backend URL
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token'); // or get from your auth provider
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
