import axios from 'axios'

const API_BASE = 'http://localhost:5000/api'
const api = axios.create({
  baseURL: API_BASE,
})

export const authHeaders = (token) => ({
  headers: {
    Authorization: token ? `Bearer ${token}` : undefined,
  },
})

export default api
