import { useMemo, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'


const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
]

function BookAppointment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const doctor = state?.doctor

  const [form, setForm] = useState({ date: '', time_slot: '', notes: '' })
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedSummary = useMemo(() => {
    if (!form.date && !form.time_slot) return 'Select a date and a preferred slot to continue.'
    if (!form.date) return `Time selected: ${form.time_slot}`
    if (!form.time_slot) return `Date selected: ${form.date}`

    return `${form.date} | ${form.time_slot}`
  }, [form.date, form.time_slot])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!doctor?.id) {
      setError('Doctor details are missing. Please return to search and choose a doctor again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await axios.post(
        `${API_BASE_URL}/api/appointments`,
        {
          doctor_id: doctor.id,
          date: form.date,
          time_slot: form.time_slot,
          notes: form.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      setSuccess('Appointment booked successfully!')
      setTimeout(() => navigate('/patient/appointments'), 1800)
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed')
    } finally {
      setLoading(false)
    }
  }

  if (!doctor) {
    return (
      <div className="page">
        <div className="page-content" style={{ maxWidth: '980px' }}>
          <div style={{ background: '#FFFFFF', border: '1px solid var(--color-border)', borderRadius: '28px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
              Booking Flow
            </div>
            <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Doctor details not found</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, marginBottom: '20px', maxWidth: '620px' }}>
              This page needs a selected doctor from the search page. Go back, choose a doctor, and continue with booking.
            </p>
            <Link to="/patient/search" style={{ textDecoration: 'none' }}>
              <button className="btn-primary">Return to Doctor Search</button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

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
      <div className="page-content" style={{ maxWidth: '1240px' }}>
        <div className="fade-up" style={{ marginBottom: '24px' }}>
          <Link
            to="/patient/search"
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
            Back to Search
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '18px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                Appointment Booking
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Reserve your consultation
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, maxWidth: '720px' }}>
                Choose a consultation slot, review the doctor profile, and confirm your visit in a more focused patient booking flow.
              </p>
            </div>

            <div style={{ background: 'var(--color-primary-ghost)', color: 'var(--color-primary)', borderRadius: '999px', padding: '10px 16px', fontSize: '13px', fontWeight: 800 }}>
              MediNova Booking
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1.15fr', gap: '24px' }} className="booking-shell">
          <aside className="fade-up-1" style={{ display: 'grid', gap: '18px', alignContent: 'start' }}>
            <div style={{ background: 'linear-gradient(180deg, #0B5D54 0%, #0D7469 55%, #12897A 100%)', color: '#FFFFFF', borderRadius: '30px', padding: '24px', boxShadow: '0 22px 44px rgba(0, 105, 92, 0.18)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: '-40px', top: '-40px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.10)' }} />
              <div style={{ position: 'relative' }}>
                <div style={{ width: '66px', height: '66px', borderRadius: '22px', background: 'rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center', fontSize: '18px', fontWeight: 800, marginBottom: '18px' }}>
                  DR
                </div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', color: '#FFFFFF', marginBottom: '4px' }}>
                  {doctor.name}
                </h2>
                <div style={{ color: 'rgba(255,255,255,0.84)', fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>
                  {doctor.specialization}
                </div>

                <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72, marginBottom: '4px' }}>Location</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.7 }}>{doctor.location || 'Location not provided'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72, marginBottom: '4px' }}>Experience</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.7 }}>{doctor.experience ? `${doctor.experience} years` : 'Not provided'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72, marginBottom: '4px' }}>About</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.7 }}>{doctor.bio || 'Doctor profile details are not available yet.'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', paddingTop: '18px', borderTop: '1px solid rgba(255,255,255,0.14)' }}>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.72 }}>Consultation fee</div>
                    <div style={{ fontSize: '30px', fontWeight: 800 }}>Rs {doctor.fees ?? '--'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.14)', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 800 }}>
                    Available
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                Booking Snapshot
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
                {doctor.specialization}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>
                {selectedSummary}
              </div>
              <div style={{ background: '#F6FBFA', borderRadius: '18px', padding: '14px', border: '1px solid rgba(0, 105, 92, 0.08)', color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.7 }}>
                Best practice: choose your slot first, then add a short reason for the visit so the consultation starts faster.
              </div>
            </div>
          </aside>

          <section className="fade-up-2">
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '30px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
              {success && (
                <div style={{ background: '#E8F8F3', color: '#1F7A5D', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #BCE6D7', fontWeight: 700 }}>
                  {success}
                </div>
              )}

              {error && (
                <div style={{ background: '#FFF1F0', color: '#C0392B', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #F1C9C6', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', marginBottom: '22px' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', marginBottom: '6px' }}>Choose your slot</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                    Select a date, pick a time, and add optional visit notes for the doctor.
                  </p>
                </div>

                <div style={{ background: '#F5FBFA', borderRadius: '18px', padding: '14px 16px', minWidth: '220px', border: '1px solid rgba(0, 105, 92, 0.08)' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>
                    Selected Appointment
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '2px' }}>
                    {form.time_slot || 'No slot selected'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {form.date || 'Choose a date'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Appointment Date
                  </label>
                  <input
                    className="input"
                    type="date"
                    value={form.date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                    style={{ height: '52px', borderRadius: '16px' }}
                  />
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Available Time Slots
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }} className="booking-slot-grid">
                    {timeSlots.map((slot) => {
                      const active = form.time_slot === slot

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setForm({ ...form, time_slot: slot })}
                          style={{
                            padding: '14px 10px',
                            borderRadius: '18px',
                            border: `1.5px solid ${active ? 'var(--color-primary)' : 'rgba(0, 105, 92, 0.12)'}`,
                            background: active ? 'linear-gradient(135deg, #E5F6F2 0%, #D5EFE8 100%)' : '#FFFFFF',
                            color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontSize: '13px',
                            fontWeight: 700,
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            boxShadow: active ? '0 10px 24px rgba(0, 105, 92, 0.10)' : 'none',
                          }}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Symptoms or Visit Notes
                  </label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="Describe your symptoms, concerns, or the purpose of this visit..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    style={{ resize: 'vertical', borderRadius: '18px' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" type="submit" style={{ minWidth: '240px', padding: '15px 22px', fontSize: '15px', borderRadius: '16px' }} disabled={loading || !form.date || !form.time_slot}>
                    {loading ? 'Booking...' : 'Confirm Appointment'}
                  </button>
                  <Link to="/patient/search" style={{ textDecoration: 'none' }}>
                    <button type="button" className="btn-outline" style={{ padding: '15px 22px', fontSize: '15px', borderRadius: '16px' }}>
                      Cancel
                    </button>
                  </Link>
                </div>
              </form>
            </div>
          </section>
        </div>

        <style>
          {`
            @media (max-width: 1080px) {
              .booking-shell {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 760px) {
              .booking-slot-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
              }
            }

            @media (max-width: 520px) {
              .booking-slot-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  )
}

export default BookAppointment
