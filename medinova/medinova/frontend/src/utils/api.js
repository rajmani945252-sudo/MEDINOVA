import axios from 'axios'

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL)
const fallbackBaseUrl = import.meta.env.DEV
  ? 'http://localhost:5000'
  : typeof window !== 'undefined'
    ? trimTrailingSlash(window.location.origin)
    : ''

export const API_BASE_URL = configuredBaseUrl || fallbackBaseUrl

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

export function authHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export const api = axios.create({
  baseURL: API_BASE_URL || undefined,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api
