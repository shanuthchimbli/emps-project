import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5500/api' });


API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});
export const fetchUsers = (token) =>
  API.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
export default API;
