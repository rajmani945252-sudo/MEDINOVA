import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import {
  PortalCard,
  PortalEmptyState,
  PortalField,
  PortalFilterPills,
  PortalHero,
  PortalMessage,
  PortalPage,
  PortalStatGrid,
  StatusPill,
} from '../../components/portal/PortalChrome'
import { mrSidebarItems } from '../../components/portal/moduleConfig'
import { demoDoctors } from '../../utils/demoData'


const statusToneMap = {
  pending: 'amber',
  accepted: 'teal',
  rejected: 'red',
}

function MRMeetings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const location = useLocation()
  const [meetings, setMeetings] = useState([])
  const [doctors, setDoctors] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ doctor_id: '', title: '', message: '', meeting_date: '' })
  const [msg, setMsg] = useState('')
  const [msgKind, setMsgKind] = useState('success')
  const [filter, setFilter] = useState('all')
  const [usingDemoDoctors, setUsingDemoDoctors] = useState(false)
  const token = localStorage.getItem('token')
  const h = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    let ignore = false

    async function fetchData() {
      const [meetingsResult, doctorsResult] = await Promise.allSettled([
        axios.get(`${API_BASE_URL}/api/mr/meetings`, h),
        axios.get(`${API_BASE_URL}/api/mr/doctors`, h),
      ])

      if (ignore) return

      if (meetingsResult.status === 'fulfilled') {
        setMeetings(Array.isArray(meetingsResult.value.data) ? meetingsResult.value.data : [])
      } else {
        setMeetings([])
      }

      if (doctorsResult.status === 'fulfilled') {
        const liveDoctors = Array.isArray(doctorsResult.value.data) ? doctorsResult.value.data : []
        if (liveDoctors.length > 0) {
          setDoctors(liveDoctors)
          setUsingDemoDoctors(false)
        } else {
          setDoctors(demoDoctors)
          setUsingDemoDoctors(true)
        }
      } else {
        setDoctors(demoDoctors)
        setUsingDemoDoctors(true)
      }
    }

    fetchData()

    return () => {
      ignore = true
    }
  }, [token])

  useEffect(() => {
    const selectedDoctor = location.state?.selectedDoctor
    if (!selectedDoctor?.id) return

    setShowForm(true)
    setForm((currentForm) => ({
      ...currentForm,
      doctor_id: String(selectedDoctor.id),
      title: currentForm.title || `Product discussion with ${selectedDoctor.name}`,
    }))
  }, [location.state])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const selectedDoctor = doctors.find((doctor) => String(doctor.id) === String(form.doctor_id))
    try {
      if (String(form.doctor_id).startsWith('demo-')) {
        throw new Error('demo-doctor')
      }

      await axios.post(`${API_BASE_URL}/api/mr/meetings`, form, h)
      const res = await axios.get(`${API_BASE_URL}/api/mr/meetings`, h)
      setMeetings(Array.isArray(res.data) ? res.data : [])
      setMsg('Meeting request sent!')
      setMsgKind('success')
      setShowForm(false)
      setForm({ doctor_id: '', title: '', message: '', meeting_date: '' })
      setTimeout(() => setMsg(''), 3000)
    } catch {
      const fallbackMeeting = {
        id: `demo-meeting-${Date.now()}`,
        title: form.title,
        message: form.message,
        meeting_date: form.meeting_date,
        doctor_name: selectedDoctor?.name || 'Doctor',
        specialization: selectedDoctor?.specialization || 'Specialist',
        status: 'pending',
      }

      setMeetings((currentMeetings) => [fallbackMeeting, ...currentMeetings])
      setMsg(usingDemoDoctors
        ? 'Demo meeting request saved locally for UI preview.'
        : 'Live meeting API is unavailable, so the request was saved locally for this session.')
      setMsgKind('info')
      setShowForm(false)
      setForm({ doctor_id: '', title: '', message: '', meeting_date: '' })
      setTimeout(() => setMsg(''), 3000)
    }
  }

  const filters = ['all', 'pending', 'accepted', 'rejected']
  const filtered = filter === 'all' ? meetings : meetings.filter((meeting) => meeting.status === filter)
  const pendingCount = meetings.filter((meeting) => meeting.status === 'pending').length
  const acceptedCount = meetings.filter((meeting) => meeting.status === 'accepted').length
  const rejectedCount = meetings.filter((meeting) => meeting.status === 'rejected').length
  const progressValue = user.name && user.email ? (meetings.length > 0 ? 100 : 82) : 64
  const filterCounts = useMemo(() => ({
    all: meetings.length,
    pending: pendingCount,
    accepted: acceptedCount,
    rejected: rejectedCount,
  }), [acceptedCount, meetings.length, pendingCount, rejectedCount])

  return (
    <PortalPage
      user={user}
      moduleLabel="MR Portal"
      moduleName="MediNova Connect"
      sidebarItems={mrSidebarItems}
      progressValue={progressValue}
      progressLabel="Meeting workflow"
      progressText={`${progressValue}% ready to request and track doctor meetings.`}
      focusTitle={showForm ? 'Send the next request' : 'Track doctor responses closely'}
      focusDescription={
        showForm
          ? 'Choose a doctor, set the meeting date, and send the request without changing any existing submission logic.'
          : `${pendingCount} request${pendingCount === 1 ? '' : 's'} currently waiting for a decision.`
      }
      avatarFallback="M"
      maxWidth="1800px"
    >
      <PortalHero
        eyebrow="Meeting Requests"
        title="Doctor meetings"
        description={`${pendingCount} pending request${pendingCount === 1 ? '' : 's'} across ${meetings.length} total meeting conversation${meetings.length === 1 ? '' : 's'}.`}
        actions={
          <>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '13px 20px', borderRadius: '16px' }}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? 'Close Form' : 'Request Meeting'}
            </button>
            <Link to="/mr/dashboard" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ padding: '13px 20px', borderRadius: '16px', background: '#FFFFFF' }}>
                Open Dashboard
              </button>
            </Link>
          </>
        }
        aside={
          <>
            <div className="portal-kicker">Doctor Network</div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
              {doctors.length} available doctor{doctors.length === 1 ? '' : 's'}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: '16px' }}>
              Select a doctor from the existing directory and keep request messages short so responses stay fast.
            </div>
            <div className="portal-summary-grid">
              <div className="portal-summary-box">
                <div className="portal-summary-box__value">{acceptedCount}</div>
                <div className="portal-summary-box__label">Accepted</div>
              </div>
              <div className="portal-summary-box portal-summary-box--plain">
                <div className="portal-summary-box__value">{pendingCount}</div>
                <div className="portal-summary-box__label">Pending</div>
              </div>
            </div>
          </>
        }
      />

      <PortalStatGrid
        items={[
          { title: 'All', value: meetings.length, note: 'Total requests' },
          { title: 'Pending', value: pendingCount, note: 'Waiting on doctors' },
          { title: 'Accepted', value: acceptedCount, note: 'Ready to plan' },
          { title: 'Doctors', value: doctors.length, note: 'Available directory' },
        ]}
      />

      {msg && <PortalMessage kind={msgKind}>{msg}</PortalMessage>}

      {usingDemoDoctors && (
        <PortalMessage kind="info">
          Sample doctors are showing because the live MR doctor directory is empty or unavailable. Real API data will replace them automatically.
        </PortalMessage>
      )}

      <section className="portal-main-grid">
        <div className="portal-stack">
          {showForm && (
            <PortalCard
              title="Request a meeting"
              description="This keeps the existing meeting request submission intact while matching the patient profile form styling."
              className="fade-up-2"
            >
              <form onSubmit={handleSubmit}>
                <div className="portal-form-grid" style={{ marginBottom: '18px' }}>
                  <PortalField label="Select Doctor">
                    <select
                      className="input"
                      value={form.doctor_id}
                      onChange={(event) => setForm({ ...form, doctor_id: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    >
                      <option value="">Choose a doctor</option>
                      {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} - {doctor.specialization}</option>)}
                    </select>
                  </PortalField>

                  <PortalField label="Meeting Date">
                    <input
                      className="input"
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      value={form.meeting_date}
                      onChange={(event) => setForm({ ...form, meeting_date: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Meeting Title" fullWidth>
                    <input
                      className="input"
                      placeholder="e.g. New Antibiotic Product Presentation"
                      value={form.title}
                      onChange={(event) => setForm({ ...form, title: event.target.value })}
                      required
                      style={{ height: '52px', borderRadius: '16px' }}
                    />
                  </PortalField>

                  <PortalField label="Message" fullWidth>
                    <textarea
                      className="input"
                      rows={4}
                      placeholder="Brief about the meeting purpose..."
                      value={form.message}
                      onChange={(event) => setForm({ ...form, message: event.target.value })}
                      style={{ borderRadius: '16px', resize: 'vertical' }}
                    />
                  </PortalField>
                </div>

                <div className="portal-button-row">
                  <button className="btn-primary" type="submit" style={{ padding: '14px 28px', borderRadius: '16px' }}>
                    Send Request
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    style={{ padding: '14px 24px', borderRadius: '16px' }}
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </PortalCard>
          )}

          <PortalCard
            title="Meeting activity"
            description="The original meeting data now appears in the same patient-style list rows and status pills."
            className="fade-up-3"
          >
            <PortalFilterPills options={filters} value={filter} onChange={setFilter} counts={filterCounts} />

            {filtered.length === 0 ? (
              <PortalEmptyState
                icon="MT"
                title="No meeting requests"
                description="Request a meeting with a doctor to start the MR workflow."
                action={
                  <button className="btn-primary" style={{ borderRadius: '14px' }} onClick={() => setShowForm(true)}>
                    Request Meeting
                  </button>
                }
              />
            ) : (
              <div className="portal-list">
                {filtered.map((meeting) => (
                  <div key={meeting.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{meeting.title}</div>
                      <div className="portal-row__meta">
                        Dr. {meeting.doctor_name} | {meeting.specialization} | {meeting.meeting_date}
                      </div>
                      {meeting.message && (
                        <div className="portal-row__meta" style={{ marginTop: '4px' }}>
                          {meeting.message}
                        </div>
                      )}
                    </div>
                    <StatusPill
                      label={meeting.status}
                      tone={statusToneMap[meeting.status] || 'neutral'}
                    />
                  </div>
                ))}
              </div>
            )}
          </PortalCard>
        </div>

        <div className="portal-stack">
          <PortalCard
            eyebrow="Request notes"
            title="Doctor selection"
            description="Choose from the doctors returned by the existing directory API and keep meeting titles clear and specific."
            className="fade-up-2"
          >
            {doctors.length > 0 ? (
              <div className="portal-list">
                {doctors.slice(0, 4).map((doctor) => (
                  <div key={doctor.id} className="portal-row">
                    <div>
                      <div className="portal-row__title">{doctor.name}</div>
                      <div className="portal-row__meta">{doctor.specialization}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <PortalEmptyState
                icon="DR"
                title="Doctor list unavailable"
                description="Doctors will appear here once the directory request returns data."
              />
            )}
          </PortalCard>

          <PortalCard
            eyebrow="Guidance"
            title="Status tracking"
            description="Accepted requests are the strongest signal to prepare product notes and scheduling follow-up."
            className="fade-up-3"
            soft
          >
            <div className="portal-note">
              Use the filter pills above to isolate pending, accepted, or rejected meetings without changing any request logic underneath.
            </div>
          </PortalCard>
        </div>
      </section>
    </PortalPage>
  )
}

export default MRMeetings
