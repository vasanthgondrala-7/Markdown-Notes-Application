// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Response interceptor — log errors clearly
api.interceptors.response.use(
  res => res,
  err => {
    const url    = err.config?.url || '';
    const status = err.response?.status || 'Network Error';
    console.error(`API ${status} → ${url}`, err.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ── Notes ────────────────────────────────────────
export const getNotes = (params = {}) =>
  api.get('/notes', { params }).then(r => r.data);

export const getNote = (id) =>
  api.get(`/notes/${id}`).then(r => r.data.data);

export const createNote = (data) =>
  api.post('/notes', data).then(r => r.data.data);

export const updateNote = (id, data) =>
  api.put(`/notes/${id}`, data).then(r => r.data.data);

export const deleteNote = (id) =>
  api.delete(`/notes/${id}`).then(r => r.data);

// ── Versions ─────────────────────────────────────
export const getVersions = (id) =>
  api.get(`/notes/${id}/versions`).then(r => r.data.data);

export const restoreVersion = (noteId, versionId) =>
  api.post(`/notes/${noteId}/restore/${versionId}`).then(r => r.data);

export default api;
