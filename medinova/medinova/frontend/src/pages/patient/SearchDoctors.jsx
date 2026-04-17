import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { demoDoctors, filterDoctorsDirectory } from '../../utils/demoData'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

function SearchDoctors() {
  const [doctors, setDoctors] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [usingDemoData, setUsingDemoData] = useState(false)
  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async (searchText = '') => {
    setLoading(true)
    setError('')

    const filteredDemoDoctors = filterDoctorsDirectory(demoDoctors, searchText)
    const fallbackDoctors = filteredDemoDoctors.length > 0 ? filteredDemoDoctors : demoDoctors

    try {
      const url = searchText
        ? `${API_BASE_URL}/api/doctors/search?query=${searchText}`
        : `${API_BASE_URL}/api/doctors`

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const liveDoctors = Array.isArray(res.data) ? res.data : []

      if (liveDoctors.length > 0) {
        setDoctors(liveDoctors)
        setUsingDemoData(false)
      } else {
        setDoctors(fallbackDoctors)
        setUsingDemoData(true)
      }
    } catch (err) {
      setDoctors(fallbackDoctors)
      setUsingDemoData(true)
      setError('')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (event) => {
    const value = event.target.value
    setQuery(value)
    fetchDoctors(value)
  }

  const highlights = useMemo(() => {
    return {
      total: doctors.length,
      cardiology: doctors.filter((doctor) => doctor.specialization?.toLowerCase().includes('card')).length,
      cities: new Set(doctors.map((doctor) => doctor.location).filter(Boolean)).size,
    }
  }, [doctors])

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

          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '18px' }} className="doctor-search-hero">
            <div style={{ background: 'linear-gradient(135deg, #E7F7F3 0%, #D8F0EA 58%, #CBEAE3 100%)', borderRadius: '30px', padding: '28px', border: '1px solid rgba(0, 105, 92, 0.10)', boxShadow: 'var(--shadow-card)' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                Doctor Discovery
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', color: 'var(--color-text-primary)', marginBottom: '10px' }}>
                Find the right doctor
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px', lineHeight: 1.8, maxWidth: '640px', marginBottom: '20px' }}>
                Search by doctor name, specialty, or location and move directly into booking with a cleaner patient discovery experience.
              </p>

              <div style={{ position: 'relative', maxWidth: '620px' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', color: 'var(--color-primary)' }}>
                  Search
                </span>
                <input
                  className="input"
                  placeholder="e.g. Cardiologist, Mumbai, Dr. Priya..."
                  value={query}
                  onChange={handleSearch}
                  style={{ paddingLeft: '78px', fontSize: '15px', height: '54px', borderRadius: '18px', background: '#FFFFFF' }}
                />
              </div>

              <div style={{ color: 'var(--color-text-muted)', fontSize: '13px', marginTop: '10px' }}>
                {loading
                  ? 'Searching doctors...'
                  : usingDemoData
                    ? 'Showing sample doctors while the live directory is empty or unavailable.'
                    : query
                      ? `${doctors.length} doctor${doctors.length !== 1 ? 's' : ''} found for "${query}"`
                      : 'Browse doctors by specialty and location'}
              </div>
            </div>

            <div className="fade-up-1" style={{ display: 'grid', gap: '14px' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '20px', border: '1px solid rgba(0, 105, 92, 0.08)', boxShadow: 'var(--shadow-card)' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                  Search Snapshot
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '10px' }}>
                  <div style={{ background: '#F5FBFA', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '4px' }}>{highlights.total}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Doctors</div>
                  </div>
                  <div style={{ background: '#F5FBFA', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '4px' }}>{highlights.cardiology}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Cardiology</div>
                  </div>
                  <div style={{ background: '#F5FBFA', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '4px' }}>{highlights.cities}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>Cities</div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'linear-gradient(180deg, #0B5D54 0%, #0D7469 55%, #12897A 100%)', color: '#FFFFFF', borderRadius: '24px', padding: '20px', boxShadow: '0 20px 42px rgba(0, 105, 92, 0.18)' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.76, marginBottom: '8px' }}>
                  Quick Tip
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>
                  Match symptoms with specialty
                </div>
                <div style={{ fontSize: '14px', lineHeight: 1.75, opacity: 0.9 }}>
                  Search by specialty first, then review experience, bio, and location before booking the consultation.
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>
            Searching doctors...
          </div>
        ) : error ? (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '28px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ borderRadius: '22px', padding: '18px', background: '#FFF6F5', border: '1px solid #F1C9C6' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#A93226', marginBottom: '6px' }}>Could not load doctors</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7 }}>{error}</div>
            </div>
          </div>
        ) : doctors.length === 0 ? (
          <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '28px', padding: '32px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ textAlign: 'center', padding: '56px 20px', background: '#F6FBFA', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '24px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '10px' }}>No Results</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '8px' }}>No doctors found</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7 }}>
                Try a different name, specialty, or city to find more doctors.
              </p>
            </div>
          </div>
        ) : (
          <div className="fade-up-2" style={{ display: 'grid', gap: '16px' }}>
            {usingDemoData && (
              <div style={{ background: '#FFF8E8', border: '1px solid #F5D48C', borderRadius: '18px', padding: '14px 16px', color: '#8A5A00', fontSize: '13px', lineHeight: 1.7 }}>
                Demo doctor cards are visible for UI preview. Live booking resumes automatically when the doctor API returns data.
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(0, 105, 92, 0.08)',
                  borderRadius: '26px',
                  padding: '22px',
                  boxShadow: 'var(--shadow-card)',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.boxShadow = 'var(--shadow-hover)'
                  event.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.boxShadow = 'var(--shadow-card)'
                  event.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>
                    DR
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{doctor.name}</div>
                    <div style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>{doctor.specialization}</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                        {doctor.location || 'Location pending'}
                      </span>
                      <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                        {doctor.experience} years
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#FBFEFD', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '18px', padding: '14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                    Doctor Bio
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
                    {doctor.bio || 'Doctor bio is not available yet.'}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(0, 105, 92, 0.08)' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                      Consultation fee
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-primary)' }}>Rs {doctor.fees}</div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ padding: '12px 18px', borderRadius: '16px', opacity: usingDemoData ? 0.72 : 1, cursor: usingDemoData ? 'not-allowed' : 'pointer' }}
                    onClick={() => {
                      if (!usingDemoData) {
                        navigate(`/patient/book/${doctor.id}`, { state: { doctor } })
                      }
                    }}
                    disabled={usingDemoData}
                  >
                    {usingDemoData ? 'Demo Only' : 'Book Now'}
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        <style>
          {`
            @media (max-width: 900px) {
              .doctor-search-hero {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  )
}

export default SearchDoctors
