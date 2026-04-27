import { useMemo, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { Link, useNavigate } from 'react-router-dom'


const initialForm = {
  email: '',
  password: '',
}

function validateForm(form) {
  const errors = {}
  const email = form.email.trim()

  if (!email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  }

  return errors
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const helperText = useMemo(() => {
    if (!form.password) return 'Use the password you created during registration.'
    if (form.password.length < 6) return 'Password looks short.'
    return 'Ready to sign in.'
  }, [form.password])

  const handleChange = (e) => {
    const nextForm = { ...form, [e.target.name]: e.target.value }
    setForm(nextForm)
    setErrors(validateForm(nextForm))
    setError('')
  }

  const handleBlur = (e) => {
    setTouched((current) => ({ ...current, [e.target.name]: true }))
    setErrors(validateForm(form))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const validationErrors = validateForm(form)
    setTouched({ email: true, password: true })
    setErrors(validationErrors)
    setError('')

    if (Object.keys(validationErrors).length > 0) return

    setLoading(true)
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })

      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      const routes = {
        patient: '/patient/dashboard',
        doctor: '/doctor/dashboard',
        admin: '/admin/dashboard',
        store: '/store/dashboard',
        mr: '/mr/dashboard',
      }

      navigate(routes[user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name) => (touched[name] ? errors[name] : '')

  const inputStyle = (name) => ({
    width: '100%',
    padding: '14px 16px',
    borderRadius: '14px',
    border: `1.5px solid ${fieldError(name) ? '#E53935' : 'rgba(15,118,110,0.14)'}`,
    background: 'rgba(255,255,255,0.96)',
    color: 'var(--color-text-primary)',
    outline: 'none',
    fontSize: '14px',
    transition: 'var(--transition)',
    boxShadow: fieldError(name) ? '0 0 0 3px rgba(229,57,53,0.08)' : '0 8px 18px rgba(15,118,110,0.04)',
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'%3E%3Cg fill='none' stroke='rgba(15,118,110,0.06)' stroke-width='8' stroke-linecap='round'%3E%3Ccircle cx='110' cy='110' r='30'/%3E%3Cpath d='M110 84v52'/%3E%3Cpath d='M84 110h52'/%3E%3C/g%3E%3C/svg%3E"),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='none' stroke='rgba(20,184,166,0.05)' stroke-width='8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='82' y='106' width='76' height='28' rx='14'/%3E%3Cpath d='M120 106v28'/%3E%3C/g%3E%3C/svg%3E"),
          radial-gradient(circle at top left, rgba(20,184,166,0.10), transparent 20%),
          radial-gradient(circle at bottom right, rgba(56,189,248,0.10), transparent 18%),
          linear-gradient(135deg, #F7FFFE 0%, #EEF9F6 52%, #F4FBFF 100%)
        `,
        backgroundSize: '220px 220px, 250px 250px, auto, auto, auto',
        backgroundPosition: '0 0, 120px 120px, left top, right bottom, center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        className="fade-up"
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(255,255,255,0.82)',
          border: '1px solid rgba(190,232,226,0.95)',
          backdropFilter: 'blur(12px)',
          borderRadius: '28px',
          boxShadow: '0 24px 60px rgba(28,83,92,0.10)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '8px',
            background: 'linear-gradient(90deg, #0B6B61 0%, #14B8A6 55%, #38BDF8 100%)',
          }}
        />

        <div style={{ padding: '34px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '62px',
                height: '62px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #0B6B61, #1BB7A2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
                boxShadow: '0 16px 30px rgba(11,107,97,0.18)',
              }}
            >
              <span style={{ color: 'white', fontSize: '28px', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>M</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Sign In
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
              Welcome back to Medinova. Access your healthcare dashboard securely.
            </p>
          </div>

          {error && (
            <div style={{ background: '#FFEBEE', color: '#C62828', padding: '12px 16px', borderRadius: '14px', fontSize: '13px', marginBottom: '18px', borderLeft: '3px solid #E53935' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#7D9691', fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                placeholder="your@email.com"
                onChange={handleChange}
                onBlur={handleBlur}
                style={inputStyle('email')}
              />
              {fieldError('email') && <p style={{ color: '#C62828', fontSize: '12px', marginTop: '6px' }}>{fieldError('email')}</p>}
            </div>

            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', color: '#7D9691', fontSize: '12px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                placeholder="Enter your password"
                onChange={handleChange}
                onBlur={handleBlur}
                style={inputStyle('password')}
              />
              {fieldError('password') ? (
                <p style={{ color: '#C62828', fontSize: '12px', marginTop: '6px' }}>{fieldError('password')}</p>
              ) : (
                <p style={{ color: '#8AA39E', fontSize: '12px', marginTop: '6px' }}>{helperText}</p>
              )}
            </div>

            <button
              className="btn-primary"
              type="submit"
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '16px',
                borderRadius: '14px',
                background: '#0B6B61',
                boxShadow: '0 14px 28px rgba(11,107,97,0.16)',
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#8AA39E', fontSize: '14px', lineHeight: 1.7 }}>
              Don&apos;t have an account?{' '}
              <Link to="/register" style={{ color: '#0B6B61', fontWeight: 800, textDecoration: 'none' }}>
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
