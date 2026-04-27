import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import {
  PortalActionTile,
  PortalCard,
  PortalEmptyState,
  PortalModal,
  PortalPage,
  PortalHero,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { mrSidebarItems } from '../../components/portal/moduleConfig'

const meetingStatusConfig = {
  pending: { tone: 'amber', label: 'Pending' },
  accepted: { tone: 'teal', label: 'Accepted' },
  completed: { tone: 'green', label: 'Completed' },
  rejected: { tone: 'red', label: 'Rejected' },
}

function PendingMeetingsModal({ pendingMeetings, onClose }) {
  return (
    <PortalModal
      eyebrow="Activity"
      title="Pending Meeting Requests"
      description={`${pendingMeetings.length} request${pendingMeetings.length !== 1 ? 's' : ''} awaiting doctor response.`}
      onClose={onClose}
      footer={
        <Link to="/mr/meetings" style={{ textDecoration: 'none' }} onClick={onClose}>
          <button className="btn-primary" style={{ width: '100%', padding: '12px', borderRadius: '14px' }}>
            View All Meetings
          </button>
        </Link>
      }
    >
      {pendingMeetings.length === 0 ? (
        <PortalEmptyState
          icon="MT"
          title="No pending requests"
          description="New meeting requests will appear here as soon as you send them."
        />
      ) : (
        <div className="portal-list">
          {pendingMeetings.map((meeting) => (
            <div key={meeting.id} className="portal-row">
              <div>
                <div className="portal-row__title">{meeting.title}</div>
                <div className="portal-row__meta">
                  Dr. {meeting.doctor_name} | {meeting.specialization} | {meeting.meeting_date}
                </div>
              </div>
              <StatusPill label="Pending" tone="amber" />
            </div>
          ))}
        </div>
      )}
    </PortalModal>
  )
}

export default function MRDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const [products, setProducts] = useState([])
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  const h = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token])

  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }

    Promise.allSettled([
      axios.get(`${API_BASE_URL}/api/mr/products`, h),
      axios.get(`${API_BASE_URL}/api/mr/meetings`, h),
    ]).then(([productsResult, meetingsResult]) => {
      if (productsResult.status === 'fulfilled') {
        setProducts(Array.isArray(productsResult.value.data) ? productsResult.value.data : [])
      } else {
        setProducts([])
      }

      if (meetingsResult.status === 'fulfilled') {
        setMeetings(Array.isArray(meetingsResult.value.data) ? meetingsResult.value.data : [])
      } else {
        setMeetings([])
      }
    }).finally(() => setLoading(false))
  }, [token])

  const pending = useMemo(() => meetings.filter((meeting) => meeting.status === 'pending'), [meetings])
  const accepted = useMemo(() => meetings.filter((meeting) => meeting.status === 'accepted'), [meetings])

  const stats = useMemo(() => ({
    products: products.length,
    total: meetings.length,
    pending: pending.length,
    accepted: accepted.length,
    completed: meetings.filter((meeting) => meeting.status === 'completed').length,
    rejected: meetings.filter((meeting) => meeting.status === 'rejected').length,
  }), [accepted, meetings, pending, products])

  const recentMeetings = meetings.slice(0, 5)
  const greeting = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const progressValue = user.name && user.email ? (stats.products > 0 || stats.total > 0 ? 100 : 82) : 64

  return (
    <PortalPage
      user={user}
      moduleLabel="MR Portal"
      moduleName="MediNova Connect"
      sidebarItems={mrSidebarItems}
      progressValue={progressValue}
      progressLabel="Portfolio readiness"
      progressText={`${progressValue}% ready for product outreach and doctor follow-ups.`}
      focusTitle={pending.length > 0 ? 'Review pending doctor requests' : 'Keep your medicine portfolio fresh'}
      focusDescription={
        pending.length > 0
          ? `${pending.length} meeting request${pending.length !== 1 ? 's are' : ' is'} waiting for a doctor response.`
          : 'Refresh product details so meeting pitches stay ready when new doctors engage.'
      }
      avatarFallback="M"
      maxWidth="1800px"
    >
      {showModal && <PendingMeetingsModal pendingMeetings={pending} onClose={() => setShowModal(false)} />}

      <PortalHero
        eyebrow={greeting}
        title={`Welcome back, ${user.name || 'Medical Representative'}`}
        description="Manage your medicine portfolio, keep doctor meetings organized, and track every follow-up from one patient-style workspace."
        actions={
          <>
            <Link to="/mr/products" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ padding: '13px 20px', borderRadius: '16px' }}>
                Open Portfolio
              </button>
            </Link>
            <Link to="/mr/meetings" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Manage Meetings
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Meeting Snapshot</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {loading ? 'Loading activity' : `${stats.pending} pending request${stats.pending === 1 ? '' : 's'}`}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              {stats.accepted > 0
                ? `${stats.accepted} accepted meeting${stats.accepted === 1 ? '' : 's'} ready for follow-up planning.`
                : 'Accepted meetings and product activity will appear here as they arrive.'}
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{loading ? '-' : stats.products}</div>
                <div className="portal-summary-box__label">Products</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{loading ? '-' : stats.accepted}</div>
                <div className="portal-summary-box__label">Accepted</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'Products', value: loading ? '-' : stats.products, note: 'Portfolio items' },
          { title: 'Meetings', value: loading ? '-' : stats.total, note: 'All requests' },
          { title: 'Pending', value: loading ? '-' : stats.pending, note: 'Awaiting doctor action' },
          { title: 'Completed', value: loading ? '-' : stats.completed, note: 'Closed conversations' },
        ]}
      />

      <section className="portal-main-grid">
        <div className="portal-stack">
          <PortalCard
            title="Quick Actions"
            description="Shortcuts to the most-used medical representative workflows."
            className="fade-up-2"
          >
            <div className="portal-action-grid">
              <PortalActionTile
                to="/mr/find-doctors"
                code="FD"
                title="Find Doctors"
                description="Browse the doctor directory first, then move into meetings with a cleaner MR discovery workflow."
              />
              <PortalActionTile
                to="/mr/products"
                code="PP"
                title="Update Portfolio"
                description="Review medicines, descriptions, dosage notes, and pricing before your next doctor visit."
              />
              <PortalActionTile
                to="/mr/meetings"
                code="RM"
                title="Request Meeting"
                description="Send new meeting requests and align the next doctor conversation with current products."
              />
              <PortalActionTile
                to="/mr/meetings"
                code="TS"
                title="Track Status"
                description="Monitor pending, accepted, rejected, and completed meeting activity in one place."
              />
            </div>
          </PortalCard>

          <PortalCard
            eyebrow="Workflow note"
            title="Doctor directory access"
            description="The MR module now has a dedicated doctor discovery screen, while the meeting form still keeps the inline doctor selector."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Start in Find Doctors when you want to browse the directory, then keep product descriptions concise so meeting requests stay easier to review on the doctor side.
            </div>
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Activity"
            title="Pending Meetings"
            description="Requests that still need a doctor response."
            action={
              <button
                type="button"
                className="btn-outline"
                style={{ padding: '10px 18px', borderRadius: '14px', background: '#FFFFFF' }}
                onClick={() => setShowModal(true)}
              >
                Open list
              </button>
            }
            className="fade-up-2"
          >
            {loading ? (
              <div className="portal-note">Loading meeting activity...</div>
            ) : pending.length > 0 ? (
              <div className="portal-list">
                {pending.slice(0, 3).map((meeting) => (
                  <div key={meeting.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{meeting.title}</div>
                      <div className="portal-row__meta">Dr. {meeting.doctor_name} | {meeting.meeting_date}</div>
                    </div>
                    <StatusPill label="Pending" tone="amber" />
                  </div>
                ))}
              </div>
            ) : (
              <PortalEmptyState
                icon="MT"
                title="No pending meetings"
                description="New meeting requests will show up here the moment they are awaiting a doctor response."
              />
            )}
          </PortalCard>

          <PortalCard
            eyebrow="Latest"
            title="Recent Meetings"
            description="Your newest meeting activity, styled to match the patient appointment view."
            action={
              <Link to="/mr/meetings" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 800, fontSize: '13px' }}>
                View all
              </Link>
            }
            className="fade-up-3"
          >
            {loading ? (
              <div className="portal-note">Loading recent meetings...</div>
            ) : recentMeetings.length > 0 ? (
              <div className="portal-list">
                {recentMeetings.map((meeting) => {
                  const status = meetingStatusConfig[meeting.status] || meetingStatusConfig.pending

                  return (
                    <div key={meeting.id} className="portal-row">
                      <div>
                        <div className="portal-row__title">{meeting.title}</div>
                        <div className="portal-row__meta">
                          Dr. {meeting.doctor_name} | {meeting.specialization} | {meeting.meeting_date}
                        </div>
                      </div>
                      <StatusPill label={status.label} tone={status.tone} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <PortalEmptyState
                icon="RM"
                title="No meetings yet"
                description="Send your first meeting request to start building a doctor-facing activity timeline."
                action={
                  <Link to="/mr/meetings" style={{ textDecoration: 'none' }}>
                    <button className="btn-primary" style={{ borderRadius: '14px' }}>
                      Request a Meeting
                    </button>
                  </Link>
                }
              />
            )}
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}
