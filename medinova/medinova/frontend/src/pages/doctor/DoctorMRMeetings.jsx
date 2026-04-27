import { useEffect, useState } from 'react'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'


const G = {
  900:'#072E25',800:'#0D5C4A',700:'#0F7A62',600:'#118A6F',
  500:'#13A07F',400:'#3DB897',200:'#A8E6D8',100:'#D4F3EC',
  50:'#EBF9F5',25:'#F4FCFA',
}

const statusConfig = {
  pending:  { bg:'#FFF7ED', color:'#C2410C', border:'#FED7AA', dot:'#F97316', label:'Pending'  },
  accepted: { bg:G[50],    color:G[800],    border:G[200],    dot:G[500],    label:'Accepted'  },
  rejected: { bg:'#FEF2F2', color:'#991B1B', border:'#FECACA', dot:'#DC2626', label:'Rejected' },
  completed:{ bg:G[25],    color:G[700],    border:G[100],    dot:G[400],    label:'Completed' },
}

function MeetingCard({ meeting, onAction, working }) {
  const s = statusConfig[meeting.status] || statusConfig.pending
  return (
    <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${meeting.status==='pending' ? '#FED7AA' : G[100]}`, padding:'20px 22px', boxShadow:`0 2px 12px rgba(13,92,74,0.07)`, display:'flex', flexDirection:'column', gap:'14px' }}>
      {/* Top row */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
          <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:G[50], border:`1px solid ${G[200]}`, display:'grid', placeItems:'center', fontSize:'18px', flexShrink:0 }}>ðŸ’Š</div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'15px', fontWeight:700, color:G[900], marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {meeting.mr_name || 'Medical Representative'}
            </div>
            <div style={{ fontSize:'12px', color:'#64748B' }}>{meeting.company || 'Pharmaceutical Company'}</div>
          </div>
        </div>
        <span style={{ background:s.bg, color:s.color, border:`1px solid ${s.border}`, borderRadius:'999px', padding:'4px 12px', fontSize:'11px', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'5px', flexShrink:0 }}>
          <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:s.dot, display:'inline-block' }} />
          {s.label}
        </span>
      </div>

      {/* Info grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px' }}>
        {[
          { icon:'ðŸ“…', label:'Requested Date', value: meeting.requested_date || 'â€”' },
          { icon:'â°', label:'Time Preference', value: meeting.time_preference || 'â€”' },
          { icon:'ðŸ·ï¸', label:'Product / Topic',  value: meeting.product || meeting.topic || 'General Discussion' },
          { icon:'ðŸ“', label:'Meeting Mode',     value: meeting.mode || 'In-Person' },
        ].map(info => (
          <div key={info.label} style={{ background:G[25], borderRadius:'10px', padding:'10px 12px', border:`1px solid ${G[100]}` }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'3px', display:'flex', alignItems:'center', gap:'4px' }}>
              {info.icon} {info.label}
            </div>
            <div style={{ fontSize:'12px', fontWeight:700, color:G[900], overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{info.value}</div>
          </div>
        ))}
      </div>

      {/* Purpose */}
      {meeting.purpose && (
        <div style={{ background:G[50], borderRadius:'11px', padding:'11px 14px', border:`1px solid ${G[100]}` }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'4px' }}>Purpose</div>
          <p style={{ fontSize:'12px', color:G[800], margin:0, lineHeight:1.6 }}>{meeting.purpose}</p>
        </div>
      )}

      {/* Actions */}
      {meeting.status === 'pending' && (
        <div style={{ display:'flex', gap:'8px', paddingTop:'2px' }}>
          <button onClick={() => onAction(meeting.id,'accepted')} disabled={working===meeting.id}
            style={{ flex:1, padding:'10px', borderRadius:'11px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            âœ“ Accept Meeting
          </button>
          <button onClick={() => onAction(meeting.id,'rejected')} disabled={working===meeting.id}
            style={{ flex:1, padding:'10px', borderRadius:'11px', border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
            âœ• Decline
          </button>
        </div>
      )}
      {meeting.status === 'accepted' && (
        <div style={{ display:'flex', gap:'8px' }}>
          <div style={{ flex:1, padding:'10px', borderRadius:'11px', background:G[50], border:`1px solid ${G[200]}`, textAlign:'center', fontSize:'12px', fontWeight:700, color:G[800] }}>
            âœ… Meeting Accepted
          </div>
          <button onClick={() => onAction(meeting.id,'completed')} disabled={working===meeting.id}
            style={{ flex:1, padding:'10px', borderRadius:'11px', border:`1px solid ${G[100]}`, background:G[25], color:G[700], fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            Mark Completed
          </button>
        </div>
      )}
    </div>
  )
}

export default function DoctorMRMeetings() {
  const token = localStorage.getItem('token')
  const [meetings, setMeetings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')
  const [working,  setWorking]  = useState(null)
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios.get(`${API_BASE_URL}/api/mr/meetings/doctor`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => setMeetings(Array.isArray(r.data) ? r.data : []))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false))
  }, [token])

  const showToast = (msg, ok=true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  const handleAction = async (id, newStatus) => {
    setWorking(id)
    try {
      await axios.put(`${API_BASE_URL}/api/mr/meetings/${id}/status`, { status: newStatus }, { headers:{ Authorization:`Bearer ${token}` } })
      setMeetings(prev => prev.map(m => m.id === id ? { ...m, status: newStatus } : m))
      const msgs = { accepted:'Meeting accepted!', rejected:'Meeting declined.', completed:'Meeting marked as completed.' }
      showToast(msgs[newStatus] || 'Updated.')
    } catch { showToast('Something went wrong.', false) }
    finally { setWorking(null) }
  }

  const TABS = ['all','pending','accepted','rejected','completed']
  const counts = TABS.reduce((a,t) => { a[t] = t==='all' ? meetings.length : meetings.filter(m=>m.status===t).length; return a }, {})
  const visible = filter==='all' ? meetings : meetings.filter(m=>m.status===filter)

  return (
    <div style={{ background:`linear-gradient(160deg,${G[25]} 0%,${G[50]} 50%,#F0FDFA 100%)`, minHeight:'100vh' }}>
      {toast && (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:1000, background: toast.ok ? G[800] : '#DC2626', color:'#fff', padding:'12px 20px', borderRadius:'12px', fontWeight:700, fontSize:'13px', boxShadow:'0 8px 24px rgba(0,0,0,0.18)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Header */}
        <div style={{ borderRadius:'22px', overflow:'hidden', marginBottom:'20px', boxShadow:`0 8px 32px rgba(13,92,74,0.18)` }}>
          <div style={{ background:`linear-gradient(135deg,${G[900]} 0%,${G[800]} 55%,${G[700]} 100%)`, padding:'26px 32px', position:'relative' }}>
            <div style={{ position:'absolute', top:'-40px', right:'100px', width:'180px', height:'180px', borderRadius:'50%', background:'rgba(168,230,216,0.07)', pointerEvents:'none' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'14px', position:'relative' }}>
              <div>
                <div style={{ fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:G[200], fontWeight:700, marginBottom:'5px' }}>Doctor Panel</div>
                <h1 style={{ fontSize:'28px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>MR Meeting Requests</h1>
                <p style={{ fontSize:'13px', color:G[100], margin:0 }}>Review meeting requests from medical representatives about products and research updates.</p>
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[
                  { label:'Total',    value:counts.all,      color:G[100] },
                  { label:'Pending',  value:counts.pending,  color:'#FEF08A' },
                  { label:'Accepted', value:counts.accepted, color:G[200] },
                ].map(c => (
                  <div key={c.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)', borderRadius:'12px', padding:'8px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:'20px', fontWeight:700, color:c.color }}>{loading ? 'â€”' : c.value}</div>
                    <div style={{ fontSize:'10px', fontWeight:700, color:c.color, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.07em' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${G[100]}`, padding:'13px 18px', marginBottom:'18px', display:'flex', gap:'7px', flexWrap:'wrap', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ padding:'7px 15px', borderRadius:'10px', border:`1px solid ${filter===t ? G[200] : '#E2E8F0'}`, background: filter===t ? G[50] : '#fff', color: filter===t ? G[800] : '#64748B', fontWeight:700, fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.15s' }}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              <span style={{ background: filter===t ? G[200] : '#F1F5F9', color: filter===t ? G[800] : '#94A3B8', borderRadius:'999px', padding:'1px 7px', fontSize:'10px', fontWeight:700 }}>{counts[t]}</span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        {loading
          ? <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'48px', textAlign:'center', color:'#94A3B8', fontSize:'14px' }}>Loading meetingsâ€¦</div>
          : visible.length === 0
            ? <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'56px', textAlign:'center' }}>
                <div style={{ fontSize:'36px', marginBottom:'12px' }}>ðŸ’Š</div>
                <div style={{ fontSize:'16px', fontWeight:700, color:G[900], marginBottom:'5px' }}>No meetings here</div>
                <div style={{ fontSize:'13px', color:'#94A3B8' }}>Medical representatives will appear here when they send requests.</div>
              </div>
            : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(360px,1fr))', gap:'14px' }}>
                {visible.map(m => <MeetingCard key={m.id} meeting={m} onAction={handleAction} working={working} />)}
              </div>
        }
      </div>
    </div>
  )
}
