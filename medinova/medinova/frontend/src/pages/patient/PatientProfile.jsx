import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'


function PatientProfile() {
  const token = localStorage.getItem('token')
  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setForm({
      name: storedUser.name || '',
      email: storedUser.email || '',
      phone: storedUser.phone || '',
    })
  }, [storedUser.email, storedUser.name, storedUser.phone])

  const profileCompletion = useMemo(() => {
    let score = 35
    if (form.name) score += 25
    if (form.email) score += 20
    if (form.phone) score += 20
    return score
  }, [form.email, form.name, form.phone])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMsg('')
    setError('')

    try {
      await axios.put(
        `${API_BASE_URL}/api/auth/profile`,
        { name: form.name, phone: form.phone },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const updatedUser = { ...storedUser, name: form.name, phone: form.phone }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setMsg('Profile updated successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed')
    } finally {
      setLoading(false)
    }
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
                Patient Settings
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                My profile
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, maxWidth: '720px' }}>
                Update your profile details and keep your patient account ready for faster bookings and smoother follow-up care.
              </p>
            </div>

            <Link to="/patient/appointments" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                View Appointments
              </button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '340px minmax(0, 1fr)', gap: '24px' }} className="patient-profile-grid">
          <aside className="fade-up-1" style={{ display: 'grid', gap: '18px', alignContent: 'start' }}>
            <div
              style={{
                background: 'linear-gradient(180deg, #0B5D54 0%, #0D7469 55%, #12897A 100%)',
                color: '#FFFFFF',
                borderRadius: '30px',
                padding: '24px',
                boxShadow: '0 22px 44px rgba(0, 105, 92, 0.18)',
              }}
            >
              <div style={{ width: '82px', height: '82px', borderRadius: '24px', background: 'rgba(255,255,255,0.14)', display: 'grid', placeItems: 'center', fontSize: '30px', fontWeight: 800, fontFamily: 'var(--font-heading)', marginBottom: '18px' }}>
                {form.name?.charAt(0)?.toUpperCase() || 'P'}
              </div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '4px' }}>{form.name || 'Patient'}</div>
              <div style={{ fontSize: '14px', opacity: 0.84, marginBottom: '18px' }}>{form.email || 'patient@email.com'}</div>
              <div style={{ background: 'rgba(255,255,255,0.12)', display: 'inline-flex', alignItems: 'center', borderRadius: '999px', padding: '8px 14px', fontSize: '12px', fontWeight: 800, textTransform: 'capitalize', marginBottom: '18px' }}>
                {storedUser.role || 'patient'}
              </div>

              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.76, marginBottom: '8px' }}>
                Profile completeness
              </div>
              <div style={{ height: '10px', borderRadius: '999px', background: 'rgba(255,255,255,0.16)', overflow: 'hidden', marginBottom: '8px' }}>
                <div style={{ width: `${profileCompletion}%`, height: '100%', background: 'linear-gradient(90deg, #BDEEE6 0%, #FFFFFF 100%)' }} />
              </div>
              <div style={{ fontSize: '13px', opacity: 0.86 }}>
                {profileCompletion}% ready for appointments, reminders, and records.
              </div>
            </div>

            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '24px', padding: '20px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                Account Notes
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.8 }}>
                Keep your contact details updated so booking confirmations and future patient tools stay accurate.
              </div>
            </div>
          </aside>

          <section className="fade-up-2">
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '30px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ marginBottom: '22px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', marginBottom: '6px' }}>Personal information</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
                  Adjust the details used across your patient account and booking flow.
                </p>
              </div>

              {msg && (
                <div style={{ background: '#E8F8F3', color: '#1F7A5D', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #BCE6D7', fontWeight: 700 }}>
                  {msg}
                </div>
              )}

              {error && (
                <div style={{ background: '#FFF1F0', color: '#C0392B', padding: '14px 18px', borderRadius: '16px', marginBottom: '20px', border: '1px solid #F1C9C6', fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }} className="patient-profile-form-grid">
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Full Name
                    </label>
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required style={{ height: '52px', borderRadius: '16px' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Phone
                    </label>
                    <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={{ height: '52px', borderRadius: '16px' }} />
                  </div>

                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      Email Address
                    </label>
                    <input className="input" value={form.email} readOnly style={{ background: '#F6FBFA', color: 'var(--color-text-muted)', height: '52px', borderRadius: '16px' }} />
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '6px' }}>
                      Email is locked for this account and cannot be changed here.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button className="btn-primary" type="submit" style={{ padding: '14px 28px', borderRadius: '16px' }} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                  <Link to="/patient/dashboard" style={{ textDecoration: 'none' }}>
                    <button type="button" className="btn-outline" style={{ padding: '14px 24px', borderRadius: '16px' }}>
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
            @media (max-width: 980px) {
              .patient-profile-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 700px) {
              .patient-profile-form-grid {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  )
}

export default PatientProfile
