import axios from 'axios';
import { auth } from './firebase';
import { beginRequest } from './requestLoading';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
});

api.interceptors.request.use(async config => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  const adapter = axios.getAdapter(config.adapter || api.defaults.adapter, config);
  config.adapter = async requestConfig => {
    const finish = beginRequest();
    try { return await adapter(requestConfig); }
    finally { finish(); }
  };
  return config;
});

export default api;
