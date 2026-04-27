import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { demoAppointmentRequests, getPatientRecordByAppointmentId } from '../../utils/demoData'
import {
  clearVideoCallSession,
  getActiveVideoCall,
  startVideoCallSession,
  subscribeToVideoCallSession,
} from '../../utils/videoCallSession'

const panel = { background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '24px', boxShadow: 'var(--shadow-card)' }

const initials = (name) => String(name || 'P').split(' ').filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase()
const formatClock = (value) => new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

function formatDateLabel(dateValue) {
  const date = new Date(`${dateValue}T00:00`)
  if (Number.isNaN(date.getTime())) return dateValue || 'Upcoming'
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const sameDay = (left, right) => left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate()
  if (sameDay(date, today)) return 'Today'
  if (sameDay(date, tomorrow)) return 'Tomorrow'
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function sortValue(item) {
  const candidate = new Date(`${item.date || ''}T${item.timeSlot || '00:00'}`)
  return Number.isNaN(candidate.getTime()) ? Number.MAX_SAFE_INTEGER : candidate.getTime()
}

function normalizeAppointment(item) {
  return {
    id: String(item.id),
    patientId: item.patient_id || null,
    patientName: item.patient_name || item.patient || 'Patient',
    patientPhone: item.patient_phone || '',
    patientEmail: item.patient_email || '',
    date: item.date || '',
    dateLabel: formatDateLabel(item.date),
    timeSlot: item.time_slot || item.time || '',
    reason: item.notes || item.reason || 'General consultation',
    status: item.status || 'confirmed',
  }
}

function RecordsModal({ consultation, onClose }) {
  const record = getPatientRecordByAppointmentId(consultation.id)

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(5,26,23,0.48)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
      <div onClick={(event) => event.stopPropagation()} style={{ ...panel, width: '100%', maxWidth: '560px', padding: '24px', maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '19px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px' }}>{consultation.patientName}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{record.bloodGroup} | {consultation.dateLabel}, {consultation.timeSlot || 'Time pending'}</div>
          </div>
          <button type="button" onClick={onClose} style={{ width: '34px', height: '34px', borderRadius: '12px', border: '1px solid rgba(0,105,92,0.12)', background: '#F4FBF9', color: 'var(--color-primary)', fontWeight: 800 }}>x</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: '#FBFEFD', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '18px', padding: '14px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>Allergies</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{record.allergies}</div>
          </div>
          <div style={{ background: '#FBFEFD', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '18px', padding: '14px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>Conditions</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{record.conditions.join(', ')}</div>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>Current Medications</div>
          <div style={{ display: 'grid', gap: '8px' }}>
            {record.medications.map((medicine) => (
              <div key={medicine} style={{ background: '#F8FCFB', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '14px', padding: '12px 14px', fontSize: '13px', color: 'var(--color-text-primary)' }}>
                {medicine}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>Visit History</div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {record.visits.map((visit) => (
              <div key={`${visit.date}-${visit.note}`} style={{ background: '#FBFEFD', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '16px', padding: '14px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--color-primary)', marginBottom: '4px' }}>{visit.date}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{visit.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VideoConsultation() {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')
  const location = useLocation()
  const navigate = useNavigate()

  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [usingDemoData, setUsingDemoData] = useState(false)
  const [session, setSession] = useState(getActiveVideoCall())
  const [activeCall, setActiveCall] = useState(null)
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [screenSharing, setScreenSharing] = useState(false)
  const [recording, setRecording] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesSaved, setNotesSaved] = useState(false)
  const [activePanel, setActivePanel] = useState('notes')
  const [chatMsg, setChatMsg] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [viewingRecords, setViewingRecords] = useState(null)
  const [handledLaunch, setHandledLaunch] = useState(false)

  useEffect(() => subscribeToVideoCallSession(setSession), [])

  useEffect(() => {
    let ignore = false

    async function fetchAppointments() {
      if (!token) {
        setConsultations(demoAppointmentRequests.map(normalizeAppointment))
        setUsingDemoData(true)
        setLoading(false)
        return
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/appointments/doctor`, { headers: { Authorization: `Bearer ${token}` } })
        if (ignore) return
        const liveAppointments = Array.isArray(res.data) ? res.data.map(normalizeAppointment) : []
        if (liveAppointments.length > 0) {
          setConsultations(liveAppointments)
          setUsingDemoData(false)
        } else {
          setConsultations(demoAppointmentRequests.map(normalizeAppointment))
          setUsingDemoData(true)
        }
      } catch {
        if (!ignore) {
          setConsultations(demoAppointmentRequests.map(normalizeAppointment))
          setUsingDemoData(true)
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchAppointments()
    return () => { ignore = true }
  }, [token])

  useEffect(() => {
    if (!session) return
    const liveCall = consultations.find((item) => item.id === String(session.appointmentId))
    if (liveCall) setActiveCall(liveCall)
  }, [consultations, session])

  useEffect(() => {
    const appointmentId = location.state?.appointmentId
    if (handledLaunch || !appointmentId || consultations.length === 0) return
    const consultation = consultations.find((item) => item.id === String(appointmentId))
    if (consultation) openCall(consultation)
    setHandledLaunch(true)
  }, [consultations, handledLaunch, location.state])

  const sortedConsultations = useMemo(() => [...consultations].sort((left, right) => sortValue(left) - sortValue(right)), [consultations])
  const liveSession = activeCall && session && String(session.appointmentId) === String(activeCall.id) ? session : null
  const patientJoined = Boolean(liveSession?.participants?.patientJoined)
  const timer = liveSession ? Math.max(0, Math.floor((Date.now() - new Date(liveSession.startedAt).getTime()) / 1000)) : 0
  const timerLabel = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`

  function openCall(consultation) {
    const nextSession = startVideoCallSession({
      appointmentId: consultation.id,
      doctorName: user.name || 'Doctor',
      patientName: consultation.patientName,
      patientId: consultation.patientId,
      reason: consultation.reason,
      date: consultation.date,
      timeSlot: consultation.timeSlot,
    })

    setSession(nextSession)
    setActiveCall(consultation)
    setMuted(false)
    setVideoOff(false)
    setScreenSharing(false)
    setRecording(false)
    setNotes('')
    setNotesSaved(false)
    setActivePanel('notes')
    setChatLog([{ from: 'system', text: `Consultation room opened for ${consultation.patientName}.`, time: formatClock(new Date()) }])
  }

  function endCall() {
    clearVideoCallSession()
    setSession(null)
    setActiveCall(null)
    setMuted(false)
    setVideoOff(false)
    setScreenSharing(false)
    setRecording(false)
    setNotes('')
    setNotesSaved(false)
  }

  function sendChat() {
    if (!chatMsg.trim()) return
    setChatLog((current) => [...current, { from: 'doctor', text: chatMsg.trim(), time: formatClock(new Date()) }])
    setChatMsg('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F2FEFB 0%, #E8F9F6 52%, #F5FBFF 100%)' }}>
      {viewingRecords && <RecordsModal consultation={viewingRecords} onClose={() => setViewingRecords(null)} />}

      {!activeCall ? (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 20px 40px' }}>
          <div style={{ ...panel, padding: '28px', background: 'linear-gradient(135deg, #0B5D54 0%, #0E766A 58%, #149687 100%)', color: '#FFFFFF', marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800, opacity: 0.78, marginBottom: '8px' }}>Doctor Video Call</div>
                <h1 style={{ margin: '0 0 8px', fontSize: '34px', fontWeight: 800 }}>Video consultations</h1>
                <p style={{ margin: 0, fontSize: '14px', maxWidth: '700px', lineHeight: 1.8, opacity: 0.92 }}>
                  Start call rooms for confirmed appointments. Patients can join from their appointment page as soon as the room goes live.
                </p>
                <Link to="/doctor/dashboard" style={{ textDecoration: 'none' }}>
                  <button className="btn-outline" style={{ marginTop: '18px', padding: '12px 18px', borderRadius: '16px', background: '#FFFFFF' }}>Back to Dashboard</button>
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', minWidth: '280px' }}>
                {[
                  { label: 'Queue', value: loading ? '-' : consultations.length },
                  { label: 'Approved', value: sortedConsultations.filter((item) => item.status === 'confirmed').length },
                  { label: 'Room', value: session ? 'Live' : 'Idle' },
                ].map((item) => (
                  <div key={item.label} style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '18px', padding: '16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px' }}>{item.value}</div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.82 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {usingDemoData && (
            <div style={{ background: '#FFF8E8', border: '1px solid #F5D48C', borderRadius: '18px', padding: '14px 16px', color: '#8A5A00', fontSize: '13px', lineHeight: 1.7, marginBottom: '18px' }}>
              Sample appointment requests are showing because the live appointment API is empty or unavailable. The video room still works in this frontend demo flow.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '18px' }}>
            {loading ? (
              <div style={{ ...panel, padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading consultation schedule...</div>
            ) : sortedConsultations.length === 0 ? (
              <div style={{ ...panel, padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No consultation requests are available right now.</div>
            ) : (
              sortedConsultations.map((consultation) => {
                const roomLive = session && String(session.appointmentId) === String(consultation.id)
                const canStart = consultation.status === 'confirmed' || roomLive

                return (
                  <div key={consultation.id} style={{ ...panel, padding: '22px', boxShadow: roomLive ? '0 22px 42px rgba(0,105,92,0.18)' : 'var(--shadow-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                        <div style={{ width: '54px', height: '54px', borderRadius: '18px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontWeight: 800, color: 'var(--color-primary)' }}>
                          {initials(consultation.patientName)}
                        </div>
                        <div>
                          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{consultation.patientName}</div>
                          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>{consultation.dateLabel}, {consultation.timeSlot || 'Time pending'}</div>
                        </div>
                      </div>
                      <div style={{ padding: '8px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', background: consultation.status === 'confirmed' ? '#DCFCE7' : '#FFF7ED', color: consultation.status === 'confirmed' ? '#166534' : '#9A3412' }}>
                        {consultation.status === 'confirmed' ? 'Approved' : 'Pending'}
                      </div>
                    </div>

                    <div style={{ background: '#F7FCFB', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '18px', padding: '14px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>Consultation reason</div>
                      <div style={{ fontSize: '14px', lineHeight: 1.75, color: 'var(--color-text-secondary)' }}>{consultation.reason}</div>
                    </div>

                    <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Phone: {consultation.patientPhone || 'Not shared'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Email: {consultation.patientEmail || 'Not shared'}</div>
                      {roomLive && <div style={{ fontSize: '13px', color: patientJoined ? '#166534' : '#9A3412', fontWeight: 700 }}>{patientJoined ? 'Patient joined the room' : 'Room live, waiting for patient'}</div>}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => setViewingRecords(consultation)} style={{ flex: 1, padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(0,105,92,0.14)', background: '#FFFFFF', color: 'var(--color-primary)', fontWeight: 800, fontSize: '13px' }}>
                        View Records
                      </button>
                      <button type="button" disabled={!canStart} onClick={() => canStart && openCall(consultation)} style={{ flex: 1, padding: '12px 16px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #0D7469 0%, #11998E 100%)', color: '#FFFFFF', fontWeight: 800, fontSize: '13px', opacity: canStart ? 1 : 0.6, cursor: canStart ? 'pointer' : 'not-allowed' }}>
                        {roomLive ? 'Open Room' : canStart ? 'Start Call' : 'Await Approval'}
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', background: '#081722' }}>
            <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(circle at top, #0D2230 0%, #081722 72%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
              <div style={{ position: 'absolute', top: '24px', left: '24px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#D1FAE5', fontSize: '12px', fontWeight: 700 }}>
                {patientJoined ? 'Patient connected' : 'Waiting for patient'}
              </div>
              <div style={{ position: 'absolute', top: '24px', right: '24px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(0,0,0,0.28)', color: '#FFFFFF', fontSize: '12px', fontWeight: 800 }}>{timerLabel}</div>
              <div style={{ width: '112px', height: '112px', borderRadius: '30px', background: 'linear-gradient(135deg, #0D7469 0%, #11998E 100%)', display: 'grid', placeItems: 'center', color: '#FFFFFF', fontSize: '34px', fontWeight: 800, marginBottom: '18px' }}>{initials(activeCall.patientName)}</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>{activeCall.patientName}</div>
              <div style={{ color: '#CCFBF1', fontSize: '14px', marginBottom: '18px' }}>{activeCall.reason}</div>
              <div style={{ color: '#D1FAE5', fontSize: '13px' }}>{videoOff ? 'Camera paused' : 'Video room active'} | {activeCall.dateLabel}, {activeCall.timeSlot || 'Time pending'}</div>
              <div style={{ position: 'absolute', right: '24px', bottom: '24px', width: '180px', height: '112px', borderRadius: '18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFFFFF', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '24px', marginBottom: '6px' }}>{videoOff ? 'Video Off' : 'Doctor View'}</div>
                  <div style={{ fontSize: '12px', color: '#CFFAFE' }}>{user.name || 'Doctor'}</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', padding: '18px 24px 24px', background: '#10212A', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {[
                { label: muted ? 'Unmute' : 'Mute', active: muted, onClick: () => setMuted((value) => !value) },
                { label: videoOff ? 'Start Video' : 'Stop Video', active: videoOff, onClick: () => setVideoOff((value) => !value) },
                { label: screenSharing ? 'Stop Share' : 'Share Screen', active: screenSharing, onClick: () => setScreenSharing((value) => !value) },
                { label: recording ? 'Stop Record' : 'Record', active: recording, onClick: () => setRecording((value) => !value) },
              ].map((button) => (
                <button key={button.label} type="button" onClick={button.onClick} style={{ padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: button.active ? 'rgba(20,184,166,0.22)' : 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontWeight: 700, fontSize: '13px' }}>
                  {button.label}
                </button>
              ))}
              <button type="button" onClick={endCall} style={{ padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(248,113,113,0.38)', background: 'rgba(239,68,68,0.16)', color: '#FEE2E2', fontWeight: 800, fontSize: '13px' }}>
                End Call
              </button>
            </div>
          </div>

          <aside style={{ background: '#FFFFFF', borderLeft: '1px solid rgba(0,105,92,0.08)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', padding: '12px', gap: '8px', borderBottom: '1px solid rgba(0,105,92,0.08)' }}>
              {['notes', 'chat', 'info'].map((item) => (
                <button key={item} type="button" onClick={() => setActivePanel(item)} style={{ padding: '10px 12px', borderRadius: '14px', border: activePanel === item ? '1px solid #99F6E4' : '1px solid transparent', background: activePanel === item ? '#F0FDFA' : '#F4FBF9', color: activePanel === item ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: 700, fontSize: '12px' }}>
                  {item === 'notes' ? 'Notes' : item === 'chat' ? 'Chat' : 'Patient'}
                </button>
              ))}
            </div>

            {activePanel === 'notes' && (
              <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Consultation notes</div>
                <textarea value={notes} onChange={(event) => { setNotes(event.target.value); setNotesSaved(false) }} placeholder="Add symptoms, findings, and next-step instructions here." style={{ flex: 1, minHeight: '240px', borderRadius: '18px', border: '1px solid rgba(0,105,92,0.12)', background: '#F8FCFB', color: 'var(--color-text-primary)', fontSize: '14px', lineHeight: 1.7, padding: '16px', resize: 'vertical', fontFamily: 'inherit' }} />
                {notesSaved && <div style={{ background: '#DCFCE7', color: '#166534', borderRadius: '14px', padding: '12px 14px', fontSize: '13px', fontWeight: 700 }}>Notes saved locally.</div>}
                <button type="button" className="btn-primary" style={{ borderRadius: '14px' }} onClick={() => { if (notes.trim()) { setNotesSaved(true); window.setTimeout(() => setNotesSaved(false), 2000) } }}>Save Notes</button>
                <button type="button" className="btn-outline" style={{ borderRadius: '14px' }} onClick={() => navigate(`/doctor/prescription/${activeCall.id}`, { state: { appointment: activeCall } })}>Open Prescription Page</button>
              </div>
            )}

            {activePanel === 'chat' && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '18px 18px 12px', fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Consultation chat</div>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', padding: '0 18px 0' }}>
                  {chatLog.length === 0 ? (
                    <div style={{ background: '#FFF8E8', color: '#8A5A00', alignSelf: 'center', borderRadius: '16px', padding: '12px 14px', fontSize: '13px' }}>
                      {patientJoined ? `${activeCall.patientName} is connected.` : `Waiting for ${activeCall.patientName} to join.`}
                    </div>
                  ) : (
                    chatLog.map((message, index) => (
                      <div key={`${message.time}-${index}`} style={{ maxWidth: '88%', borderRadius: '16px', padding: '12px 14px', alignSelf: message.from === 'doctor' ? 'flex-end' : 'center', background: message.from === 'doctor' ? 'linear-gradient(135deg, #0D7469 0%, #11998E 100%)' : '#FFF8E8', color: message.from === 'doctor' ? '#FFFFFF' : '#8A5A00' }}>
                        <div style={{ fontSize: '13px', lineHeight: 1.6 }}>{message.text}</div>
                        <div style={{ fontSize: '10px', opacity: 0.72, marginTop: '4px' }}>{message.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '10px', padding: '12px 18px 18px', borderTop: '1px solid rgba(0,105,92,0.08)' }}>
                  <input className="input" value={chatMsg} onChange={(event) => setChatMsg(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendChat()} placeholder="Type a message" style={{ height: '48px', borderRadius: '14px' }} />
                  <button type="button" className="btn-primary" style={{ borderRadius: '14px', whiteSpace: 'nowrap' }} onClick={sendChat}>Send</button>
                </div>
              </div>
            )}

            {activePanel === 'info' && (
              <div style={{ flex: 1, padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--color-primary-ghost)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '20px', color: 'var(--color-primary)' }}>{initials(activeCall.patientName)}</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{activeCall.patientName}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{activeCall.dateLabel}, {activeCall.timeSlot || 'Time pending'}</div>
                {[['Reason', activeCall.reason], ['Phone', activeCall.patientPhone || 'Not shared'], ['Email', activeCall.patientEmail || 'Not shared']].map(([label, value]) => (
                  <div key={label} style={{ background: '#F7FCFB', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '18px', padding: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>{label}</div>
                    <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{value}</div>
                  </div>
                ))}
                <button type="button" className="btn-outline" style={{ borderRadius: '14px' }} onClick={() => setViewingRecords(activeCall)}>View Full Records</button>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}
