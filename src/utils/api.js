import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const api = axios.create({
  baseURL: `${API_BASE}/api`,
})

export const authHeaders = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
  },
})

export default api
