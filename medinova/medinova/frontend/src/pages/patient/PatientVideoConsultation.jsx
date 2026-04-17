import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getActiveVideoCall, joinVideoCallSession, leaveVideoCallRole, subscribeToVideoCallSession } from '../../utils/videoCallSession'

const initials = (name) => String(name || 'D').split(' ').filter(Boolean).map((word) => word[0]).join('').slice(0, 2).toUpperCase()

export default function PatientVideoConsultation() {
  const { appointmentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const appointment = location.state?.appointment || null

  const [session, setSession] = useState(getActiveVideoCall())
  const [muted, setMuted] = useState(false)
  const [videoOff, setVideoOff] = useState(false)
  const [joined, setJoined] = useState(false)

  useEffect(() => subscribeToVideoCallSession(setSession), [])

  const matchingSession = session && String(session.appointmentId) === String(appointmentId) ? session : null
  const callJoined = joined || Boolean(matchingSession?.participants?.patientJoined)
  const doctorName = matchingSession?.doctorName || appointment?.doctor_name || 'Doctor'
  const reason = matchingSession?.reason || appointment?.notes || 'General consultation'
  const dateText = appointment?.date || matchingSession?.date || 'Scheduled date'
  const timeText = appointment?.time_slot || matchingSession?.timeSlot || 'Scheduled time'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #F2FEFB 0%, #E8F9F6 52%, #F5FBFF 100%)', padding: '28px 20px' }}>
      {!matchingSession ? (
        <div style={{ maxWidth: '720px', margin: '0 auto', background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '28px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>Patient Video Call</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', marginBottom: '8px' }}>Call room not live yet</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.8, marginBottom: '18px' }}>
            Your doctor has not started the consultation room for this appointment yet. As soon as the doctor opens it, the join button will become available from your appointments page.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link to="/patient/appointments" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ borderRadius: '16px', padding: '12px 18px' }}>Back to Appointments</button>
            </Link>
            <button type="button" className="btn-outline" style={{ borderRadius: '16px', padding: '12px 18px' }} onClick={() => setSession(getActiveVideoCall())}>
              Check Again
            </button>
          </div>
        </div>
      ) : !callJoined ? (
        <div style={{ maxWidth: '720px', margin: '0 auto', background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '28px', padding: '28px', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>Consultation Ready</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '34px', marginBottom: '8px' }}>Join your call with {doctorName}</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '14px', lineHeight: 1.8, marginBottom: '18px' }}>
            The doctor has opened the consultation room. Join when you&apos;re ready and the room will stay synced with the live doctor view.
          </p>

          <div style={{ background: '#F7FCFB', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '20px', padding: '16px', marginBottom: '18px' }}>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '6px' }}>Appointment details</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.8 }}>{reason}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '8px' }}>{dateText} | {timeText}</div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ borderRadius: '16px', padding: '12px 18px' }}
              onClick={() => {
                const nextSession = joinVideoCallSession(appointmentId)
                if (nextSession) {
                  setSession(nextSession)
                  setJoined(true)
                }
              }}
            >
              Join Call
            </button>
            <Link to="/patient/appointments" style={{ textDecoration: 'none' }}>
              <button className="btn-outline" style={{ borderRadius: '16px', padding: '12px 18px' }}>Back to Appointments</button>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ minHeight: 'calc(100vh - 56px)', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '18px' }}>
          <div style={{ background: '#081722', borderRadius: '28px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '40px 24px' }}>
            <div style={{ position: 'absolute', top: '24px', left: '24px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#D1FAE5', fontSize: '12px', fontWeight: 700 }}>
              Doctor is connected
            </div>
            <div style={{ width: '112px', height: '112px', borderRadius: '30px', background: 'linear-gradient(135deg, #0D7469 0%, #11998E 100%)', display: 'grid', placeItems: 'center', color: '#FFFFFF', fontSize: '34px', fontWeight: 800, marginBottom: '18px' }}>
              {initials(doctorName)}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>{doctorName}</div>
            <div style={{ color: '#CCFBF1', fontSize: '14px', marginBottom: '18px', textAlign: 'center' }}>{reason}</div>
            <div style={{ color: '#D1FAE5', fontSize: '13px' }}>{videoOff ? 'Your camera is paused' : 'Consultation room active'} | {dateText} | {timeText}</div>
            <div style={{ position: 'absolute', right: '24px', bottom: '24px', width: '180px', height: '112px', borderRadius: '18px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: '#FFFFFF', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>{videoOff ? 'Video Off' : 'You'}</div>
                <div style={{ fontSize: '12px', color: '#CFFAFE' }}>{muted ? 'Muted' : 'Mic on'}</div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '24px', left: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setMuted((value) => !value)} style={{ padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: muted ? 'rgba(20,184,166,0.22)' : 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontWeight: 700, fontSize: '13px' }}>
                {muted ? 'Unmute' : 'Mute'}
              </button>
              <button type="button" onClick={() => setVideoOff((value) => !value)} style={{ padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)', background: videoOff ? 'rgba(20,184,166,0.22)' : 'rgba(255,255,255,0.08)', color: '#FFFFFF', fontWeight: 700, fontSize: '13px' }}>
                {videoOff ? 'Start Video' : 'Stop Video'}
              </button>
              <button
                type="button"
                onClick={() => {
                  leaveVideoCallRole('patient')
                  navigate('/patient/appointments')
                }}
                style={{ padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(248,113,113,0.38)', background: 'rgba(239,68,68,0.16)', color: '#FEE2E2', fontWeight: 800, fontSize: '13px' }}
              >
                Leave Call
              </button>
            </div>
          </div>

          <aside style={{ background: '#FFFFFF', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '28px', padding: '24px', boxShadow: 'var(--shadow-card)' }}>
            <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '8px' }}>Call Details</div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', marginBottom: '8px' }}>Appointment context</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {[
                ['Doctor', doctorName],
                ['Reason', reason],
                ['Date', dateText],
                ['Time', timeText],
                ['Status', 'Connected'],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#F7FCFB', border: '1px solid rgba(0,105,92,0.08)', borderRadius: '18px', padding: '14px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-primary)', fontWeight: 800, marginBottom: '6px' }}>{label}</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{value}</div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
