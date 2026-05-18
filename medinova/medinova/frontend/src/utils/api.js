import axios from 'axios'

function trimTrailingSlash(value) {
  return String(value || '').replace(/\/+$/, '')
}

const LOCAL_API_URL = 'http://localhost:5000'
const PRODUCTION_API_URL = 'https://medinova-production.up.railway.app'
const configuredApiUrl = trimTrailingSlash(import.meta.env.VITE_API_URL)
const BASE_URL = configuredApiUrl || (import.meta.env.DEV ? LOCAL_API_URL : PRODUCTION_API_URL)

export { BASE_URL }
export const API_BASE_URL = BASE_URL

export function buildApiUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return BASE_URL ? `${BASE_URL}${normalizedPath}` : normalizedPath
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
