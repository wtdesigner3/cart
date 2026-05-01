import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 10000,
})

export const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http')) {
    // If it's already an absolute URL, check if it's localhost and replace with API base
    if (url.includes('localhost:5000')) {
      return url.replace('http://localhost:5000', API_BASE)
    }
    return url // Keep other absolute URLs as-is
  }
  // Prepend API base to relative URLs
  return `${API_BASE}${url}`
}

export const authHeaders = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
  },
})

export default api
