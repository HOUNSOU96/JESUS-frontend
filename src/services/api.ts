import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // adapte selon ton backend
});

export default api;
