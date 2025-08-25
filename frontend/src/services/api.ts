import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export const jobsAPI = {
  getAll: () => api.get('/api/jobs'),
  getById: (id: number) => api.get(`/api/jobs/${id}`),
  create: (jobData: any) => api.post('/api/jobs', jobData),
  update: (id: number, jobData: any) => api.put(`/api/jobs/${id}`, jobData),
  delete: (id: number) => api.delete(`/api/jobs/${id}`),
};