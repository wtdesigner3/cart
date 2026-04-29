import axios from 'axios'

const API_BASE = 'import.meta.env.VITE_API_URL'
const api = axios.create({
  baseURL: API_BASE,
})

export const authHeaders = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
  },
})

export default api
