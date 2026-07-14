import axios from 'axios';

const defaultBackendUrl = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : 'https://house-etech-project.vercel.app';

const baseURL = process.env.NEXT_PUBLIC_API_URL || defaultBackendUrl;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
