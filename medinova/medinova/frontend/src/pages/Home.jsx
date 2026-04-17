import { Link, useNavigate } from 'react-router-dom'
import { useRef } from 'react'

function Home() {
  const navigate = useNavigate()
  const featuresRef = useRef(null)
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const handleFeatureClick = (link) => {
    if (token && user.role === 'patient') {
      navigate(link)
    } else {
      navigate('/register')
    }
  }

  const features = [
    { icon: '🔍', title: 'Find Doctors', desc: 'Search by specialty, location, or name and book instantly.', link: '/patient/search' },
    { icon: '📅', title: 'Book Appointments', desc: 'Schedule with your preferred doctor in seconds.', link: '/patient/appointments' },
    { icon: '💊', title: 'Digital Prescriptions', desc: 'Receive and store prescriptions digitally.', link: '/patient/prescriptions' },
    { icon: '🤖', title: 'AI Symptom Checker', desc: 'Describe symptoms and get doctor suggestions quickly.', link: '/patient/symptoms' },
    { icon: '🏪', title: 'Medicine Orders', desc: 'Order medicines directly from nearby medical stores.', link: '/patient/search' },
    { icon: '🏥', title: 'Health Card', desc: 'Your complete digital health profile in one place.', link: '/patient/health-card' },
  ]

  const roles = [
    { icon: '🤒', title: 'Patients', desc: 'Book appointments, view prescriptions, and track health.' },
    { icon: '🩺', title: 'Doctors', desc: 'Manage appointments, write prescriptions, and consult patients.' },
    { icon: '🏪', title: 'Medical Stores', desc: 'Manage inventory, receive orders, and track deliveries.' },
    { icon: '💼', title: 'Medical Reps', desc: 'Showcase products and request doctor meetings.' },
  ]

  const stats = [
    { value: '500+', label: 'Doctors' },
    { value: '10,000+', label: 'Patients' },
    { value: '50+', label: 'Medical Stores' },
    { value: '24/7', label: 'Support' },
  ]

  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, #118f82 100%)',
          padding: '88px 20px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', top: '-90px', right: '-90px', width: '420px', height: '420px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-70px', left: '-70px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(145deg, rgba(255,255,255,0.12) 0%, transparent 30%, transparent 100%)' }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '760px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(255,255,255,0.16)',
              borderRadius: '999px',
              padding: '7px 18px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 700,
              marginBottom: '24px',
              letterSpacing: '0.5px',
            }}
          >
            Smart Healthcare Platform
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'clamp(2.6rem, 6vw, 4.2rem)',
              color: 'white',
              lineHeight: 1.12,
              marginBottom: '20px',
            }}
          >
            Healthcare made
            <br />
            <span style={{ fontStyle: 'italic', opacity: 0.88 }}>simple and smart</span>
          </h1>

          <p
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: '18px',
              lineHeight: 1.75,
              maxWidth: '560px',
              margin: '0 auto 36px',
            }}
          >
            Connect with doctors, manage prescriptions, order medicines, and keep your health records in one place.
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'white',
                  color: 'var(--color-primary)',
                  border: 'none',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-main)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.14)',
                  transition: 'var(--transition)',
                }}
              >
                Get Started Free →
              </button>
            </Link>

            <Link to="/login" style={{ textDecoration: 'none' }}>
              <button
                style={{
                  background: 'rgba(255,255,255,0.14)',
                  color: 'white',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-main)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'var(--transition)',
                }}
              >
                Sign In
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', padding: '24px 20px' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '20px' }}>
          {stats.map((item) => (
            <div key={item.label} style={{ textAlign: 'center', minWidth: '120px' }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', color: 'var(--color-primary)', fontWeight: 700 }}>
                {item.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div ref={featuresRef} style={{ padding: '84px 20px', maxWidth: '1120px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
            Everything you need
          </h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
            One platform for all your healthcare needs
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
          {features.map((feature) => (
            <div
              key={feature.title}
              onClick={() => handleFeatureClick(feature.link)}
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '28px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'var(--transition)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '30px',
                  marginBottom: '16px',
                  borderRadius: '18px',
                  background: 'var(--color-primary-ghost)',
                }}
              >
                {feature.icon}
              </div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                {feature.title}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                {feature.desc}
              </div>
              <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                {token && user.role === 'patient' ? 'Open →' : 'Get Started →'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: 'var(--color-primary-ghost)', padding: '84px 20px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', color: 'var(--color-primary)', marginBottom: '12px' }}>
              Built for everyone
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '16px' }}>
              One platform connecting all healthcare members
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '16px' }}>
            {roles.map((role) => (
              <Link key={role.title} to="/register" style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                    e.currentTarget.style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ fontSize: '40px', marginBottom: '14px' }}>{role.icon}</div>
                  <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '8px' }}>
                    {role.title}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.65 }}>
                    {role.desc}
                  </div>
                  <div style={{ marginTop: '14px', fontSize: '13px', fontWeight: 700, color: 'var(--color-primary)' }}>
                    Join as {role.title.replace(/s$/, '')} →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div style={{ padding: '84px 20px', textAlign: 'center', background: 'var(--color-surface)' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', color: 'var(--color-text-primary)', marginBottom: '12px' }}>
          Ready to get started?
        </h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '16px', marginBottom: '32px' }}>
          Join patients, doctors, stores, and medical representatives on Medinova.
        </p>
        <Link to="/register" style={{ textDecoration: 'none' }}>
          <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '16px', borderRadius: 'var(--radius-md)' }}>
            Create Free Account →
          </button>
        </Link>
      </div>

      <div style={{ background: 'var(--color-primary)', padding: '32px 20px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', color: 'white', marginBottom: '8px' }}>
          medinova
        </div>
        <div style={{ color: 'rgba(255,255,255,0.68)', fontSize: '13px' }}>
          Smart Healthcare Platform
        </div>
      </div>
    </div>
  )
}

export default Home
