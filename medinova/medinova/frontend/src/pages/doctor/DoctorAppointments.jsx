import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { demoAppointmentRequests } from '../../utils/demoData'
import { EMOJI, SYMBOL } from '@/utils/ui'


const G = {
  900:'#072E25',800:'#0D5C4A',700:'#0F7A62',600:'#118A6F',
  500:'#13A07F',400:'#3DB897',200:'#A8E6D8',100:'#D4F3EC',
  50:'#EBF9F5',25:'#F4FCFA',
}

const statusConfig = {
  pending:   { bg:'#FFF7ED', color:'#C2410C', border:'#FED7AA', dot:'#F97316', label:'Pending'   },
  confirmed: { bg:G[50],    color:G[800],    border:G[200],    dot:G[500],    label:'Approved'   },
  completed: { bg:G[25],    color:G[700],    border:G[100],    dot:G[400],    label:'Completed'  },
  rejected:  { bg:'#FEF2F2', color:'#991B1B', border:'#FECACA', dot:'#DC2626', label:'Rejected'  },
}

const FILTERS = ['all','pending','confirmed','completed','rejected']

function Badge({ status }) {
  const s = statusConfig[status] || statusConfig.pending
  return (
    <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:'999px', padding:'4px 11px', fontSize:'11px', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'5px', whiteSpace:'nowrap' }}>
      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:s.dot, display:'inline-block', flexShrink:0 }} />
      {s.label}
    </span>
  )
}

