import { useEffect, useState } from 'react'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const G = {
  900:'#072E25',800:'#0D5C4A',700:'#0F7A62',600:'#118A6F',
  500:'#13A07F',400:'#3DB897',200:'#A8E6D8',100:'#D4F3EC',
  50:'#EBF9F5',25:'#F4FCFA',
}

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']

const DEFAULT_SLOTS = [
  '09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','12:30 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM',
  '04:00 PM','04:30 PM','05:00 PM','05:30 PM','06:00 PM',
]

function DayCard({ day, schedule, onChange }) {
  const isOn = schedule?.enabled ?? false
  return (
    <div style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${isOn ? G[200] : '#E2E8F0'}`, overflow:'hidden', boxShadow:`0 2px 10px rgba(13,92,74,0.05)`, transition:'border-color 0.2s' }}>
      {/* Day header */}
      <div style={{ padding:'14px 16px', background: isOn ? G[50] : '#F8FAFC', borderBottom:`1px solid ${isOn ? G[100] : '#E2E8F0'}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontSize:'14px', fontWeight:700, color: isOn ? G[900] : '#94A3B8' }}>{day}</div>
          {isOn && <div style={{ fontSize:'11px', color:G[700], marginTop:'1px' }}>{(schedule?.slots || []).length} slot{(schedule?.slots || []).length !== 1 ? 's' : ''} selected</div>}
        </div>
        {/* Toggle */}
        <div onClick={() => onChange(day, 'enabled', !isOn)} style={{ width:'42px', height:'24px', borderRadius:'999px', background: isOn ? G[500] : '#CBD5E1', cursor:'pointer', position:'relative', transition:'background 0.2s', flexShrink:0 }}>
          <div style={{ position:'absolute', top:'3px', left: isOn ? '21px' : '3px', width:'18px', height:'18px', borderRadius:'50%', background:'#fff', boxShadow:'0 1px 4px rgba(0,0,0,0.18)', transition:'left 0.2s' }} />
        </div>
      </div>

      {/* Slots */}
      {isOn && (
        <div style={{ padding:'14px 16px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'10px' }}>Select Time Slots</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
            {DEFAULT_SLOTS.map(slot => {
              const active = (schedule?.slots || []).includes(slot)
              return (
                <button key={slot} onClick={() => {
                  const cur = schedule?.slots || []
                  onChange(day, 'slots', active ? cur.filter(s => s !== slot) : [...cur, slot])
                }} style={{ padding:'5px 10px', borderRadius:'8px', border:`1px solid ${active ? G[500] : G[100]}`, background: active ? G[500] : G[25], color: active ? '#fff' : G[800], fontWeight:700, fontSize:'11px', cursor:'pointer', transition:'all 0.15s' }}>
                  {slot}
                </button>
              )
            })}
          </div>
          {/* Max patients */}
          <div style={{ marginTop:'13px', display:'flex', alignItems:'center', gap:'10px' }}>
            <label style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], whiteSpace:'nowrap' }}>Max patients / slot:</label>
            <input type="number" min={1} max={10} value={schedule?.max_per_slot || 1}
              onChange={e => onChange(day, 'max_per_slot', parseInt(e.target.value)||1)}
              style={{ width:'60px', padding:'6px 10px', borderRadius:'8px', border:`1px solid ${G[100]}`, background:G[25], fontSize:'13px', color:G[900], fontWeight:700, outline:'none', textAlign:'center' }} />
          </div>
        </div>
      )}
      {!isOn && (
        <div style={{ padding:'14px 16px', textAlign:'center', color:'#CBD5E1', fontSize:'12px' }}>Day off — toggle to enable</div>
      )}
    </div>
  )
}

