import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const statusStyles = {
  pending:   { bg: '#FFF4E5', color: '#C77800', label: 'Pending' },
  confirmed: { bg: '#E8F8F3', color: '#0F8B7D', label: 'Confirmed' },
  completed: { bg: '#E8F7F5', color: '#0F766E', label: 'Completed' },
  rejected:  { bg: '#FDECEC', color: '#C0392B', label: 'Rejected' },
}

const sidebarItems = [
  { to: '/patient/dashboard',     code: 'DB', label: 'Dashboard' },
  { to: '/patient/profile',       code: 'PF', label: 'My Profile' },
  { to: '/patient/search',        code: 'FD', label: 'Find Doctors' },
  { to: '/patient/appointments',  code: 'AP', label: 'Appointments' },
  { to: '/patient/prescriptions', code: 'RX', label: 'Prescriptions' },
]

const actionCards = [
  { to: '/patient/search',        code: 'BK', title: 'Book Appointment',     desc: 'Search doctors and reserve a consultation slot.' },
  { to: '/patient/appointments',  code: 'TR', title: 'Track Visits',         desc: 'Review upcoming and completed consultations.' },
  { to: '/patient/prescriptions', code: 'PR', title: 'Prescription Records', desc: 'Open medicines and doctor instructions.' },
  { to: '/patient/reminders',     code: 'RM', title: 'Medicine Reminders',   desc: 'Manage daily reminders and follow-up care.' },
]

function parseAppointmentDateTime(appointment) {
  if (!appointment?.date) return null
  const candidate = new Date(`${String(appointment.date).trim()}T${String(appointment.time_slot || '00:00').trim()}`)
  return Number.isNaN(candidate.getTime()) ? null : candidate
}

function formatAppointmentMeta(appointment) {
  return [appointment.specialization, appointment.date, appointment.time_slot].filter(Boolean).join(' | ')
}

function countMedicineLines(text) {
  if (!text) return 0
  return text.split('\n').map((l) => l.trim()).filter(Boolean).length
}

