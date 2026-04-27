import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { EMOJI, SYMBOL } from '@/utils/ui'


const TIME_SLOTS = [
  { key: 'time_morning',   label: 'Morning',   emoji: EMOJI.sunrise, time: '8:00 AM',  bg: '#FFFBEB', color: '#B45309', pill: '#FDE68A' },
  { key: 'time_afternoon', label: 'Afternoon', emoji: EMOJI.sun,     time: '2:00 PM',  bg: '#FFF7ED', color: '#C2410C', pill: '#FED7AA' },
  { key: 'time_night',     label: 'Night',     emoji: EMOJI.moon,    time: '9:00 PM',  bg: '#EEF2FF', color: '#4338CA', pill: '#C7D2FE' },
]

const EMPTY_FORM = { medicine: '', time_morning: false, time_afternoon: false, time_night: false, notes: '' }

function getActiveTimes(r) {
  return TIME_SLOTS.filter(s => r[s.key])
}

export default function MedicineReminders() {
  const token = localStorage.getItem('token')
  const h     = { headers: { Authorization: `Bearer ${token}` } }

  const [reminders, setReminders] = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [form,      setForm]      = useState(EMPTY_FORM)
  const [msg,       setMsg]       = useState('')
  const [deleting,  setDeleting]  = useState(null)
  const [loading,   setLoading]   = useState(true)

  const fetchReminders = () => {
    setLoading(true)
    axios.get(`${API_BASE_URL}/api/smart/reminders`, h)
      .then(r => setReminders(Array.isArray(r.data) ? r.data : []))
      .catch(() => setReminders([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReminders() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/api/smart/reminders`, form, h)
      setMsg('Reminder added successfully!')
      setShowForm(false)
      setForm(EMPTY_FORM)
      fetchReminders()
      setTimeout(() => setMsg(''), 3500)
    } catch {}
  }

  const handleDelete = async (id) => {
    setDeleting(id)
    try {
      await axios.delete(`${API_BASE_URL}/api/smart/reminders/${id}`, h)
      fetchReminders()
    } catch {}
    finally { setDeleting(null) }
  }

  const canSubmit = form.medicine.trim() && (form.time_morning || form.time_afternoon || form.time_night)

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
        minHeight: '100vh',
      }}
    >
      <div className="page-content" style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* Back link */}
        <Link
          to="/patient/dashboard"
          className="fade-up"
          style={{
            color: 'var(--color-primary)', fontSize: '13px', textDecoration: 'none',
            fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '5px',
            marginBottom: '24px', opacity: 0.8,
          }}
        >
          {SYMBOL.arrowLeft} Back to Dashboard
        </Link>

        {/* Hero header */}
        <div
          className="fade-up"
          style={{
            background: 'linear-gradient(135deg,#E7F7F3 0%,#D8F0EA 58%,#CBEAE3 100%)',
            borderRadius: '30px', padding: '32px 36px',
            border: '1px solid rgba(0,105,92,0.10)',
            boxShadow: 'var(--shadow-card)',
            marginBottom: '20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: '20px',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.09em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '10px' }}>
              Medicine Management
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', lineHeight: 1.08, color: 'var(--color-text-primary)', marginBottom: '10px' }}>
              Medicine Reminders
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.75, maxWidth: '480px' }}>
              Set morning, afternoon, and night reminders for your medicines. Stay consistent with your treatment.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '16px 24px', border: '1px solid rgba(0,105,92,0.10)', textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontSize: '34px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>
                {loading ? SYMBOL.emDash : reminders.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700, marginTop: '4px' }}>Active</div>
            </div>
            <button
              className="btn-primary"
              onClick={() => { setShowForm(v => !v); setForm(EMPTY_FORM) }}
              style={{ padding: '12px 22px', borderRadius: '16px', fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {showForm ? `${SYMBOL.cross} Cancel` : '+ Add Reminder'}
            </button>
          </div>
        </div>

        {/* Stats strip */}
        <div
          className="fade-up-1"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '22px' }}
        >
          {TIME_SLOTS.map(slot => {
            const count = reminders.filter(r => r[slot.key]).length
            return (
              <div
                key={slot.key}
                style={{
                  background: '#FFFFFF', borderRadius: '20px', padding: '16px 18px',
                  border: '1px solid rgba(0,105,92,0.08)', boxShadow: 'var(--shadow-sm)',
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '16px', background: slot.bg, display: 'grid', placeItems: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {slot.emoji}
                </div>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1 }}>{count}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 700, marginTop: '3px' }}>{slot.label}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Success toast */}
        {msg && (
          <div
            className="fade-up"
            style={{
              background: '#E6F7F3', color: '#0F6E56',
              padding: '13px 18px', borderRadius: '14px', marginBottom: '18px',
              border: '1px solid rgba(15,110,86,0.18)', fontWeight: 700,
              fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px',
            }}
          >
            {SYMBOL.check} {msg}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div
            className="fade-up"
            style={{
              background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)',
              borderRadius: '28px', padding: '30px',
              marginBottom: '22px', boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '26px' }}>
              <div style={{ width: '50px', height: '50px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '24px' }}>{EMOJI.medicine}</div>
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '3px' }}>New Entry</div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--color-text-primary)' }}>Add Medicine Reminder</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Medicine Name *
                </label>
                <input
                  className="input"
                  placeholder="e.g. Paracetamol 500mg"
                  value={form.medicine}
                  onChange={e => setForm({ ...form, medicine: e.target.value })}
                  required
                  style={{ borderRadius: '14px', fontSize: '15px' }}
                />
              </div>

              {/* Time picker */}
              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  When to take?
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {TIME_SLOTS.map(slot => {
                    const active = form[slot.key]
                    return (
                      <div
                        key={slot.key}
                        onClick={() => setForm({ ...form, [slot.key]: !active })}
                        style={{
                          padding: '20px 14px', borderRadius: '20px', textAlign: 'center',
                          border: `2px solid ${active ? 'var(--color-primary)' : 'rgba(0,105,92,0.12)'}`,
                          background: active ? 'var(--color-primary-ghost)' : '#FBFEFD',
                          cursor: 'pointer', transition: 'all 0.18s ease', userSelect: 'none',
                          boxShadow: active ? '0 6px 20px rgba(0,105,92,0.13)' : 'var(--shadow-sm)',
                        }}
                      >
                        <div style={{ fontSize: '30px', marginBottom: '8px' }}>{slot.emoji}</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: active ? 'var(--color-primary)' : 'var(--color-text-primary)', marginBottom: '4px' }}>{slot.label}</div>
                        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{slot.time}</div>
                        {active && (
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-primary)', display: 'grid', placeItems: 'center', margin: '10px auto 0', color: '#fff', fontSize: '11px', fontWeight: 800 }}>{SYMBOL.check}</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '26px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Notes (optional)
                </label>
                <input
                  className="input"
                  placeholder="e.g. Take after meals, avoid dairy"
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  style={{ borderRadius: '14px', fontSize: '15px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={!canSubmit}
                  style={{ padding: '13px 28px', borderRadius: '16px', fontSize: '14px', opacity: canSubmit ? 1 : 0.5 }}
                >
                  Save Reminder
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM) }}
                  style={{ padding: '13px 22px', borderRadius: '16px', background: '#FFFFFF', fontSize: '14px' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Empty state */}
        {!loading && reminders.length === 0 && !showForm && (
          <div
            className="fade-up-2"
            style={{
              background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)',
              borderRadius: '28px', padding: '72px 40px',
              boxShadow: 'var(--shadow-card)', textAlign: 'center',
            }}
          >
            <div style={{ width: '90px', height: '90px', borderRadius: '30px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '42px', margin: '0 auto 22px' }}>{EMOJI.medicine}</div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '26px', color: 'var(--color-text-primary)', marginBottom: '10px' }}>No reminders yet</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.75, maxWidth: '380px', margin: '0 auto 28px' }}>
              Add medicine reminders to stay on top of your treatment plan every day.
            </p>
            <button
              className="btn-primary"
              onClick={() => setShowForm(true)}
              style={{ padding: '14px 30px', borderRadius: '16px', fontSize: '14px' }}
            >
              + Add Your First Reminder
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[0.6, 0.75, 0.9].map((op, i) => (
              <div
                key={i}
                style={{ background: '#FFFFFF', borderRadius: '24px', height: '100px', border: '1px solid rgba(0,105,92,0.06)', opacity: op }}
              />
            ))}
          </div>
        )}

        {/* Reminders list */}
        {!loading && reminders.length > 0 && (
          <div className="fade-up-2">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'var(--color-text-primary)' }}>Your Reminders</h2>
              <span style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 700 }}>{reminders.length} active</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reminders.map((r) => {
                const activeTimes = getActiveTimes(r)
                return (
                  <div
                    key={r.id}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid rgba(0,105,92,0.08)',
                      borderRadius: '22px',
                      padding: '20px 24px',
                      boxShadow: 'var(--shadow-sm)',
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto',
                      gap: '18px',
                      alignItems: 'center',
                    }}
                  >
                    {/* Icon */}
                    <div style={{ width: '54px', height: '54px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '26px', flexShrink: 0 }}>
                      {EMOJI.medicine}
                    </div>

                    {/* Content */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '17px', color: 'var(--color-text-primary)', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.medicine}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: r.notes ? '8px' : 0 }}>
                        {activeTimes.map(slot => (
                          <span
                            key={slot.key}
                            style={{
                              background: slot.bg, color: slot.color,
                              border: `1px solid ${slot.pill}`,
                              padding: '5px 13px', borderRadius: '999px',
                              fontSize: '12px', fontWeight: 700,
                              display: 'inline-flex', alignItems: 'center', gap: '5px',
                            }}
                          >
                            {slot.emoji} {slot.label} {SYMBOL.bullet} {slot.time}
                          </span>
                        ))}
                      </div>
                      {r.notes && (
                        <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>{EMOJI.memo}</span> {r.notes}
                        </div>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deleting === r.id}
                      style={{
                        background: deleting === r.id ? '#F5F5F5' : '#FFF0F0',
                        color: '#C0392B',
                        border: '1px solid rgba(192,57,43,0.15)',
                        borderRadius: '14px', padding: '10px 18px',
                        fontSize: '13px', fontWeight: 700,
                        cursor: deleting === r.id ? 'default' : 'pointer',
                        flexShrink: 0, transition: 'all 0.15s ease',
                        opacity: deleting === r.id ? 0.55 : 1, whiteSpace: 'nowrap',
                      }}
                    >
                      {deleting === r.id ? `Removing${SYMBOL.ellipsis}` : 'Remove'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
