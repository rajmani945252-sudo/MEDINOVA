const TOKEN_STORAGE_KEY = 'token'
const USER_STORAGE_KEY = 'user'

function hasWindow() {
  return typeof window !== 'undefined'
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function getStoredToken() {
  if (!hasWindow()) {
    return ''
  }

  return window.localStorage.getItem(TOKEN_STORAGE_KEY) || ''
}

export function getStoredUser() {
  if (!hasWindow()) {
    return {}
  }

  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY)

  if (!rawUser) {
    return {}
  }

  try {
    const parsedUser = JSON.parse(rawUser)
    return isPlainObject(parsedUser) ? parsedUser : {}
  } catch {
    return {}
  }
}

export function saveSession(token, user) {
  if (!hasWindow()) {
    return
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, String(token || ''))
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user || {}))
}

export function updateStoredUser(nextUser) {
  if (!hasWindow()) {
    return
  }

  const currentUser = getStoredUser()
  window.localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify({ ...currentUser, ...(isPlainObject(nextUser) ? nextUser : {}) })
  )
}

export function clearSession() {
  if (!hasWindow()) {
    return
  }

  window.localStorage.removeItem(TOKEN_STORAGE_KEY)
  window.localStorage.removeItem(USER_STORAGE_KEY)
}

export function sanitizeStoredSession() {
  if (!hasWindow()) {
    return
  }

  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY)

  if (!rawUser) {
    return
  }

  try {
    const parsedUser = JSON.parse(rawUser)

    if (!isPlainObject(parsedUser)) {
      clearSession()
    }
  } catch {
    clearSession()
  }
}
