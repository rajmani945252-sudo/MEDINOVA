const STORAGE_KEY = 'medinova-active-video-call'
const EVENT_NAME = 'medinova-video-call-updated'

function hasWindow() {
  return typeof window !== 'undefined'
}

function notify(session) {
  if (!hasWindow()) return
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: session }))
}

export function getActiveVideoCall() {
  if (!hasWindow()) return null

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw)
    return session?.status === 'active' ? session : null
  } catch {
    window.localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

export function startVideoCallSession(call) {
  if (!hasWindow()) return null

  const session = {
    appointmentId: String(call.appointmentId),
    doctorName: call.doctorName || 'Doctor',
    patientName: call.patientName || 'Patient',
    patientId: call.patientId || null,
    reason: call.reason || 'General consultation',
    date: call.date || '',
    timeSlot: call.timeSlot || '',
    startedAt: new Date().toISOString(),
    status: 'active',
    participants: {
      doctorJoined: true,
      patientJoined: Boolean(call.patientJoined),
    },
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  notify(session)
  return session
}

export function joinVideoCallSession(appointmentId) {
  const current = getActiveVideoCall()

  if (!current || String(current.appointmentId) !== String(appointmentId)) {
    return null
  }

  const next = {
    ...current,
    participants: {
      ...current.participants,
      patientJoined: true,
    },
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  notify(next)
  return next
}

export function leaveVideoCallRole(role) {
  const current = getActiveVideoCall()
  if (!current) return null

  const nextParticipants = {
    ...current.participants,
    doctorJoined: role === 'doctor' ? false : current.participants.doctorJoined,
    patientJoined: role === 'patient' ? false : current.participants.patientJoined,
  }

  if (!nextParticipants.doctorJoined && !nextParticipants.patientJoined) {
    clearVideoCallSession()
    return null
  }

  const next = {
    ...current,
    participants: nextParticipants,
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  notify(next)
  return next
}

export function clearVideoCallSession() {
  if (!hasWindow()) return
  window.localStorage.removeItem(STORAGE_KEY)
  notify(null)
}

export function isAppointmentCallActive(appointmentId) {
  const current = getActiveVideoCall()
  return Boolean(current && String(current.appointmentId) === String(appointmentId))
}

export function subscribeToVideoCallSession(listener) {
  if (!hasWindow()) return () => {}

  const handleStorage = (event) => {
    if (event.key === STORAGE_KEY) {
      listener(getActiveVideoCall())
    }
  }

  const handleCustomEvent = (event) => {
    listener(event.detail ?? getActiveVideoCall())
  }

  window.addEventListener('storage', handleStorage)
  window.addEventListener(EVENT_NAME, handleCustomEvent)

  return () => {
    window.removeEventListener('storage', handleStorage)
    window.removeEventListener(EVENT_NAME, handleCustomEvent)
  }
}
