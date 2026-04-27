import axios from 'axios'

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

const BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_URL || 'http://localhost:5000')

export { BASE_URL }
export const API_BASE_URL = BASE_URL

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}${normalizedPath}`
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = axios.create({
  baseURL: BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
