import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'


function getMedicineLines(text) {
  if (!text) return []

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function formatPrescriptionDate(value) {
  if (!value) return 'Recently added'

  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function MyPrescriptions() {
  const token = localStorage.getItem('token')
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let ignore = false

    async function fetchPrescriptions() {
      setLoading(true)
      setError('')

      try {
        const res = await axios.get(`${API_BASE_URL}/api/prescriptions/my`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!ignore) {
          setPrescriptions(Array.isArray(res.data) ? res.data : [])
        }
      } catch (err) {
        if (!ignore) {
          setPrescriptions([])
          setError(err.response?.data?.message || 'Unable to load your prescriptions right now.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchPrescriptions()

    return () => {
      ignore = true
    }
  }, [token, reloadKey])

  const summary = useMemo(() => {
    const medicineCount = prescriptions.reduce((count, item) => count + getMedicineLines(item.medicines).length, 0)

    return {
      total: prescriptions.length,
      medicineCount,
      instructionsCount: prescriptions.filter((item) => item.instructions).length,
      latest: prescriptions[0] || null,
    }
  }, [prescriptions])

  const summaryCards = [
    { title: 'Total Records', value: summary.total, note: 'Saved prescriptions' },
    { title: 'Medicine Lines', value: summary.medicineCount, note: 'Treatment entries' },
    { title: 'Instruction Notes', value: summary.instructionsCount, note: 'Doctor guidance' },
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
                Prescription Archive
              </div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>
                My prescriptions
              </h1>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '15px', lineHeight: 1.8, maxWidth: '720px' }}>
                A cleaner prescription timeline with better focus on medicines, doctor details, and follow-up instructions.
              </p>
            </div>

            <Link to="/patient/search" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Book Follow-up
              </button>
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '18px', marginBottom: '22px' }} className="prescription-hero-grid">
          <div
            className="fade-up-1"
            style={{
              background: 'linear-gradient(135deg, #E7F7F3 0%, #D8F0EA 55%, #CBEAE3 100%)',
              borderRadius: '28px',
              padding: '24px',
              border: '1px solid rgba(0, 105, 92, 0.10)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
              Latest Prescription
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '30px', marginBottom: '10px', maxWidth: '520px' }}>
              {summary.latest ? `Dr. ${summary.latest.doctor_name}` : 'Your treatment records will appear here'}
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: 1.8, maxWidth: '560px', marginBottom: '16px' }}>
              {summary.latest
                ? `${summary.latest.specialization} | ${formatPrescriptionDate(summary.latest.created_at)}`
                : 'After your consultation, prescriptions and medicine notes will be stored here for quick review.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ background: '#FFFFFF', borderRadius: '999px', padding: '9px 13px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', border: '1px solid rgba(0, 105, 92, 0.08)' }}>
                {summary.total} total records
              </div>
              <div style={{ background: '#FFFFFF', borderRadius: '999px', padding: '9px 13px', fontSize: '12px', fontWeight: 700, color: 'var(--color-text-secondary)', border: '1px solid rgba(0, 105, 92, 0.08)' }}>
                {summary.medicineCount} medicine lines
              </div>
            </div>
          </div>

          <div className="fade-up-2" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
            {summaryCards.map((card) => (
              <div key={card.title} style={{ background: '#FFFFFF', borderRadius: '24px', padding: '18px', border: '1px solid rgba(0, 105, 92, 0.08)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-text-muted)', fontWeight: 800, marginBottom: '8px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '30px', fontWeight: 800, color: 'var(--color-primary)', lineHeight: 1, marginBottom: '6px' }}>
                  {card.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  {card.note}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up-3" style={{ background: '#FFFFFF', borderRadius: '28px', padding: '24px', border: '1px solid rgba(0, 105, 92, 0.08)', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '6px' }}>Prescription timeline</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>
              A clearer record view with doctor details on one side and treatment notes on the other.
            </p>
          </div>

          {loading ? (
            <div style={{ color: 'var(--color-text-muted)', padding: '24px 0' }}>Loading prescriptions...</div>
          ) : error ? (
            <div style={{ borderRadius: '22px', padding: '18px', background: '#FFF6F5', border: '1px solid #F1C9C6' }}>
              <div style={{ fontSize: '17px', fontWeight: 800, color: '#A93226', marginBottom: '6px' }}>Could not load prescriptions</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '12px' }}>{error}</div>
              <button className="btn-outline" onClick={() => setReloadKey((value) => value + 1)}>Retry</button>
            </div>
          ) : prescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 24px', background: '#F6FBFA', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '24px' }}>
              <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '10px' }}>
                No Records Yet
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '8px' }}>No prescriptions yet</h3>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '22px', fontSize: '14px', lineHeight: 1.7 }}>
                Prescriptions from your doctors will appear here after your consultations.
              </p>
              <Link to="/patient/search" style={{ textDecoration: 'none' }}>
                <button className="btn-primary">Find Doctors</button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '14px' }}>
              {prescriptions.map((prescription, index) => {
                const medicineLines = getMedicineLines(prescription.medicines)

                return (
                  <div
                    key={prescription.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '220px minmax(0, 1fr)',
                      gap: '14px',
                      padding: '14px',
                      borderRadius: '20px',
                      border: '1px solid rgba(0, 105, 92, 0.08)',
                      background: index % 2 === 0 ? '#FBFEFD' : '#F9FCFB',
                    }}
                    className="prescription-timeline-card"
                  >
                    <div style={{ background: '#FFFFFF', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '18px', padding: '14px' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '13px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '12px' }}>
                        RX
                      </div>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>
                        Doctor
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                        Dr. {prescription.doctor_name}
                      </div>
                      <div style={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>
                        {prescription.specialization}
                      </div>
                      <div style={{ display: 'grid', gap: '8px' }}>
                        <div style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 10px', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                          {formatPrescriptionDate(prescription.created_at)}
                        </div>
                        <div style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 10px', fontSize: '11px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                          {medicineLines.length} medicine line{medicineLines.length === 1 ? '' : 's'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                      <div style={{ background: 'var(--color-primary-ghost)', borderRadius: '18px', padding: '14px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                          Medicines
                        </div>
                        <div style={{ display: 'grid', gap: '10px' }}>
                          {medicineLines.map((line, lineIndex) => (
                            <div key={`${prescription.id}-${lineIndex}`} style={{ background: '#FFFFFF', borderRadius: '12px', padding: '10px 12px', border: '1px solid rgba(0, 105, 92, 0.06)', fontSize: '13px', color: 'var(--color-text-primary)', lineHeight: 1.65 }}>
                              {line}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ background: '#FFF8EE', borderRadius: '18px', padding: '14px', border: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#E08027', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
                          Instructions
                        </div>
                        <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                          {prescription.instructions || 'No additional instructions were added for this prescription.'}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <style>
          {`
            @media (max-width: 900px) {
              .prescription-hero-grid {
                grid-template-columns: 1fr !important;
              }
            }

            @media (max-width: 760px) {
              .prescription-timeline-card {
                grid-template-columns: 1fr !important;
              }
            }
          `}
        </style>
      </div>
    </div>
  )
}

export default MyPrescriptions
