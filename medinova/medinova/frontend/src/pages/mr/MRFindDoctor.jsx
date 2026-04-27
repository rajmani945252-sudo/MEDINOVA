import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import {
  PortalCard,
  PortalEmptyState,
  PortalHero,
  PortalPage,
  PortalStatGrid,
} from '../../components/portal/PortalChrome'
import { mrSidebarItems } from '../../components/portal/moduleConfig'
import { demoDoctors, filterDoctorsDirectory } from '../../utils/demoData'


export default function MRFindDoctor() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const [directory, setDirectory] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [usingDemoData, setUsingDemoData] = useState(false)

  useEffect(() => {
    let ignore = false

    async function fetchDoctors() {
      setLoading(true)

      try {
        const res = await axios.get(`${API_BASE_URL}/api/mr/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (ignore) return

        const liveDoctors = Array.isArray(res.data) ? res.data : []
        if (liveDoctors.length > 0) {
          setDirectory(liveDoctors)
          setUsingDemoData(false)
        } else {
          setDirectory(demoDoctors)
          setUsingDemoData(true)
        }
      } catch {
        if (!ignore) {
          setDirectory(demoDoctors)
          setUsingDemoData(true)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchDoctors()

    return () => {
      ignore = true
    }
  }, [token])

  const doctors = useMemo(() => {
    const filtered = filterDoctorsDirectory(directory, query)
    return filtered.length > 0 || !query ? filtered : directory
  }, [directory, query])

  const highlights = useMemo(() => ({
    total: doctors.length,
    specialties: new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)).size,
    cities: new Set(doctors.map((doctor) => doctor.location).filter(Boolean)).size,
  }), [doctors])

  const progressValue = user.name && user.email ? (directory.length > 0 ? 100 : 82) : 64

  return (
    <PortalPage
      user={user}
      moduleLabel="MR Portal"
      moduleName="MediNova Connect"
      sidebarItems={mrSidebarItems}
      progressValue={progressValue}
      progressLabel="Doctor outreach"
      progressText={`${progressValue}% ready to discover doctors and prepare meeting requests.`}
      focusTitle={usingDemoData ? 'Preview sample doctors safely' : 'Shortlist the next doctor meeting'}
      focusDescription={
        usingDemoData
          ? 'Sample doctor cards are visible because the live directory is empty or unavailable right now.'
          : 'Filter by name, specialty, or location before opening the meeting request workflow.'
      }
      avatarFallback="M"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Doctor Directory"
        title="Find doctors for outreach"
        description="Browse the doctor directory with the same card treatment used in patient discovery, then jump straight into a meeting request when you find the right match."
        actions={
          <>
            <Link to="/mr/meetings" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Open Meetings
              </button>
            </Link>
            <Link to="/mr/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Open Dashboard
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Directory Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {loading ? 'Loading directory' : `${highlights.total} doctor${highlights.total === 1 ? '' : 's'} visible`}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              {usingDemoData
                ? 'Sample records are showing for UI continuity. Real doctor data will replace them automatically.'
                : 'Search by specialty or city, then send a focused meeting request with your current product portfolio in mind.'}
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{loading ? '-' : highlights.specialties}</div>
                <div className="portal-summary-box__label">Specialties</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{loading ? '-' : highlights.cities}</div>
                <div className="portal-summary-box__label">Cities</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'Doctors', value: loading ? '-' : highlights.total, note: 'Visible cards' },
          { title: 'Specialties', value: loading ? '-' : highlights.specialties, note: 'Directory spread' },
          { title: 'Cities', value: loading ? '-' : highlights.cities, note: 'Location coverage' },
          { title: 'Demo Mode', value: usingDemoData ? 'On' : 'Off', note: 'Fallback visibility' },
        ]}
      />

      <section className="portal-main-grid">
        <div className="portal-stack">
          <PortalCard
            title="Search doctor directory"
            description="Use the same straightforward discovery flow as the patient search page, but optimized for medical representative outreach."
            className="fade-up-2"
          >
            <div style={{ position: 'relative', marginBottom: '18px' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '15px', color: 'var(--color-primary)' }}>
                Search
              </span>
              <input
                className="input"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by doctor name, specialty, or city"
                style={{ height: '54px', borderRadius: '18px', paddingLeft: '78px' }}
              />
            </div>

            {usingDemoData && (
              <div style={{ background: '#FFF8E8', border: '1px solid #F5D48C', borderRadius: '18px', padding: '14px 16px', color: '#8A5A00', fontSize: '13px', lineHeight: 1.7, marginBottom: '18px' }}>
                Demo doctors are visible for UI continuity only. Real meeting requests work automatically again once the live doctor API returns data.
              </div>
            )}

            {loading ? (
              <div className="portal-note">Loading doctor directory...</div>
            ) : doctors.length === 0 ? (
              <PortalEmptyState
                icon="DR"
                title="No doctors found"
                description="Try a broader name, specialty, or city search to widen the directory results."
              />
            ) : (
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
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '16px' }}>
                      <div style={{ width: '58px', height: '58px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontSize: '15px', fontWeight: 800, color: 'var(--color-primary)', flexShrink: 0 }}>
                        DR
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>{doctor.name}</div>
                        <div style={{ color: 'var(--color-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '8px' }}>{doctor.specialization || 'Specialist'}</div>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            {doctor.location || 'Location pending'}
                          </span>
                          <span style={{ background: '#F5FBFA', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: 700 }}>
                            {doctor.experience ? `${doctor.experience} years` : 'Experience on request'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: '#FBFEFD', border: '1px solid rgba(0, 105, 92, 0.08)', borderRadius: '18px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>
                        Outreach Notes
                      </div>
                      <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.75 }}>
                        {doctor.bio || 'Doctor contact details are available for meeting planning from the MR module.'}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>Email:</strong> {doctor.email || 'Not shared'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                        <strong style={{ color: 'var(--color-text-primary)' }}>Phone:</strong> {doctor.phone || 'Not shared'}
                      </div>
                    </div>

                    <Link
                      to="/mr/meetings"
                      state={{ selectedDoctor: doctor, usingDemoDoctor: usingDemoData }}
                      style={{ textDecoration: 'none' }}
                    >
                      <button className="btn-primary" style={{ width: '100%', padding: '12px 18px', borderRadius: '16px' }}>
                        Request Meeting
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Doctor outreach"
            title="How to use this directory"
            description="Search first, then move into the meeting request form once you have the right doctor in mind."
            className="fade-up-2"
          >
            <div className="portal-note">
              The meeting form stays unchanged underneath. This page only gives the MR module the missing doctor-discovery surface it was missing before.
            </div>
          </PortalCard>

          <PortalCard
            eyebrow="Next step"
            title="Meeting preparation"
            description="Bring along your product title, a short message, and a preferred date before you submit the request."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Clear meeting titles and short product summaries tend to make doctor responses easier to review from their dashboard.
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}
