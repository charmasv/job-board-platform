import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const jobsAPI = {
  getAll: () => api.get('/jobs'),
  getById: (id: number) => api.get(`/jobs/${id}`),
  create: (jobData: any) => api.post('/jobs', jobData),
  update: (id: number, jobData: any) => api.put(`/jobs/${id}`, jobData),
  delete: (id: number) => api.delete(`/jobs/${id}`),
};