function formatPrescriptionDate(value) {
  if (!value) return 'Recently added'
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Appointments Modal ─────────────────────────────────────── */
function AppointmentsModal({ appointments, loading, error, onRetry, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        background: 'rgba(10,60,54,0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#FFFFFF', borderRadius: '28px',
          width: '100%', maxWidth: '540px',
          maxHeight: '78vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 32px 64px rgba(0,80,70,0.22)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid rgba(0,105,92,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '4px' }}>Activity</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', margin: 0, color: 'var(--color-text-primary)' }}>Recent Appointments</h2>
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'rgba(0,105,92,0.08)', borderRadius: '12px', width: '36px', height: '36px', cursor: 'pointer', fontSize: '20px', color: 'var(--color-text-muted)', display: 'grid', placeItems: 'center', flexShrink: 0, lineHeight: 1 }}
          >×</button>
        </div>

        {/* Body */}
        <div style={{ overflowY: 'auto', padding: '18px 24px', flex: 1 }}>
          {loading ? (
            <div style={{ color: 'var(--color-text-muted)', padding: '20px 0', textAlign: 'center' }}>Loading appointments…</div>
          ) : error ? (
            <div style={{ borderRadius: '18px', padding: '16px', background: '#FFF6F5', border: '1px solid #F1C9C6' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#A93226', marginBottom: '6px' }}>Could not load appointments</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', lineHeight: 1.7, marginBottom: '12px' }}>{error}</div>
              <button className="btn-outline" onClick={onRetry}>Retry</button>
            </div>
          ) : appointments.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {appointments.map((appt) => {
                const status = statusStyles[appt.status] || statusStyles.pending
                return (
                  <div
                    key={appt.id}
                    style={{ borderRadius: '18px', border: '1px solid rgba(0,105,92,0.08)', padding: '14px 16px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '10px', alignItems: 'center', background: '#FBFEFD' }}
                  >
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '3px' }}>{appt.doctor_name}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{formatAppointmentMeta(appt)}</div>
                    </div>
                    <div style={{ background: status.bg, color: status.color, borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>{status.label}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ borderRadius: '18px', padding: '20px', background: '#F6FBFA', border: '1px solid rgba(0,105,92,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>No appointments yet</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7 }}>Book your first consultation to see it here.</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid rgba(0,105,92,0.08)', flexShrink: 0 }}>
          <Link to="/patient/appointments" style={{ textDecoration: 'none' }} onClick={onClose}>
            <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '14px' }}>View All Appointments</button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard ──────────────────────────────────────────────── */
function PatientDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const [appointments, setAppointments]     = useState([])
  const [prescriptions, setPrescriptions]   = useState([])
  const [loading, setLoading]               = useState(true)
  const [error, setError]                   = useState('')
  const [reloadKey, setReloadKey]           = useState(0)
  const [showApptModal, setShowApptModal]   = useState(false)

  useEffect(() => {
    let ignore = false
    async function fetchDashboardData() {
      if (!token) {
        setAppointments([]); setPrescriptions([])
        setError('Please sign in again to view your dashboard.')
        setLoading(false); return
      }
      setLoading(true); setError('')
      try {
        const headers = { Authorization: `Bearer ${token}` }
        const [aRes, pRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/appointments/my`, { headers }),
          axios.get(`${API_BASE_URL}/api/prescriptions/my`, { headers }),
        ])
        if (!ignore) {
          setAppointments(Array.isArray(aRes.data) ? aRes.data : [])
          setPrescriptions(Array.isArray(pRes.data) ? pRes.data : [])
        }
      } catch (err) {
        if (!ignore) {
          setAppointments([]); setPrescriptions([])
          setError(err.response?.data?.message || 'Unable to load your dashboard right now.')
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchDashboardData()
    return () => { ignore = true }
  }, [token, reloadKey])

  const dashboardData = useMemo(() => {
    const now = new Date()
    const nextAppointment = [...appointments]
      .sort((a, b) => {
        const at = parseAppointmentDateTime(a)?.getTime() ?? Number.MAX_SAFE_INTEGER
        const bt = parseAppointmentDateTime(b)?.getTime() ?? Number.MAX_SAFE_INTEGER
        return at - bt
      })
      .find((item) => {
        const d = parseAppointmentDateTime(item)
        return d && d >= now && ['pending', 'confirmed'].includes(item.status)
      })
    return {
      totalAppointments:     appointments.length,
      pendingAppointments:   appointments.filter((i) => i.status === 'pending').length,
      confirmedAppointments: appointments.filter((i) => i.status === 'confirmed').length,
      completedAppointments: appointments.filter((i) => i.status === 'completed').length,
      totalPrescriptions:    prescriptions.length,
      latestPrescription:    prescriptions[0] || null,
      nextAppointment:       nextAppointment || null,
      recentAppointments:    appointments.slice(0, 5),
    }
  }, [appointments, prescriptions])

  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const profileCompletion = user.name && user.email ? (user.phone ? 100 : 82) : 60

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
      {showApptModal && (
        <AppointmentsModal
          appointments={dashboardData.recentAppointments}
          loading={loading}
          error={error}
          onRetry={() => setReloadKey((v) => v + 1)}
          onClose={() => setShowApptModal(false)}
        />
      )}

      <div className="page-content" style={{ maxWidth: '1800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '290px minmax(0,1fr)', gap: '22px' }} className="patient-dashboard-layout">

          {/* ── Sidebar ── */}
          <aside
            className="fade-up"
            style={{
              background: 'linear-gradient(180deg,#0B5D54 0%,#0D7469 54%,#12897A 100%)',
              borderRadius: '30px', padding: '24px', color: '#FFFFFF',
              position: 'sticky', top: '88px', alignSelf: 'start',
              boxShadow: '0 22px 44px rgba(0,105,92,0.18)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '26px' }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', fontWeight: 800 }}>
                {user.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div>
                <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.78 }}>Patient Portal</div>
                <div style={{ fontSize: '21px', fontWeight: 800 }}>MediNova Care</div>
              </div>
            </div>

            <div style={{ padding: '30px', borderRadius: '22px', background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.12)', marginBottom: '18px' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{user.name || 'Patient'}</div>
              <div style={{ fontSize: '13px', opacity: 0.84, marginBottom: '12px' }}>{user.email || 'Patient account'}</div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.76, marginBottom: '8px' }}>Profile completion</div>
              <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.16)', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${profileCompletion}%`, height: '100%', background: 'linear-gradient(90deg,#BDEEE6 0%,#FFFFFF 100%)' }} />
              </div>
              <div style={{ fontSize: '13px', opacity: 0.86 }}>{profileCompletion}% ready for bookings and follow-ups.</div>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginBottom: '18px' }}>
              {sidebarItems.map((item) => (
                <Link
                  key={item.to} to={item.to}
                  style={{
                    textDecoration: 'none', color: '#FFFFFF',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '13px 14px', borderRadius: '16px',
                    background: item.to === '/patient/dashboard' ? 'rgba(255,255,255,0.15)' : 'transparent',
                    border:     item.to === '/patient/dashboard' ? '1px solid rgba(255,255,255,0.14)' : '1px solid transparent',
                  }}
                >
                  <span style={{ width: '28px', height: '28px', borderRadius: '10px', background: 'rgba(255,255,255,0.10)', display: 'grid', placeItems: 'center', fontSize: '11px', fontWeight: 800 }}>{item.code}</span>
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>{item.label}</span>
                </Link>
              ))}
            </div>

            <div style={{ padding: '16px', borderRadius: '20px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div style={{ fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.76, marginBottom: '8px' }}>Today&apos;s focus</div>
              <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '6px' }}>
                {dashboardData.nextAppointment ? 'Prepare for your next visit' : 'Keep your care records current'}
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.65, opacity: 0.86 }}>
                {dashboardData.nextAppointment
                  ? `Upcoming with ${dashboardData.nextAppointment.doctor_name}. Review your prescription before the consultation.`
                  : 'Update your profile, search doctors, and keep the patient flow ready for your next booking.'}
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main style={{ minWidth: 0 }}>

            {/* Hero */}
            <section className="fade-up-1" style={{ marginBottom: '18px' }}>
              <div style={{ background: 'linear-gradient(135deg,#E7F7F3 0%,#D8F0EA 58%,#CBEAE3 100%)', borderRadius: '30px', padding: '28px', border: '1px solid rgba(0,105,92,0.10)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) 310px', gap: '18px' }} className="patient-dashboard-hero">
                  <div>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '10px' }}>{greeting}</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '40px', lineHeight: 1.08, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                      Welcome back, {user.name || 'Patient'}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.85, maxWidth: '640px', marginBottom: '22px' }}>
                      Keep appointments, prescriptions, profile details, and follow-up care organized from one patient dashboard.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <Link to="/patient/search" style={{ textDecoration: 'none' }}>
                        <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>Book New Appointment</button>
                      </Link>
                      <Link to="/patient/profile" style={{ textDecoration: 'none' }}>
                        <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>Open My Profile</button>
                      </Link>
                    </div>
                  </div>

                  <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '20px', border: '1px solid rgba(0,105,92,0.10)', boxShadow: 'var(--shadow-card)' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>Next Appointment</div>
                    <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                      {dashboardData.nextAppointment ? dashboardData.nextAppointment.doctor_name : 'No upcoming appointment'}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
                      {dashboardData.nextAppointment
                        ? formatAppointmentMeta(dashboardData.nextAppointment)
                        : 'Your next consultation will appear here once you book a visit.'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '12px' }}>
                      <div style={{ background: 'var(--color-primary-ghost)', borderRadius: '18px', padding: '14px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '4px' }}>{dashboardData.pendingAppointments}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Pending</div>
                      </div>
                      <div style={{ background: '#F4FBF9', borderRadius: '18px', padding: '14px' }}>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '4px' }}>{dashboardData.totalPrescriptions}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Prescriptions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ── Stat strip — compact ── */}
            <section
              className="fade-up-2 patient-stat-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: '12px', marginBottom: '18px' }}
            >
              {[
                { title: 'Total',     value: dashboardData.totalAppointments,     note: 'All bookings' },
                { title: 'Confirmed', value: dashboardData.confirmedAppointments, note: 'Ready to attend' },
                { title: 'Completed', value: dashboardData.completedAppointments, note: 'Visits closed' },
                { title: 'Profile',   value: `${profileCompletion}%`,             note: 'Readiness' },
              ].map((stat) => (
                <div
                  key={stat.title}
                  style={{ background: '#FFFFFF', borderRadius: '18px', padding: '14px 16px', border: '1px solid rgba(0,105,92,0.08)', boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: '2px' }}
                >
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-text-muted)', fontWeight: 800 }}>{stat.title}</div>
                  <div style={{ fontSize: '26px', fontWeight: 800, lineHeight: 1.2, color: 'var(--color-primary)' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{stat.note}</div>
                </div>
              ))}
            </section>

            {/* ── Two-column content ── */}
            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) 400px', gap: '22px', alignItems: 'stretch' }} className="patient-main-grid">

              {/* Left: Quick Actions */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '28px', padding: '24px', boxShadow: 'var(--shadow-card)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '18px' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', marginBottom: '6px' }}>Quick Actions</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Shortcuts to the most-used patient features.</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(350px,1fr))', gap: '16px', flex: 1, alignItems: 'stretch' }}>
                    {actionCards.map((item) => (
                      <Link key={item.to} to={item.to} style={{ textDecoration: 'none', display: 'flex' }}>
                        <div
                          style={{ background: '#FBFEFD', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '24px', padding: '18px', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', flex: 1, display: 'flex', flexDirection: 'column' }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-hover)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                        >
                          <div style={{ width: '54px', height: '54px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '15px', fontWeight: 800, marginBottom: '18px', color: 'var(--color-primary)', flexShrink: 0 }}>{item.code}</div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>{item.title}</div>
                          <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, flex: 1 }}>{item.desc}</div>
                          <div style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 800, marginTop: '14px' }}>Open section</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                {/* ── Compact click-to-open appointments card ── */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setShowApptModal(true)}
                  onKeyDown={(e) => e.key === 'Enter' && setShowApptModal(true)}
                  style={{
                    background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)',
                    borderRadius: '22px', padding: '18px 20px',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                    transition: 'box-shadow 0.18s ease, transform 0.18s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  {/* Card header row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '3px' }}>Activity</div>
                      <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Recent Appointments</div>
                    </div>
                    <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', color: 'var(--color-primary)', fontSize: '20px', fontWeight: 400, flexShrink: 0, lineHeight: 1 }}>›</div>
                  </div>

                  {/* Preview rows (max 2) */}
                  {loading ? (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Loading…</div>
                  ) : dashboardData.recentAppointments.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {dashboardData.recentAppointments.slice(0, 2).map((appt) => {
                        const status = statusStyles[appt.status] || statusStyles.pending
                        return (
                          <div
                            key={appt.id}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '12px', background: '#F6FBFA', border: '1px solid rgba(0,105,92,0.06)' }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{appt.doctor_name}</div>
                              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{appt.date}</div>
                            </div>
                            <div style={{ background: status.bg, color: status.color, borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0 }}>{status.label}</div>
                          </div>
                        )
                      })}
                      {dashboardData.recentAppointments.length > 2 && (
                        <div style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: 700, textAlign: 'center', paddingTop: '4px' }}>
                          +{dashboardData.recentAppointments.length - 2} more — click to view all
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>No appointments yet. Click to book.</div>
                  )}
                </div>

                {/* Prescription Preview */}
                <div style={{ background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '28px', padding: '22px', boxShadow: 'var(--shadow-card)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>Prescription Preview</div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', marginBottom: '4px' }}>Latest record</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>Quick access to the most recent prescription.</p>
                  </div>

                  {dashboardData.latestPrescription ? (
                    <div style={{ background: '#F8FCFB', borderRadius: '22px', padding: '18px', border: '1px solid rgba(0,105,92,0.08)', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '17px', fontWeight: 800 }}>Dr. {dashboardData.latestPrescription.doctor_name}</div>
                          <div style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 700 }}>{dashboardData.latestPrescription.specialization}</div>
                        </div>
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '12px', fontWeight: 700 }}>{formatPrescriptionDate(dashboardData.latestPrescription.created_at)}</div>
                      </div>
                      <div style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>
                        {countMedicineLines(dashboardData.latestPrescription.medicines)} medicine line{countMedicineLines(dashboardData.latestPrescription.medicines) === 1 ? '' : 's'} recorded
                      </div>
                      <div style={{ background: '#FFFFFF', borderRadius: '16px', padding: '12px', color: 'var(--color-text-primary)', fontSize: '13px', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '14px', border: '1px solid rgba(0,105,92,0.06)', flex: 1, overflowY: 'auto' }}>
                        {dashboardData.latestPrescription.medicines}
                      </div>
                      <Link to="/patient/prescriptions" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                        <button className="btn-outline" style={{ width: '100%' }}>Open All Prescriptions</button>
                      </Link>
                    </div>
                  ) : (
                    <div style={{ background: '#F6FBFA', borderRadius: '22px', padding: '18px', border: '1px solid rgba(0,105,92,0.08)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '6px' }}>No prescriptions yet</div>
                      <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '14px' }}>Once a doctor writes a prescription it will appear here.</div>
                      <Link to="/patient/search" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 700 }}>Book a consultation</Link>
                    </div>
                  )}
                </div>

              </div>
            </section>
          </main>
        </div>

        <style>{`
          @media (max-width: 1100px) {
            .patient-dashboard-layout { grid-template-columns: 1fr !important; }
            .patient-dashboard-layout aside { position: static !important; }
            .patient-main-grid { grid-template-columns: 1fr !important; }
          }
          @media (max-width: 920px) {
            .patient-dashboard-hero,
            .patient-stat-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </div>
    </div>
  )
}

export default PatientDashboard