function ConfirmModal({ msg, onConfirm, onCancel, confirmColor='#DC2626', confirmBg='#FEF2F2' }) {
  return (
    <div onClick={onCancel} style={{ position:'fixed', inset:0, zIndex:999, background:'rgba(7,46,37,0.45)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:'20px', padding:'28px 28px 22px', maxWidth:'380px', width:'100%', boxShadow:'0 20px 50px rgba(7,46,37,0.18)' }}>
        <div style={{ fontSize:'15px', fontWeight:700, color:G[900], marginBottom:'8px' }}>{msg.title}</div>
        <div style={{ fontSize:'13px', color:'#64748B', marginBottom:'22px', lineHeight:1.6 }}>{msg.body}</div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onCancel}  style={{ flex:1, padding:'10px', borderRadius:'11px', border:`1px solid ${G[100]}`, background:G[25],  color:G[800], fontWeight:700, fontSize:'13px', cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1, padding:'10px', borderRadius:'11px', border:`1px solid ${confirmColor}`, background:confirmBg, color:confirmColor, fontWeight:700, fontSize:'13px', cursor:'pointer' }}>{msg.action}</button>
        </div>
      </div>
    </div>
  )
}

export default function DoctorAppointments() {
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  const [appointments, setAppointments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [confirm,  setConfirm]  = useState(null) // { id, action }
  const [working,  setWorking]  = useState(null)
  const [toast,    setToast]    = useState(null)
  const [usingDemoData, setUsingDemoData] = useState(false)

  const load = () => {
    if (!token) {
      setAppointments(demoAppointmentRequests)
      setUsingDemoData(true)
      setLoading(false)
      return
    }
    axios.get(`${API_BASE_URL}/api/appointments/doctor`, { headers:{ Authorization:`Bearer ${token}` } })
      .then((r) => {
        const liveAppointments = Array.isArray(r.data) ? r.data : []
        if (liveAppointments.length > 0) {
          setAppointments(liveAppointments)
          setUsingDemoData(false)
        } else {
          setAppointments(demoAppointmentRequests)
          setUsingDemoData(true)
        }
      })
      .catch(() => {
        setAppointments(demoAppointmentRequests)
        setUsingDemoData(true)
      })
      .finally(() => setLoading(false))
  }
  useEffect(load, [token])

  const showToast = (msg, ok=true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAction = async (id, action) => {
    setWorking(id)
    try {
      await axios.put(`${API_BASE_URL}/api/appointments/${id}/status`, { status: action === 'confirm' ? 'confirmed' : 'rejected' }, { headers:{ Authorization:`Bearer ${token}` } })
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: action === 'confirm' ? 'confirmed' : 'rejected' } : a))
      showToast(action === 'confirm' ? 'Appointment confirmed!' : 'Appointment rejected.')
    } catch { showToast('Something went wrong.', false) }
    finally { setWorking(null); setConfirm(null) }
  }

  const filtered = appointments.filter(a => {
    const matchFilter = filter === 'all' || a.status === filter
    const matchSearch = !search || a.patient_name?.toLowerCase().includes(search.toLowerCase()) || a.date?.includes(search)
    return matchFilter && matchSearch
  })

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === 'all' ? appointments.length : appointments.filter(a => a.status === f).length
    return acc
  }, {})

  return (
    <div style={{ background:`linear-gradient(160deg,${G[25]} 0%,${G[50]} 50%,#F0FDFA 100%)`, minHeight:'100vh' }}>
      {toast && (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:1000, background: toast.ok ? G[800] : '#DC2626', color:'#fff', padding:'12px 20px', borderRadius:'12px', fontWeight:700, fontSize:'13px', boxShadow:'0 8px 24px rgba(0,0,0,0.18)' }}>
          {toast.msg}
        </div>
      )}
      {confirm && (
        <ConfirmModal
          msg={confirm.action === 'confirm'
            ? { title:'Confirm Appointment?', body:`This will notify the patient that their appointment is confirmed.`, action:'Confirm' }
            : { title:'Reject Appointment?', body:`This will notify the patient that their appointment has been rejected.`, action:'Reject' }}
          confirmColor={confirm.action === 'confirm' ? G[800] : '#DC2626'}
          confirmBg={confirm.action === 'confirm' ? G[50] : '#FEF2F2'}
          onConfirm={() => handleAction(confirm.id, confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Header */}
        <div style={{ borderRadius:'22px', overflow:'hidden', marginBottom:'20px', boxShadow:`0 8px 32px rgba(13,92,74,0.18)` }}>
          <div style={{ background:`linear-gradient(135deg,${G[900]} 0%,${G[800]} 55%,${G[700]} 100%)`, padding:'26px 30px', position:'relative' }}>
            <div style={{ position:'absolute', top:'-40px', right:'100px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(168,230,216,0.07)', pointerEvents:'none' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'14px', position:'relative' }}>
              <div>
                <div style={{ fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:G[200], fontWeight:700, marginBottom:'5px' }}>Doctor Panel</div>
                <h1 style={{ fontSize:'28px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Patient Appointments</h1>
                <p style={{ fontSize:'13px', color:G[100], margin:0 }}>Review, confirm or reject appointment requests from your patients.</p>
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[ 
                  { label:'Total', value:counts.all, color:G[100] },
                  { label:'Pending', value:counts.pending, color:'#FEF08A' },
                  { label:'Confirmed', value:counts.confirmed, color:G[200] },
                ].map(c => (
                  <div key={c.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)', borderRadius:'12px', padding:'8px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:'20px', fontWeight:700, color:c.color }}>{loading ? SYMBOL.emDash : c.value}</div>
                    <div style={{ fontSize:'10px', fontWeight:700, color:c.color, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.07em' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {usingDemoData && (
          <div style={{ background:'#FFF8E8', border:'1px solid #F5D48C', borderRadius:'16px', padding:'14px 16px', color:'#8A5A00', fontSize:'13px', lineHeight:1.7, marginBottom:'16px' }}>
            Sample patient requests are visible because the live doctor appointment API is empty or unavailable.
          </div>
        )}

        {/* Controls */}
        <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'16px 20px', marginBottom:'16px', boxShadow:`0 2px 10px rgba(13,92,74,0.05)`, display:'flex', flexWrap:'wrap', gap:'12px', alignItems:'center' }}>
          {/* Filter tabs */}
          <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', flex:1 }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{ padding:'7px 14px', borderRadius:'10px', border:`1px solid ${filter===f ? G[200] : '#E2E8F0'}`, background: filter===f ? G[50] : '#fff', color: filter===f ? G[800] : '#64748B', fontWeight:700, fontSize:'12px', cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:'6px' }}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
                <span style={{ background: filter===f ? G[200] : '#F1F5F9', color: filter===f ? G[800] : '#94A3B8', borderRadius:'999px', padding:'1px 7px', fontSize:'10px', fontWeight:700 }}>{counts[f]}</span>
              </button>
            ))}
          </div>
          {/* Search */}
          <div style={{ position:'relative' }}>
            <span style={{ position:'absolute', left:'11px', top:'50%', transform:'translateY(-50%)', fontSize:'14px', pointerEvents:'none' }}>{EMOJI.search}</span>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={`Search patient, date${SYMBOL.ellipsis}`}
              style={{ paddingLeft:'32px', paddingRight:'12px', paddingTop:'8px', paddingBottom:'8px', borderRadius:'10px', border:`1px solid ${G[100]}`, background:G[25], fontSize:'13px', color:G[900], outline:'none', width:'200px' }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, overflow:'hidden', boxShadow:`0 2px 10px rgba(13,92,74,0.05)` }}>
          {loading ? (
            <div style={{ padding:'40px', textAlign:'center', color:'#94A3B8', fontSize:'14px' }}>Loading appointments{SYMBOL.ellipsis}</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:'48px', textAlign:'center' }}>
              <div style={{ fontSize:'32px', marginBottom:'10px' }}>{EMOJI.clipboard}</div>
              <div style={{ fontSize:'15px', fontWeight:700, color:G[900], marginBottom:'4px' }}>No appointments found</div>
              <div style={{ fontSize:'13px', color:'#94A3B8' }}>Try changing the filter or search term.</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:G[25], borderBottom:`1px solid ${G[100]}` }}>
                    {['Patient','Date','Time Slot','Reason','Status','Actions'].map(h => (
                      <th key={h} style={{ padding:'12px 16px', fontSize:'10px', fontWeight:700, color:G[700], textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'left', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((apt, i) => (
                    <tr key={apt.id} style={{ borderBottom:`1px solid ${G[25]}`, background: i%2===0 ? '#fff' : G[25], transition:'background 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.background=G[50]}
                      onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? '#fff' : G[25]}>
                      <td style={{ padding:'13px 16px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                          <div style={{ width:'34px', height:'34px', borderRadius:'10px', background:G[50], border:`1px solid ${G[200]}`, display:'grid', placeItems:'center', fontSize:'14px', fontWeight:700, color:G[800], flexShrink:0 }}>
                            {apt.patient_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:700, color:G[900] }}>{apt.patient_name || SYMBOL.emDash}</div>
                            <div style={{ fontSize:'11px', color:'#94A3B8' }}>ID #{apt.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding:'13px 16px', fontSize:'13px', color:G[800], fontWeight:600, whiteSpace:'nowrap' }}>{apt.date || SYMBOL.emDash}</td>
                      <td style={{ padding:'13px 16px', fontSize:'13px', color:G[700], whiteSpace:'nowrap' }}>{apt.time_slot || SYMBOL.emDash}</td>
                      <td style={{ padding:'13px 16px', fontSize:'12px', color:'#64748B', maxWidth:'180px' }}>
                        <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{apt.reason || apt.notes || 'General consultation'}</div>
                      </td>
                      <td style={{ padding:'13px 16px' }}><Badge status={apt.status} /></td>
                      <td style={{ padding:'13px 16px' }}>
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          {apt.status === 'pending' && (
                            <>
                              <button onClick={() => setConfirm({ id:apt.id, action:'confirm' })} disabled={working===apt.id}
                                style={{ padding:'6px 12px', borderRadius:'8px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'11px', cursor:'pointer' }}>
                                {SYMBOL.check} Confirm
                              </button>
                              <button onClick={() => setConfirm({ id:apt.id, action:'reject' })} disabled={working===apt.id}
                                style={{ padding:'6px 12px', borderRadius:'8px', border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', fontWeight:700, fontSize:'11px', cursor:'pointer' }}>
                                {SYMBOL.cross} Reject
                              </button>
                            </>
                          )}
                          {apt.status === 'confirmed' && (
                            <>
                              <button onClick={() => navigate('/doctor/video-consultation', { state:{ appointmentId: apt.id } })}
                                style={{ padding:'6px 12px', borderRadius:'8px', border:`1px solid ${G[200]}`, background:'#FFFFFF', color:G[800], fontWeight:700, fontSize:'11px', cursor:'pointer' }}>
                                Start Call
                              </button>
                              <button onClick={() => navigate(`/doctor/prescription/${apt.id}`, { state:{ appointment:apt } })}
                                style={{ padding:'6px 12px', borderRadius:'8px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'11px', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}>
                                Prescribe
                              </button>
                            </>
                          )}
                          {(apt.status === 'completed' || apt.status === 'rejected') && (
                            <span style={{ fontSize:'11px', color:'#94A3B8', padding:'6px 0' }}>{SYMBOL.emDash}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ marginTop:'12px', fontSize:'12px', color:'#94A3B8', textAlign:'right' }}>
          Showing {filtered.length} of {appointments.length} appointments
        </div>
      </div>
    </div>
  )
}
