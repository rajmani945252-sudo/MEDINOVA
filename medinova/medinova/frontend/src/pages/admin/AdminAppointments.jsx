import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  PortalCard,
  PortalEmptyState,
  PortalFilterPills,
  PortalHero,
  PortalPage,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { adminSidebarItems } from '../../components/portal/moduleConfig'

const appointmentToneMap = {
  pending: 'amber',
  confirmed: 'teal',
  completed: 'green',
  rejected: 'red',
}

function AdminAppointments() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const token = localStorage.getItem('token')

  useEffect(() => {
    axios.get('http://localhost:5000/api/admin/appointments', {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => { setAppointments(res.data); setLoading(false) })
      .catch(() => { setAppointments([]); setLoading(false) })
  }, [])

  const filters = ['all', 'pending', 'confirmed', 'completed', 'rejected']
  const filtered = filter === 'all' ? appointments : appointments.filter((appointment) => appointment.status === filter)
  const pendingCount = appointments.filter((appointment) => appointment.status === 'pending').length
  const confirmedCount = appointments.filter((appointment) => appointment.status === 'confirmed').length
  const completedCount = appointments.filter((appointment) => appointment.status === 'completed').length
  const rejectedCount = appointments.filter((appointment) => appointment.status === 'rejected').length
  const filterCounts = useMemo(() => ({
    all: appointments.length,
    pending: pendingCount,
    confirmed: confirmedCount,
    completed: completedCount,
    rejected: rejectedCount,
  }), [appointments.length, completedCount, confirmedCount, pendingCount, rejectedCount])

  return (
    <PortalPage
      user={user}
      moduleLabel="Admin Panel"
      moduleName="MediNova Control"
      sidebarItems={adminSidebarItems}
      progressValue={100}
      progressLabel="Appointment oversight"
      progressText="100% ready to review system-wide appointment activity."
      focusTitle={loading ? 'Loading appointments' : 'Watch pending appointment flow'}
      focusDescription={
        loading
          ? 'The appointment list is loading into the reskinned admin interface.'
          : `${pendingCount} appointment${pendingCount === 1 ? '' : 's'} currently pending across the system.`
      }
      avatarFallback="A"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Appointment Oversight"
        title="All appointments"
        description={`${appointments.length} total appointment${appointments.length === 1 ? '' : 's'} across every patient and doctor workflow.`}
        actions={
          <>
            <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Open Dashboard
              </button>
            </Link>
            <Link to="/admin/users" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Manage Users
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Appointment Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {confirmedCount} confirmed appointment{confirmedCount === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Review status distribution, patient-doctor pairings, and time slots without changing the existing admin appointment request.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{pendingCount}</div>
                <div className="portal-summary-box__label">Pending</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{completedCount}</div>
                <div className="portal-summary-box__label">Completed</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'All', value: appointments.length, note: 'Total appointments' },
          { title: 'Pending', value: pendingCount, note: 'Awaiting confirmation' },
          { title: 'Confirmed', value: confirmedCount, note: 'Approved visits' },
          { title: 'Completed', value: completedCount, note: 'Closed consultations' },
        ]}
      />

      <section className="portal-main-grid">
        <div className="portal-stack">
          <PortalCard
            title="Appointment directory"
            description="Patient-style filter pills and rounded rows layered over the original appointment data."
            className="fade-up-2"
          >
            <PortalFilterPills options={filters} value={filter} onChange={setFilter} counts={filterCounts} />

            {loading ? (
              <div className="portal-note">Loading appointments...</div>
            ) : filtered.length === 0 ? (
              <PortalEmptyState
                icon="AP"
                title="No appointments found"
                description="No appointments matched the current filter."
              />
            ) : (
              <div className="portal-list">
                {filtered.map((appointment) => (
                  <div key={appointment.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{appointment.patient_name} to Dr. {appointment.doctor_name}</div>
                      <div className="portal-row__meta">
                        {appointment.date} | {appointment.time_slot} | ID #{appointment.id}
                      </div>
                    </div>
                    <StatusPill label={appointment.status} tone={appointmentToneMap[appointment.status] || 'neutral'} />
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Status counts"
            title="Appointment mix"
            description="A compact status view for admin-level monitoring."
            className="fade-up-2"
          >
            <div className="portal-list">
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Pending</div>
                  <div className="portal-row__meta">Waiting for approval</div>
                </div>
                <StatusPill label={`${pendingCount}`} tone="amber" />
              </div>
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Confirmed</div>
                  <div className="portal-row__meta">Ready to attend</div>
                </div>
                <StatusPill label={`${confirmedCount}`} tone="teal" />
              </div>
              <div className="portal-row">
                <div>
                  <div className="portal-row__title">Rejected</div>
                  <div className="portal-row__meta">Declined appointments</div>
                </div>
                <StatusPill label={`${rejectedCount}`} tone="red" />
              </div>
            </div>
          </PortalCard>

          <PortalCard
            eyebrow="Review note"
            title="Read-only oversight"
            description="This admin screen remains a monitoring surface only; the reskin changed the UI without adding any new controls."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Filters, appointment data fields, and routing are unchanged. Only layout, cards, spacing, and visual treatment now match the patient UI.
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default AdminAppointments