export default function DoctorAvailability() {
  const token = localStorage.getItem('token')
  const [schedule, setSchedule] = useState({})
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    axios.get(`${API_BASE_URL}/api/doctors/availability`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => {
        const data = r.data || {}
        const init = {}
        DAYS.forEach(d => { init[d] = data[d] || { enabled: false, slots: [], max_per_slot: 1 } })
        setSchedule(init)
      })
      .catch(() => {
        const init = {}
        DAYS.forEach(d => { init[d] = { enabled: false, slots: [], max_per_slot: 1 } })
        setSchedule(init)
      })
      .finally(() => setLoading(false))
  }, [token])

  const showToast = (msg, ok=true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000) }

  const handleChange = (day, key, value) => {
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [key]: value } }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await axios.put(`${API_BASE_URL}/api/doctors/availability`, schedule, { headers:{ Authorization:`Bearer ${token}` } })
      showToast('Availability schedule saved!')
    } catch { showToast('Failed to save schedule.', false) }
    finally { setSaving(false) }
  }

  const enabledDays  = DAYS.filter(d => schedule[d]?.enabled).length
  const totalSlots   = DAYS.reduce((s,d) => s + (schedule[d]?.slots?.length || 0), 0)

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
                <h1 style={{ fontSize:'28px', fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Availability Schedule</h1>
                <p style={{ fontSize:'13px', color:G[100], margin:0 }}>Set your working days and consultation time slots for patient booking.</p>
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[
                  { label:'Active Days',  value: loading ? '—' : enabledDays,  color:G[200] },
                  { label:'Total Slots',  value: loading ? '—' : totalSlots,   color:'#FEF08A' },
                ].map(c => (
                  <div key={c.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)', borderRadius:'12px', padding:'10px 18px', textAlign:'center' }}>
                    <div style={{ fontSize:'22px', fontWeight:700, color:c.color }}>{c.value}</div>
                    <div style={{ fontSize:'10px', fontWeight:700, color:c.color, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.07em' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${G[100]}`, padding:'14px 18px', marginBottom:'18px', display:'flex', gap:'9px', flexWrap:'wrap', alignItems:'center', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
          <span style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'#94A3B8', marginRight:'4px' }}>Quick Set:</span>
          <button onClick={() => { const n={}; DAYS.slice(0,5).forEach(d => { n[d]={ enabled:true, slots:DEFAULT_SLOTS.slice(0,8), max_per_slot:1 } }); ['Saturday','Sunday'].forEach(d => { n[d]={ enabled:false, slots:[], max_per_slot:1 } }); setSchedule(n) }}
            style={{ padding:'7px 14px', borderRadius:'9px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            Mon–Fri (Morning)
          </button>
          <button onClick={() => { const n={}; DAYS.forEach(d => { n[d]={ enabled:true, slots:DEFAULT_SLOTS.slice(0,10), max_per_slot:2 } }); setSchedule(n) }}
            style={{ padding:'7px 14px', borderRadius:'9px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            All Days
          </button>
          <button onClick={() => { const n={}; DAYS.forEach(d => { n[d]={ enabled:false, slots:[], max_per_slot:1 } }); setSchedule(n) }}
            style={{ padding:'7px 14px', borderRadius:'9px', border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            Clear All
          </button>
          <div style={{ marginLeft:'auto' }}>
            <button onClick={handleSave} disabled={saving} style={{ padding:'9px 24px', borderRadius:'11px', border:'none', background: saving ? '#94A3B8' : G[800], color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'7px' }}>
              {saving ? '⏳ Saving…' : '✓ Save Schedule'}
            </button>
          </div>
        </div>

        {/* Day cards grid */}
        {loading
          ? <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'48px', textAlign:'center', color:'#94A3B8', fontSize:'14px' }}>Loading schedule…</div>
          : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'14px' }}>
              {DAYS.map(day => (
                <DayCard key={day} day={day} schedule={schedule[day]} onChange={handleChange} />
              ))}
            </div>
        }

        {/* Bottom save bar */}
        <div style={{ marginTop:'20px', background:`linear-gradient(135deg,${G[900]} 0%,${G[800]} 100%)`, borderRadius:'18px', padding:'18px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'14px', boxShadow:`0 8px 24px rgba(13,92,74,0.22)` }}>
          <div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>
              {enabledDays} day{enabledDays!==1?'s':''} active · {totalSlots} total slots
            </div>
            <div style={{ fontSize:'12px', color:G[100] }}>Patients will only be able to book within your active slots.</div>
          </div>
          <button onClick={handleSave} disabled={saving} style={{ padding:'12px 28px', borderRadius:'12px', border:'none', background:G[400], color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity: saving ? 0.7 : 1 }}>
            {saving ? '⏳ Saving…' : '✓ Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}