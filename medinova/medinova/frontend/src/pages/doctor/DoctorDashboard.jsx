import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { EMOJI, SYMBOL } from '@/utils/ui'


const G = {
  900: '#072E25', 800: '#0D5C4A', 700: '#0F7A62', 600: '#118A6F',
  500: '#13A07F', 400: '#3DB897', 200: '#A8E6D8', 100: '#D4F3EC',
  50:  '#EBF9F5', 25:  '#F4FCFA',
}

const statusConfig = {
  pending:   { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA', dot: '#F97316', label: 'Pending'   },
  confirmed: { bg: G[50],    color: G[800],    border: G[200],    dot: G[500],    label: 'Confirmed' },
  completed: { bg: G[25],    color: G[700],    border: G[100],    dot: G[400],    label: 'Completed' },
  rejected:  { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#DC2626', label: 'Rejected'  },
}

/* Pending modal */
function PendingModal({ pending, onClose }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(7,46,37,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background:'#FFFFFF', borderRadius:'24px', width:'100%', maxWidth:'540px', maxHeight:'80vh', display:'flex', flexDirection:'column', boxShadow:`0 24px 60px rgba(7,46,37,0.18)`, overflow:'hidden' }}>
        <div style={{ padding:'22px 24px 16px', borderBottom:`1px solid ${G[100]}`, display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexShrink:0, background:`linear-gradient(135deg,${G[50]} 0%,${G[100]} 100%)` }}>
          <div>
            <div style={{ fontSize:'11px', textTransform:'uppercase', letterSpacing:'0.1em', color:G[800], fontWeight:700, marginBottom:'4px' }}>Action Required</div>
            <h2 style={{ fontSize:'20px', fontWeight:700, margin:0, color:G[900] }}>Pending Appointments</h2>
            <p style={{ fontSize:'13px', color:G[700], marginTop:'4px', marginBottom:0 }}>{pending.length} request{pending.length !== 1 ? 's' : ''} waiting for review</p>
          </div>
          <button onClick={onClose} style={{ border:'none', background:`rgba(13,92,74,0.10)`, borderRadius:'10px', width:'34px', height:'34px', cursor:'pointer', fontSize:'20px', color:G[800], display:'grid', placeItems:'center', flexShrink:0, lineHeight:1 }}>{SYMBOL.cross}</button>
        </div>
        <div style={{ overflowY:'auto', padding:'16px 24px', flex:1 }}>
          {pending.length === 0
            ? <div style={{ textAlign:'center', padding:'28px 0', color:'#94A3B8', fontSize:'14px' }}>No pending appointments right now.</div>
            : <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                {pending.map(apt => (
                  <div key={apt.id} style={{ borderRadius:'14px', border:'1px solid #FED7AA', padding:'13px 15px', background:'#FFFBF5', display:'grid', gridTemplateColumns:'auto minmax(0,1fr) auto', gap:'11px', alignItems:'center' }}>
                    <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#FEF9C3', display:'grid', placeItems:'center', fontSize:'15px' }}>{EMOJI.person}</div>
                    <div>
                      <div style={{ fontSize:'14px', fontWeight:700, color:'#0F172A', marginBottom:'2px' }}>{apt.patient_name}</div>
                      <div style={{ fontSize:'12px', color:'#92400E' }}>{apt.date} {SYMBOL.bullet} {apt.time_slot}</div>
                    </div>
                    <div style={{ background:'#FFF7ED', color:'#C2410C', borderRadius:'999px', padding:'4px 10px', fontSize:'11px', fontWeight:700, whiteSpace:'nowrap' }}>Pending</div>
                  </div>
                ))}
              </div>
          }
        </div>
        <div style={{ padding:'14px 24px', borderTop:`1px solid ${G[100]}`, flexShrink:0 }}>
          <Link to="/doctor/appointments" style={{ textDecoration:'none' }} onClick={onClose}>
            <button style={{ width:'100%', padding:'12px', borderRadius:'12px', border:'none', background:G[800], color:'#FFFFFF', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
              Manage All Appointments {SYMBOL.arrowRight}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/* Doctor dashboard */
export default function DoctorDashboard() {
  const user     = JSON.parse(localStorage.getItem('user') || '{}')
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  const [appointments,  setAppointments]  = useState([])
  const [availability,  setAvailability]  = useState({})
  const [mrMeetings,    setMrMeetings]    = useState([])
  const [loading,       setLoading]       = useState(true)
  const [showModal,     setShowModal]     = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    // Fetch appointments
    axios.get(`${API_BASE_URL}/api/appointments/doctor`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAppointments(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
    // Fetch availability (non-blocking)
    axios.get(`${API_BASE_URL}/api/doctors/availability`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAvailability(res.data || {}))
      .catch(() => {})
    // Fetch MR meetings (non-blocking)
    axios.get(`${API_BASE_URL}/api/mr/meetings/doctor`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setMrMeetings(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
  }, [token])

  const stats = useMemo(() => ({
    total:     appointments.length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
  }), [appointments])

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  const activeDays  = DAYS.filter(d => availability[d]?.enabled).length
  const totalSlots  = DAYS.reduce((s,d) => s + (availability[d]?.slots?.length || 0), 0)
  const pendingMR   = mrMeetings.filter(m => m.status === 'pending').length

  const pending  = appointments.filter(a => a.status === 'pending')
  const recent   = appointments.slice(0, 5)
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

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
      <div className="page-content" style={{ maxWidth:'1280px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Banner */}
        <div style={{ borderRadius:'24px', marginBottom:'20px', overflow:'hidden', boxShadow:`0 8px 32px rgba(13,92,74,0.18)` }}>
          <div style={{ background:`linear-gradient(135deg, ${G[900]} 0%, ${G[800]} 55%, ${G[700]} 100%)`, padding:'30px 34px', position:'relative' }}>
            <div style={{ position:'absolute', top:'-50px', right:'180px', width:'220px', height:'220px', borderRadius:'50%', background:'rgba(168,230,216,0.08)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', bottom:'-40px', right:'50px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }} />
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) auto', gap:'24px', alignItems:'center', position:'relative' }} className="doctor-banner-grid">
              <div>
                <div style={{ fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:G[200], fontWeight:700, marginBottom:'7px' }}>{greeting}, Doctor</div>
                <h1 style={{ fontSize:'34px', fontWeight:700, color:'#FFFFFF', lineHeight:1.1, marginBottom:'9px' }}>Dr. {user.name || 'Doctor'}</h1>
                <p style={{ fontSize:'14px', color:G[100], lineHeight:1.7, maxWidth:'500px', marginBottom:'20px' }}>
                  {user.specialization || 'Specialist'} {SYMBOL.bullet} MediNova Clinic {SYMBOL.emDash} manage appointments, patient records, availability and MR meetings from one place.
                </p>
                <div style={{ display:'flex', gap:'9px', flexWrap:'wrap' }}>
                  {[
                    { label:'Total',       value: stats.total,     color: G[100]      },
                    { label:'Pending',     value: stats.pending,   color: '#FEF08A'   },
                    { label:'Confirmed',   value: stats.confirmed, color: G[200]      },
                    { label:'Completed',   value: stats.completed, color: '#CCFBF1'   },
                    { label:'Active Days', value: activeDays,      color: G[200]      },
                    { label:'MR Pending',  value: pendingMR,       color: '#FEF08A'   },
                  ].map(chip => (
                    <div key={chip.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)', borderRadius:'12px', padding:'7px 14px', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ fontSize:'19px', fontWeight:700, color:chip.color, lineHeight:1 }}>{loading ? SYMBOL.emDash : chip.value}</span>
                      <span style={{ fontSize:'10px', fontWeight:700, color:chip.color, opacity:0.85, textTransform:'uppercase', letterSpacing:'0.07em' }}>{chip.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'9px' }}>
                <div style={{ width:'72px', height:'72px', borderRadius:'20px', background:'rgba(255,255,255,0.13)', border:'1.5px solid rgba(255,255,255,0.20)', display:'grid', placeItems:'center', fontSize:'26px', fontWeight:700, color:'#FFFFFF' }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'D'}
                </div>
                <div style={{ background:'rgba(168,230,216,0.18)', border:`1px solid rgba(168,230,216,0.32)`, borderRadius:'999px', padding:'3px 11px', fontSize:'10px', fontWeight:700, color:G[100], letterSpacing:'0.06em' }}>{SYMBOL.dot} ONLINE</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3-column grid */}
        <div className="doctor-main-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', alignItems:'stretch' }}>

          {/* Column 1 */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Pending appointments card */}
            <div
              role="button" tabIndex={0}
              onClick={() => setShowModal(true)}
              onKeyDown={e => e.key === 'Enter' && setShowModal(true)}
              style={{ background:'#FFFFFF', borderRadius:'18px', border: stats.pending > 0 ? '1px solid #FED7AA' : `1px solid ${G[100]}`, padding:'18px 20px', cursor:'pointer', boxShadow:`0 2px 12px rgba(13,92,74,0.07)`, transition:'transform 0.16s ease, box-shadow 0.16s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 24px rgba(13,92,74,0.12)` }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)';   e.currentTarget.style.boxShadow=`0 2px 12px rgba(13,92,74,0.07)` }}
            >
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                <div>
                  <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'#C2410C', fontWeight:700, marginBottom:'3px' }}>Action Required</div>
                  <div style={{ fontSize:'16px', fontWeight:700, color:G[900] }}>Pending Requests</div>
                </div>
                <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:'#FFF7ED', border:'1px solid #FED7AA', display:'grid', placeItems:'center', fontSize:'18px', color:'#C2410C', flexShrink:0 }}>{SYMBOL.chevronRight}</div>
              </div>
              {loading
                ? <div style={{ fontSize:'13px', color:'#94A3B8' }}>Loading{SYMBOL.ellipsis}</div>
                : pending.length > 0
                  ? <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                      {pending.slice(0, 2).map(apt => (
                        <div key={apt.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px', padding:'9px 11px', borderRadius:'10px', background:'#FFFBF5', border:'1px solid #FDE8C8' }}>
                          <div style={{ minWidth:0 }}>
                            <div style={{ fontSize:'13px', fontWeight:700, color:'#0F172A', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{apt.patient_name}</div>
                            <div style={{ fontSize:'11px', color:'#92400E' }}>{apt.date} {SYMBOL.bullet} {apt.time_slot}</div>
                          </div>
                          <div style={{ background:'#FFF7ED', color:'#C2410C', borderRadius:'999px', padding:'3px 9px', fontSize:'10px', fontWeight:700, whiteSpace:'nowrap', flexShrink:0 }}>Pending</div>
                        </div>
                      ))}
                      {pending.length > 2 && <div style={{ fontSize:'12px', color:'#C2410C', fontWeight:700, textAlign:'center', paddingTop:'2px' }}>+{pending.length - 2} more {SYMBOL.emDash} click to review</div>}
                    </div>
                  : <div style={{ fontSize:'13px', color:'#94A3B8', padding:'4px 0' }}>No pending requests right now.</div>
              }
            </div>

            {/* Availability snapshot card */}
            <div style={{ background:`linear-gradient(135deg, ${G[50]} 0%, ${G[100]} 100%)`, borderRadius:'18px', border:`1px solid ${G[200]}`, padding:'18px 20px', boxShadow:`0 2px 10px rgba(13,92,74,0.07)` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                <div>
                  <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:G[700], fontWeight:700, marginBottom:'4px' }}>Your Schedule</div>
                  <div style={{ fontSize:'16px', fontWeight:700, color:G[900] }}>Availability</div>
                </div>
                <Link to="/doctor/availability" style={{ textDecoration:'none' }}>
                  <div style={{ width:'30px', height:'30px', borderRadius:'9px', background:'rgba(255,255,255,0.6)', border:`1px solid ${G[200]}`, display:'grid', placeItems:'center', fontSize:'14px', color:G[800], cursor:'pointer' }}>{SYMBOL.chevronRight}</div>
                </Link>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'9px', marginBottom:'12px' }}>
                {[
                  { label:'Active Days',  value: loading ? SYMBOL.emDash : activeDays,  color:G[800], bg:'#FFFFFF'  },
                  { label:'Total Slots',  value: loading ? SYMBOL.emDash : totalSlots,  color:G[700], bg:G[25]     },
                ].map(s => (
                  <div key={s.label} style={{ background:s.bg, borderRadius:'12px', padding:'12px 13px', border:`1px solid ${G[100]}` }}>
                    <div style={{ fontSize:'22px', fontWeight:700, color:s.color, lineHeight:1, marginBottom:'3px' }}>{s.value}</div>
                    <div style={{ fontSize:'10px', fontWeight:700, color:s.color, opacity:0.75, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {/* Mini day dots */}
              <div style={{ display:'flex', gap:'5px', justifyContent:'space-between' }}>
                {['M','T','W','T','F','S','S'].map((d, i) => {
                  const dayName = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]
                  const on = availability[dayName]?.enabled
                  return (
                    <div key={i} title={dayName} style={{ flex:1, textAlign:'center' }}>
                      <div style={{ width:'100%', aspectRatio:'1', borderRadius:'7px', background: on ? G[500] : '#E2E8F0', display:'grid', placeItems:'center', fontSize:'9px', fontWeight:700, color: on ? '#fff' : '#94A3B8', marginBottom:'3px' }}>{d}</div>
                    </div>
                  )
                })}
              </div>
              <Link to="/doctor/availability" style={{ textDecoration:'none' }}>
                <button style={{ width:'100%', marginTop:'11px', padding:'9px', borderRadius:'11px', border:`1px solid ${G[200]}`, background:'rgba(255,255,255,0.70)', color:G[800], fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                  Manage Schedule {SYMBOL.arrowRight}
                </button>
              </Link>
            </div>

            {/* Profile card */}
            <div style={{ background:'#FFFFFF', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'18px 20px', boxShadow:`0 2px 10px rgba(13,92,74,0.05)`, flex:1, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'#94A3B8', fontWeight:700, marginBottom:'12px' }}>Your Profile</div>
                <div style={{ display:'flex', alignItems:'center', gap:'13px', marginBottom:'14px' }}>
                  <div style={{ width:'42px', height:'42px', borderRadius:'12px', background:G[50], border:`1px solid ${G[200]}`, display:'grid', placeItems:'center', fontSize:'17px', fontWeight:700, color:G[800], flexShrink:0 }}>
                    {user.name?.charAt(0)?.toUpperCase() || 'D'}
                  </div>
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:700, color:G[900] }}>Dr. {user.name || 'Doctor'}</div>
                    <div style={{ fontSize:'12px', color:'#94A3B8' }}>{user.email || 'doctor@medinova.com'}</div>
                  </div>
                </div>
              </div>
              <Link to="/doctor/profile" style={{ textDecoration:'none' }}>
                <button style={{ width:'100%', padding:'10px', borderRadius:'11px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                  Edit Profile {SYMBOL.arrowRight}
                </button>
              </Link>
            </div>
          </div>

          {/* Column 2 */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Appointment stats */}
            <div style={{ background:'#FFFFFF', borderRadius:'22px', border:`1px solid ${G[100]}`, padding:'22px', boxShadow:`0 2px 10px rgba(13,92,74,0.05)` }}>
              <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'#94A3B8', fontWeight:700, marginBottom:'5px' }}>Overview</div>
              <div style={{ fontSize:'18px', fontWeight:700, color:G[900], marginBottom:'16px' }}>Appointment Stats</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                {[
                  { label:'Total',     value:stats.total,     color:G[800],    bg:G[50],      border:G[200]    },
                  { label:'Pending',   value:stats.pending,   color:'#92400E', bg:'#FFF7ED',  border:'#FED7AA' },
                  { label:'Confirmed', value:stats.confirmed, color:G[700],    bg:G[50],      border:G[200]    },
                  { label:'Completed', value:stats.completed, color:G[600],    bg:G[25],      border:G[100]    },
                ].map(s => (
                  <div key={s.label} style={{ background:s.bg, borderRadius:'14px', padding:'16px', border:`1px solid ${s.border}` }}>
                    <div style={{ fontSize:'28px', fontWeight:700, color:s.color, lineHeight:1, marginBottom:'5px' }}>{loading ? SYMBOL.emDash : s.value}</div>
                    <div style={{ fontSize:'11px', fontWeight:700, color:s.color, opacity:0.75, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* MR meetings snapshot card */}
            <div style={{ background:`linear-gradient(135deg, ${G[25]} 0%, ${G[50]} 100%)`, borderRadius:'18px', border:`1px solid ${G[200]}`, padding:'20px 22px', boxShadow:`0 2px 10px rgba(13,92,74,0.07)` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <div>
                  <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:G[700], fontWeight:700, marginBottom:'4px' }}>Medical Reps</div>
                  <div style={{ fontSize:'16px', fontWeight:700, color:G[900] }}>MR Meetings</div>
                </div>
                {pendingMR > 0 && (
                  <div style={{ background:'#FFF7ED', border:'1px solid #FED7AA', borderRadius:'999px', padding:'4px 11px', fontSize:'11px', fontWeight:700, color:'#C2410C', display:'flex', alignItems:'center', gap:'5px' }}>
                    <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#F97316', display:'inline-block' }} />
                    {pendingMR} Pending
                  </div>
                )}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px', marginBottom:'13px' }}>
                {[
                  { label:'Total',    value: mrMeetings.length,                                    color:G[800], bg:'#fff'    },
                  { label:'Pending',  value: pendingMR,                                            color:'#92400E', bg:'#FFF7ED' },
                  { label:'Accepted', value: mrMeetings.filter(m=>m.status==='accepted').length,   color:G[700], bg:G[25]     },
                  { label:'Done',     value: mrMeetings.filter(m=>m.status==='completed').length,  color:G[600], bg:G[25]     },
                ].map(s => (
                  <div key={s.label} style={{ background:s.bg, borderRadius:'11px', padding:'10px 12px', border:`1px solid ${G[100]}` }}>
                    <div style={{ fontSize:'20px', fontWeight:700, color:s.color, lineHeight:1, marginBottom:'2px' }}>{loading ? SYMBOL.emDash : s.value}</div>
                    <div style={{ fontSize:'10px', fontWeight:700, color:s.color, opacity:0.75, textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link to="/doctor/mr-meetings" style={{ textDecoration:'none' }}>
                <button style={{ width:'100%', padding:'10px', borderRadius:'12px', border:`1px solid ${G[200]}`, background:'rgba(255,255,255,0.70)', color:G[800], fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                  Open MR Meetings {SYMBOL.arrowRight}
                </button>
              </Link>
            </div>

            {/* Quick links */}
            <div style={{ background:'#FFFFFF', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'18px 20px', boxShadow:`0 2px 10px rgba(13,92,74,0.05)`, flex:1, display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'#94A3B8', fontWeight:700, marginBottom:'4px' }}>Quick Links</div>
              {[
               { to:'/doctor/appointments',        icon:EMOJI.calendar,    label:'Patient Appointments',  color:G[800], bg:G[50],  border:G[200] },
{ to:'/doctor/availability',        icon:EMOJI.calendar,    label:'Manage Availability',   color:G[700], bg:G[25],  border:G[100] },
{ to:'/doctor/mr-meetings',         icon:EMOJI.medicine,    label:'MR Meetings',           color:G[600], bg:G[50],  border:G[200] },
{ to:'/doctor/video-consultation',  icon:EMOJI.video,       label:'Video Consultation',    color:G[700], bg:G[25],  border:G[100] },
{ to:'/doctor/patient-report-analysis', icon:EMOJI.microscope, label:'Report Analysis',   color:G[800], bg:G[50],  border:G[200] },
{ to:'/doctor/profile',             icon:EMOJI.person,      label:'My Profile',            color:G[800], bg:G[25],  border:G[100] },
              ].map(item => (
                <Link key={item.to} to={item.to} style={{ textDecoration:'none' }}>
                  <div
                    style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 13px', borderRadius:'12px', background:item.bg, border:`1px solid ${item.border}`, transition:'transform 0.14s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform='translateX(3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform='translateX(0)'}
                  >
                    <div style={{ display:'flex', alignItems:'center', gap:'9px' }}>
                      <span style={{ fontSize:'14px' }}>{item.icon}</span>
                      <span style={{ fontSize:'13px', fontWeight:700, color:item.color }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize:'18px', color:item.color, lineHeight:1 }}>{SYMBOL.chevronRight}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Column 3 */}
          <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Recent appointments with prescription shortcut */}
            <div style={{ background:'#FFFFFF', borderRadius:'22px', border:`1px solid ${G[100]}`, padding:'20px', boxShadow:`0 2px 10px rgba(13,92,74,0.05)`, flex:1, display:'flex', flexDirection:'column' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px', flexShrink:0 }}>
                <div>
                  <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:'#94A3B8', fontWeight:700, marginBottom:'3px' }}>Latest</div>
                  <h2 style={{ fontSize:'18px', fontWeight:700, color:G[900], margin:0 }}>All Appointments</h2>
                </div>
                <Link to="/doctor/appointments" style={{ color:G[800], textDecoration:'none', fontWeight:700, fontSize:'12px' }}>View all</Link>
              </div>
              <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'7px' }}>
                {loading
                  ? <div style={{ fontSize:'13px', color:'#94A3B8', padding:'8px 0' }}>Loading{SYMBOL.ellipsis}</div>
                  : recent.length > 0
                    ? recent.map(apt => {
                        const s           = statusConfig[apt.status] || statusConfig.pending
                        const isConfirmed = apt.status === 'confirmed'
                        return (
                          <div key={apt.id} style={{ borderRadius:'12px', background:G[25], border:`1px solid ${isConfirmed ? G[200] : G[100]}`, overflow:'hidden' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'8px', padding:'10px 13px' }}>
                              <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:'13px', fontWeight:700, color:G[900], marginBottom:'1px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{apt.patient_name}</div>
                                <div style={{ fontSize:'11px', color:'#94A3B8' }}>{apt.date} {SYMBOL.bullet} {apt.time_slot}</div>
                              </div>
                              <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                                <div style={{ background:s.bg, color:s.color, borderRadius:'999px', padding:'3px 9px', fontSize:'10px', fontWeight:700, whiteSpace:'nowrap', border:`1px solid ${s.border}`, display:'flex', alignItems:'center', gap:'4px' }}>
                                  <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:s.dot, display:'inline-block' }} />
                                  {s.label}
                                </div>
                              </div>
                            </div>
                            {/* Action bar per status */}
                            {isConfirmed && (
                              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${G[100]}` }}>
                                <div
                                  onClick={() => navigate(`/doctor/prescription/${apt.id}`, { state:{ appointment:apt } })}
                                  style={{ padding:'7px 10px', background:G[50], display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', cursor:'pointer', transition:'background 0.13s', borderRight:`1px solid ${G[100]}` }}
                                  onMouseEnter={e => e.currentTarget.style.background=G[100]}
                                  onMouseLeave={e => e.currentTarget.style.background=G[50]}
                                >
                                  <span style={{ fontSize:'11px' }}>{EMOJI.memo}</span>
                                  <span style={{ fontSize:'11px', fontWeight:700, color:G[800] }}>Prescribe</span>
                                </div>
                                <Link to={`/doctor/patient/${apt.patient_id}/history`} style={{ textDecoration:'none' }}>
                                  <div
                                    style={{ padding:'7px 10px', background:G[50], display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', cursor:'pointer', transition:'background 0.13s', height:'100%' }}
                                    onMouseEnter={e => e.currentTarget.style.background=G[100]}
                                    onMouseLeave={e => e.currentTarget.style.background=G[50]}
                                  >
                                    <span style={{ fontSize:'11px' }}>{EMOJI.clipboard}</span>
                                    <span style={{ fontSize:'11px', fontWeight:700, color:G[800] }}>History</span>
                                  </div>
                                </Link>
                              </div>
                            )}
                            {apt.status === 'completed' && (
                              <Link to={`/doctor/patient/${apt.patient_id}/history`} style={{ textDecoration:'none' }}>
                                <div
                                  style={{ padding:'7px 13px', background:G[25], borderTop:`1px solid ${G[100]}`, display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', transition:'background 0.13s' }}
                                  onMouseEnter={e => e.currentTarget.style.background=G[100]}
                                  onMouseLeave={e => e.currentTarget.style.background=G[25]}
                                >
                                  <span style={{ fontSize:'11px' }}>{EMOJI.clipboard}</span>
                                  <span style={{ fontSize:'11px', fontWeight:700, color:G[700] }}>View Medical History</span>
                                  <span style={{ fontSize:'14px', color:G[600], marginLeft:'auto', lineHeight:1 }}>{SYMBOL.chevronRight}</span>
                                </div>
                              </Link>
                            )}
                          </div>
                        )
                      })
                    : <div style={{ fontSize:'13px', color:'#94A3B8' }}>No appointments yet.</div>
                }
              </div>
            </div>

            {/* Tip card */}
            <div style={{ background:`linear-gradient(135deg, ${G[25]} 0%, ${G[50]} 100%)`, borderRadius:'18px', border:`1px solid ${G[200]}`, padding:'18px 20px', boxShadow:`0 2px 10px rgba(13,92,74,0.07)` }}>
              <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:G[700], fontWeight:700, marginBottom:'6px' }}>Tip</div>
              <div style={{ fontSize:'15px', fontWeight:700, color:G[900], marginBottom:'8px' }}>Access patient history fast</div>
              <p style={{ fontSize:'12px', color:G[800], lineHeight:1.8, margin:'0 0 10px' }}>
                Click <strong>History</strong> on any confirmed appointment to view prescriptions, past visits and uploaded reports {SYMBOL.emDash} all in one place.
              </p>
              <div style={{ display:'flex', gap:'8px' }}>
                <Link to="/doctor/appointments" style={{ textDecoration:'none', flex:1 }}>
                  <button style={{ width:'100%', padding:'8px', borderRadius:'10px', border:`1px solid ${G[200]}`, background:'rgba(255,255,255,0.70)', color:G[800], fontWeight:700, fontSize:'11px', cursor:'pointer' }}>
                    Appointments {SYMBOL.arrowRight}
                  </button>
                </Link>
                <Link to="/doctor/availability" style={{ textDecoration:'none', flex:1 }}>
                  <button style={{ width:'100%', padding:'8px', borderRadius:'10px', border:`1px solid ${G[200]}`, background:'rgba(255,255,255,0.70)', color:G[800], fontWeight:700, fontSize:'11px', cursor:'pointer' }}>
                    Availability {SYMBOL.arrowRight}
                  </button>
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{ background:`linear-gradient(135deg, ${G[900]} 0%, ${G[800]} 100%)`, borderRadius:'18px', padding:'17px 19px', boxShadow:`0 8px 22px rgba(13,92,74,0.24)`, cursor:'pointer', position:'relative', overflow:'hidden' }}
              onClick={() => navigate('/doctor/appointments')}
            >
              <div style={{ position:'absolute', top:'-18px', right:'-18px', width:'90px', height:'90px', borderRadius:'50%', background:'rgba(255,255,255,0.06)', pointerEvents:'none' }} />
              <div style={{ fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.09em', color:G[200], fontWeight:700, marginBottom:'5px', position:'relative' }}>Quick Access</div>
              <div style={{ fontSize:'15px', fontWeight:700, color:'#FFFFFF', marginBottom:'3px', position:'relative' }}>Go to Appointments Panel</div>
              <div style={{ fontSize:'12px', color:G[100], position:'relative', marginBottom:'13px' }}>Confirm, reject and write prescriptions {SYMBOL.arrowRight}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', position:'relative' }}>
                {[
                  { to:'/doctor/availability',            label:`${EMOJI.alarm} Schedule` },
{ to:'/doctor/mr-meetings',             label:`${EMOJI.medicine} MR Meetings` },
{ to:'/doctor/video-consultation',      label:`${EMOJI.video} Video Call` },
{ to:'/doctor/patient-report-analysis', label:`${EMOJI.microscope} Reports` },
                ].map(btn => (
                  <Link key={btn.to} to={btn.to} onClick={e => e.stopPropagation()} style={{ textDecoration:'none' }}>
                    <div style={{ padding:'8px 10px', borderRadius:'10px', background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)', textAlign:'center', fontSize:'12px', fontWeight:700, color:G[100], cursor:'pointer', transition:'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.18)'}
                      onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.10)'}>
                      {btn.label}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1060px) { .doctor-main-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 680px)  { .doctor-main-grid { grid-template-columns: 1fr !important; } .doctor-banner-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
