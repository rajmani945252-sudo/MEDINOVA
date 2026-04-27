import axios from 'axios'

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

const DEFAULT_API_URL = import.meta.env.PROD
  ? 'https://medinova-production.up.railway.app'
  : 'http://localhost:5000'

const BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_URL || DEFAULT_API_URL)

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
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
