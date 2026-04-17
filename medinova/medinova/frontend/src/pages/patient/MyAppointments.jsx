import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { getActiveVideoCall, subscribeToVideoCallSession } from '../../utils/videoCallSession'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const filters = ['all', 'pending', 'confirmed', 'completed', 'rejected']

const statusStyles = {
  pending: { bg: '#FFF4E5', color: '#C77800', label: 'Pending' },
  confirmed: { bg: '#E8F8F3', color: '#0F8B7D', label: 'Confirmed' },
  completed: { bg: '#E8F7F5', color: '#0F766E', label: 'Completed' },
  rejected: { bg: '#FDECEC', color: '#C0392B', label: 'Rejected' },
}

function parseAppointmentDateTime(appointment) {
  if (!appointment?.date) return null

  const candidate = new Date(`${String(appointment.date).trim()}T${String(appointment.time_slot || '00:00').trim()}`)
  return Number.isNaN(candidate.getTime()) ? null : candidate
}

function MyAppointments() {
  const token = localStorage.getItem('token')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [activeCallSession, setActiveCallSession] = useState(getActiveVideoCall())

  useEffect(() => {
    let ignore = false

    async function fetchAppointments() {
      setLoading(true)
      setError('')

      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!ignore) {
          setAppointments(Array.isArray(res.data) ? res.data : [])
        }
      } catch (err) {
        if (!ignore) {
          setAppointments([])
          setError(err.response?.data?.message || 'Unable to load your appointments right now.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchAppointments()

    return () => {
      ignore = true
    }
  }, [token, reloadKey])

  useEffect(() => subscribeToVideoCallSession(setActiveCallSession), [])

  const appointmentData = useMemo(() => {
    const now = new Date()
    const filteredAppointments = filter === 'all'
      ? appointments
      : appointments.filter((appointment) => appointment.status === filter)

    const upcomingCount = appointments.filter((appointment) => {
      const appointmentDate = parseAppointmentDateTime(appointment)
      return appointmentDate && appointmentDate >= now && ['pending', 'confirmed'].includes(appointment.status)
    }).length

    return {
      filteredAppointments,
      total: appointments.length,
      pending: appointments.filter((appointment) => appointment.status === 'pending').length,
      confirmed: appointments.filter((appointment) => appointment.status === 'confirmed').length,
      completed: appointments.filter((appointment) => appointment.status === 'completed').length,
      upcoming: upcomingCount,
    }
  }, [appointments, filter])

  const summaryCards = [
    { title: 'Total Appointments', value: appointmentData.total, note: 'All booked visits', bg: '#F5FBFA' },
    { title: 'Upcoming', value: appointmentData.upcoming, note: 'Pending or confirmed', bg: '#F1FCF8' },
    { title: 'Confirmed', value: appointmentData.confirmed, note: 'Ready to attend', bg: '#F4FBF9' },
    { title: 'Completed', value: appointmentData.completed, note: 'Visits finished', bg: '#EEF9F7' },
  ]

  return (
   <div
  className="page"
  style={{
    background: `
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='rgba(15,118,110,0.06)' stroke-width='8' stroke-linecap='round'%3E%3Ccircle cx='110' cy='110' r='30'/%3E%3Cpath d='M110 84v52'/%3E%3Cpath d='M84 110h52'/%3E%3C/g%3E%3C/svg%3E"),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='none' stroke='rgba(20,184,166,0.05)' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='82' y='106' width='76' height='28' rx='14'/%3E%3Cpath d='M120 106v28'/%3E%3C/g%3E%3C/svg%3E"),
      radial-gradient(circle at top left, rgba(20,184,166,0.10), transparent 20%),
      radial-gradient(circle at bottom right, rgba(56,189,248,0.10), transparent 18%),
      linear-gradient(135deg, #F7FFFE 0%, #EEF9F6 52%, #F4FBFF 100%)
    `,
    backgroundSize: '220px 220px, 250px 250px, auto, auto, auto',
    backgroundPosition: '0 0, 120px 120px, left top, right bottom, center',
  }}
>
      <div className="page-content" style={{ maxWidth: '1220px' }}>
        <div className="fade-up" style={{ marginBottom: '24px' }}>
          <Link
            to="/patient/dashboard"
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '13px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
            }}
          >
            Back to Dashboard
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                Patient Appointments
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                My appointments
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, maxWidth: '720px' }}>
                Track all your consultations in one place, monitor appointment status, and stay organized with a cleaner patient view.
              </p>
            </div>

            <Link to="/patient/search" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Book New Appointment
              </button>
            </Link>
          </div>
        </div>

        <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '22px' }}>
          {summaryCards.map((card) => (
            <div
              key={card.title}
              style={{
                background: card.bg,
                borderRadius: '24px',
                padding: '20px',
                border: '1px solid rgba(0, 105, 92, 0.08)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 800, marginBottom: '10px' }}>{card.title}</div>
              <div style={{ fontSize: '34px', lineHeight: 1, fontWeight: 800, color: 'var(--color-primary)', marginBottom: '8px' }}>{card.value}</div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{card.note}</div>
            </div>
          ))}
        </div>

        <div className="fade-up-2" style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '28px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '6px' }}>Appointment activity</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                Filter your bookings by status and review each consultation with doctor details.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {filters.map((item) => {
                const active = filter === item
                const count = item === 'all' ? appointments.length : appointments.filter((appointment) => appointment.status === item).length

                return (
                  <button
                    key={item}
                    onClick={() => setFilter(item)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '999px',
                      border: `1.5px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                      background: active ? 'var(--color-primary)' : '#FFFFFF',
                      color: active ? '#FFFFFF' : 'var(--color-text-muted)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-main)',
                      transition: 'var(--transition)',
                      textTransform: 'capitalize',
                    }}
                  >
                    {item} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '56px', color: 'var(--color-text-muted)' }}>
              Loading appointments...
            </div>
          ) : error ? (
            <div style={{ borderRadius: '22px', padding: '18px', background: '#FFF6F5', border: '1px solid #F1C9C6' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#A93226', marginBottom: '6px' }}>Could not load appointments</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>{error}</div>
              <button className="btn-outline" onClick={() => setReloadKey((value) => value + 1)}>Retry</button>
            </div>
          ) : appointmentData.filteredAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 24px', background: '#F6FBFA', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '24px' }}>
              <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '10px' }}>
                No results
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '8px' }}>
                {appointments.length === 0 ? 'No appointments yet' : `No ${filter} appointments`}
              </h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '22px', fontSize: '14px', lineHeight: 1.7 }}>
                {appointments.length === 0
                  ? 'Book your first appointment with a doctor to start tracking your consultation history.'
                  : 'Try another filter or create a new appointment to keep your care plan moving.'}
              </p>
              <Link to="/patient/search" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">Find Doctors</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {appointmentData.filteredAppointments.map((appointment) => {
                const status = statusStyles[appointment.status] || statusStyles.pending
                const callReady = appointment.status === 'confirmed' && String(activeCallSession?.appointmentId || '') === String(appointment.id)

                return (
                  <div
                    key={appointment.id}
                    style={{
                      background: '#FBFEFD',
                      border: '1px solid rgba(0, 105, 92, 0.08)',
                      borderRadius: '24px',
                      padding: '22px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      gap: '16px',
                      alignItems: 'center',
                      transition: 'var(--transition)',
                    }}
                    className="patient-appointment-card"
                    onMouseEnter={(event) => {
                      event.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                      event.currentTarget.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                      event.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>
                        DR
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                          {appointment.doctor_name}
                        </div>
                        <div style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>
                          {appointment.specialization}
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: appointment.notes ? '8px' : '0' }}>
                          <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            {appointment.date}
                          </span>
                          <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            {appointment.time_slot}
                          </span>
                          <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            Rs {appointment.fees}
                          </span>
                        </div>

                        {appointment.notes && (
                          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                            {appointment.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '10px', justifyItems: 'start' }}>
                      <div
                        style={{
                          background: status.bg,
                          color: status.color,
                          borderRadius: '999px',
                          padding: '9px 14px',
                          fontSize: '12px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {status.label}
                      </div>

                      {callReady ? (
                        <Link to={`/patient/video-consultation/${appointment.id}`} state={{ appointment }} style={{ textDecoration: 'none' }}>
                          <button className="btn-primary" style={{ borderRadius: '14px', padding: '11px 16px' }}>
                            Join Call
                          </button>
                        </Link>
                      ) : appointment.status === 'confirmed' ? (
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                          Waiting for doctor to start the call
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <style>
          {`
            @media (max-width: 720px) {
              .patient-appointment-card {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  )
}

export default MyAppointments
