import { useMemo, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { Link, useNavigate } from 'react-router-dom'
import { EMOJI } from '@/utils/ui'


const roles = [
  { value: 'patient', icon: EMOJI.patient, label: 'Patient' },
  { value: 'doctor', icon: EMOJI.stethoscope, label: 'Doctor' },
  { value: 'store', icon: EMOJI.medicine, label: 'Medical Store' },
  { value: 'mr', icon: EMOJI.briefcase, label: 'Medicine Rep' },
  { value: 'admin', icon: EMOJI.admin, label: 'Admin' },
]

const initialForm = {
  name: '',
  email: '',
  phone: '',
  role: 'patient',
  password: '',
  confirmPassword: '',
}

function validateForm(form) {
  const errors = {}
  const name = form.name.trim()
  const email = form.email.trim()
  const phone = form.phone.trim()

  if (!name) {
    errors.name = 'Full name is required.'
  } else if (name.length < 3) {
    errors.name = 'Use at least 3 characters.'
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (phone && !/^\d{10,15}$/.test(phone)) {
    errors.phone = 'Phone must be 10 to 15 digits.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return errors
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const activeRole = useMemo(
    () => roles.find((role) => role.value === form.role),
    [form.role]
  )

  const passwordStrength = useMemo(() => {
    if (!form.password) return { label: 'Choose a password', color: 'var(--color-text-muted)' }
    if (form.password.length < 6) return { label: 'Weak', color: '#C62828' }
    if (form.password.length < 10) return { label: 'Good', color: '#0F766E' }
    return { label: 'Strong', color: '#2E7D32' }
  }, [form.password])

  const handleChange = (e) => {
    const nextForm = { ...form, [e.target.name]: e.target.value }
    setForm(nextForm)
    setErrors(validateForm(nextForm))
    setError('')
    setSuccess('')
  }

  const handleBlur = (e) => {
    setTouched((current) => ({ ...current, [e.target.name]: true }))
    setErrors(validateForm(form))
  }

  const handleRoleSelect = (role) => {
    const nextForm = { ...form, role }
    setForm(nextForm)
    setErrors(validateForm(nextForm))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm(form)
    setTouched({
      name: true,
      email: true,
      phone: true,
      password: true,
      confirmPassword: true,
    })
    setErrors(validationErrors)
    setError('')
    setSuccess('')

    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        password: form.password,
      })
      setSuccess('Account created successfully. Redirecting to login...')
      setForm(initialForm)
      setTouched({})
      setErrors({})
      setTimeout(() => navigate('/login'), 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : '')

  const inputStyle = (name) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: '16px',
    border: `1.5px solid ${fieldError(name) ? '#E53935' : 'rgba(15,118,110,0.14)'}`,
    background: 'rgba(255,255,255,0.95)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontSize: '14px',
    transition: 'var(--transition)',
    boxShadow: fieldError(name) ? '0 0 0 3px rgba(229,57,53,0.08)' : 'none',
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='rgba(15,118,110,0.07)' stroke-width='8' stroke-linecap='round'%3E%3Ccircle cx='110' cy='110' r='30'/%3E%3Cpath d='M110 84v52'/%3E%3Cpath d='M84 110h52'/%3E%3C/g%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='none' stroke='rgba(20,184,166,0.06)' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='82' y='106' width='76' height='28' rx='14'/%3E%3Cpath d='M120 106v28'/%3E%3C/g%3E%3C/svg%3E"),
          linear-gradient(135deg, #D9F4F0 0%, #E9FBF7 34%, #DDF3FF 100%)
        `,
        backgroundSize: '220px 220px, 250px 250px, auto',
        backgroundPosition: '0 0, 110px 130px, center',
        padding: '32px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        className="register-shell fade-up"
        style={{
          width: '100%',
          maxWidth: '1180px',
          background: 'rgba(255,255,255,0.74)',
          borderRadius: '36px',
          overflow: 'hidden',
          border: '1px solid rgba(15,118,110,0.1)',
          boxShadow: '0 28px 70px rgba(17, 65, 85, 0.14)',
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
        }}
      >
        <section
          className="register-info"
          style={{
            position: 'relative',
            background: 'linear-gradient(160deg, rgba(247,255,253,0.96) 0%, rgba(233,251,246,0.94) 42%, rgba(217,242,246,0.92) 100%)',
            padding: '54px 52px',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '36px', left: '34px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(15,118,110,0.1)' }} />
          <div style={{ position: 'absolute', right: '-90px', bottom: '-90px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(56,189,248,0.16)' }} />
          <div style={{ position: 'absolute', top: '-80px', right: '80px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(45,212,191,0.14)' }} />

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '34px' }}>
              <div
                style={{
                  width: '62px',
                  height: '62px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #0B6B61, #1BB7A2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 16px 30px rgba(11,107,97,0.24)',
                }}
              >
                <span style={{ color: 'white', fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>M</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', color: 'var(--color-text-primary)' }}>Medinova</div>
                <div style={{ color: '#5A7A77', fontSize: '14px' }}>Smart Healthcare Management System</div>
              </div>
            </div>

            <p style={{ color: '#0B6B61', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px', fontSize: '13px' }}>
              Healthcare Platform
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                lineHeight: 1.12,
                color: '#113B3A',
                marginBottom: '18px',
              }}
            >
              Your partner in digital healthcare and smarter care access
            </h1>
            <p style={{ color: '#4F6D73', fontSize: '17px', lineHeight: 1.85, maxWidth: '500px' }}>
              Medinova connects patients, doctors, medical stores, and medical representatives on one simple platform for appointments, records, medicines, and communication.
            </p>
          </div>

          <div
            style={{
              position: 'relative',
              zIndex: 1,
              marginTop: '48px',
              background: 'rgba(255,255,255,0.96)',
              borderRadius: '32px',
              boxShadow: '0 24px 54px rgba(31, 87, 102, 0.14)',
              overflow: 'hidden',
              padding: '30px',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: `
                  radial-gradient(circle at 18% 22%, rgba(15,118,110,0.12), transparent 18%),
                  radial-gradient(circle at 75% 20%, rgba(56,189,248,0.14), transparent 16%),
                  radial-gradient(circle at 56% 76%, rgba(45,212,191,0.12), transparent 20%),
                  linear-gradient(135deg, rgba(255,255,255,0.62), rgba(240,251,248,0.62))
                `,
              }}
            />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '430px', margin: '0 auto' }}>
              <div
                style={{
                  width: '260px',
                  margin: '0 auto 26px',
                  padding: '18px',
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, rgba(214,246,241,0.72) 0%, rgba(240,252,255,0.92) 100%)',
                  boxShadow: 'inset 0 0 0 10px rgba(255,255,255,0.5), 0 22px 44px rgba(22,113,122,0.1)',
                }}
              >
                <div
                  style={{
                    width: '200px',
                    height: '200px',
                    margin: '0 auto',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95), rgba(223,247,244,0.96))',
                    position: 'relative',
                    boxShadow: 'inset 0 0 0 10px rgba(255,255,255,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '78px',
                  }}
                >
                  <span style={{ filter: 'drop-shadow(0 10px 18px rgba(56,189,248,0.18))' }}>{EMOJI.stethoscope}</span>
                </div>
              </div>

              <div style={{ position: 'absolute', left: '10px', top: '154px', background: 'white', borderRadius: '16px', padding: '12px 14px', boxShadow: '0 12px 28px rgba(33,85,99,0.12)', textAlign: 'left', minWidth: '170px' }}>
                <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '12px' }}>Connect with doctors</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '2px' }}>Appointments and records in one place</div>
              </div>

              <div style={{ position: 'absolute', right: '10px', top: '34px', background: 'white', borderRadius: '16px', padding: '12px 14px', boxShadow: '0 12px 28px rgba(33,85,99,0.12)', textAlign: 'left', minWidth: '142px' }}>
                <div style={{ fontWeight: 800, color: 'var(--color-text-primary)', fontSize: '12px' }}>Manage records</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '10px', marginTop: '2px' }}>All in one place</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '34px', padding: '0 8px' }}>
                {['Appointments', 'Records', 'Medicines'].map((item) => (
                  <div
                    key={item}
                    style={{
                      background: 'rgba(255,255,255,0.94)',
                      borderRadius: '18px',
                      padding: '16px 10px',
                      textAlign: 'center',
                      color: '#31545B',
                      fontWeight: 800,
                      fontSize: '14px',
                      boxShadow: '0 10px 22px rgba(33,85,99,0.08)',
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className="register-form-area"
          style={{
            position: 'relative',
            background: 'radial-gradient(circle at top left, rgba(15,118,110,0.12), transparent 20%), linear-gradient(180deg, rgba(246,254,252,0.98) 0%, rgba(237,248,250,0.98) 100%)',
            padding: '44px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              maxWidth: '480px',
              margin: '0 auto',
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(190,232,226,0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '32px',
              boxShadow: '0 22px 52px rgba(28,83,92,0.12)',
              padding: '34px',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                Create Your Account
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
                Register to continue with Medinova.
                <br />
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 800, textDecoration: 'none' }}>
                  Sign in
                </Link>
              </p>
            </div>

            {error && (
              <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px 16px', borderRadius: '16px', fontSize: '13px', marginBottom: '18px', borderLeft: '3px solid #E53935' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#E8F5E9', color: '#2E7D32', padding: '12px 16px', borderRadius: '16px', fontSize: '13px', marginBottom: '18px', borderLeft: '3px solid #2E7D32' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Full Name
                </label>
                <input name="name" type="text" value={form.name} placeholder="Enter your full name" onChange={handleChange} onBlur={handleBlur} style={inputStyle('name')} />
                {fieldError('name') && <p style={{ color: '#C62828', fontSize: '12px', marginTop: '6px' }}>{fieldError('name')}</p>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Email Address
                </label>
                <input name="email" type="email" value={form.email} placeholder="your@email.com" onChange={handleChange} onBlur={handleBlur} style={inputStyle('email')} />
                {fieldError('email') && <p style={{ color: '#C62828', fontSize: '12px', marginTop: '6px' }}>{fieldError('email')}</p>}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Phone Number
                </label>
                <input name="phone" type="tel" value={form.phone} placeholder="9876543210" onChange={handleChange} onBlur={handleBlur} style={inputStyle('phone')} />
                {fieldError('phone') ? (
                  <p style={{ color: '#C62828', fontSize: '12px', marginTop: '6px' }}>{fieldError('phone')}</p>
                ) : (
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '12px', marginTop: '6px' }}></p>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Choose Your Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {roles.map((role) => {
                    const active = form.role === role.value
                    return (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => handleRoleSelect(role.value)}
                        style={{
                          padding: '12px 14px',
                          borderRadius: '14px',
                          border: `1.5px solid ${active ? 'var(--color-primary)' : 'rgba(15,118,110,0.12)'}`,
                          background: active ? 'linear-gradient(135deg, rgba(221,246,242,0.98), rgba(230,248,255,0.98))' : 'rgba(255,255,255,0.82)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          transition: 'var(--transition)',
                          boxShadow: active ? '0 14px 28px rgba(15,118,110,0.14)' : 'none',
                          transform: active ? 'translateY(-1px)' : 'none',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ width: '34px', height: '34px', borderRadius: '12px', background: active ? 'rgba(15,118,110,0.12)' : 'rgba(15,118,110,0.06)', display: 'grid', placeItems: 'center', color: 'var(--color-primary)', fontWeight: 800, fontSize: '18px', flexShrink: 0 }}>
                          {role.icon}
                        </span>
                        <span style={{ display: 'block' }}>
                          <span style={{ display: 'block', fontWeight: 700, fontSize: '13px', color: active ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                            {role.label}
                          </span>
                          <span style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: '11px', marginTop: '3px', lineHeight: 1.35 }}>
                            {role.value === 'patient' && 'Book doctors and manage records'}
                            {role.value === 'doctor' && 'Handle patients and appointments'}
                            {role.value === 'store' && 'Manage medicines and stock'}
                            {role.value === 'mr' && 'Share products with doctors'}
                            {role.value === 'admin' && 'Manage system, users & data'}
                          </span>
                        </span>
                      </button>
                    )
                  })}
                </div>
                <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '14px', background: 'linear-gradient(135deg, rgba(240,251,248,0.98), rgba(237,247,255,0.98))', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  Selected role: <strong>{activeRole?.label}</strong>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Password
                </label>
                <input name="password" type="password" value={form.password} placeholder="Enter your password" onChange={handleChange} onBlur={handleBlur} style={inputStyle('password')} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  {fieldError('password') ? (
                    <p style={{ color: '#C62828', fontSize: '12px' }}>{fieldError('password')}</p>
                  ) : (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>Minimum 6 characters.</p>
                  )}
                  <span style={{ color: passwordStrength.color, fontSize: '12px', fontWeight: 800 }}>{passwordStrength.label}</span>
                </div>
              </div>

              <div style={{ marginBottom: '22px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Confirm Password
                </label>
                <input name="confirmPassword" type="password" value={form.confirmPassword} placeholder="Re-enter password" onChange={handleChange} onBlur={handleBlur} style={inputStyle('confirmPassword')} />
                {fieldError('confirmPassword') ? (
                  <p style={{ color: '#C62828', fontSize: '12px', marginTop: '6px' }}>{fieldError('confirmPassword')}</p>
                ) : (
                  form.confirmPassword && form.confirmPassword === form.password
                    ? <p style={{ color: '#2E7D32', fontSize: '12px', marginTop: '6px' }}>Passwords match.</p>
                    : null
                )}
              </div>

              <button
                className="btn-primary"
                type="submit"
                style={{ width: '100%', padding: '15px', fontSize: '16px', borderRadius: '16px', boxShadow: '0 14px 28px rgba(0,105,92,0.16)' }}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          </div>
        </section>
      </div>

      <style>
        {`
          @media (max-width: 980px) {
            .register-shell {
              grid-template-columns: 1fr !important;
            }

            .register-info,
            .register-form-area {
              padding: 30px !important;
            }
          }

          @media (max-width: 640px) {
            .register-info,
            .register-form-area {
              padding: 22px !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Register
