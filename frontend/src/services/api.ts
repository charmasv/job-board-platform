import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add response interceptor to handle data formatting
api.interceptors.response.use(
  (response) => {
    // If response data is a double array, extract the inner array
    if (Array.isArray(response.data) && response.data.length > 0 && Array.isArray(response.data[0])) {
      response.data = response.data[0];
    }
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Cannot connect to backend server.');
    }
    if (error.message.includes('Network Error')) {
      throw new Error('Network error. Please check backend connection.');
    }
    return Promise.reject(error);
  }
);

export const jobsAPI = {
  getAll: () => api.get('/api/jobs').then(response => {
    // Ensure we always return a proper array
    let data = response.data;
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      data = data[0];
    }
    return { ...response, data };
  }),
  getById: (id: number) => api.get(`/api/jobs/${id}`),
  create: (jobData: any) => api.post('/api/jobs', jobData),
  update: (id: number, jobData: any) => api.put(`/api/jobs/${id}`, jobData),
  delete: (id: number) => api.delete(`/api/jobs/${id}`),
};