import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'


const G = {
  900:'#072E25',800:'#0D5C4A',700:'#0F7A62',600:'#118A6F',
  500:'#13A07F',400:'#3DB897',200:'#A8E6D8',100:'#D4F3EC',
  50:'#EBF9F5',25:'#F4FCFA',
}

const TABS = [
  { key:'overview',      label:'Overview',      icon:'ðŸ“Š' },
  { key:'prescriptions', label:'Prescriptions', icon:'ðŸ“' },
  { key:'appointments',  label:'Appointments',  icon:'ðŸ“…' },
  { key:'reports',       label:'Reports',       icon:'ðŸ”¬' },
]

function Section({ title, icon, children, accent }) {
  return (
    <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${accent || G[100]}`, padding:'20px 22px', boxShadow:`0 2px 10px rgba(13,92,74,0.05)` }}>
      <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:G[700], marginBottom:'14px', display:'flex', alignItems:'center', gap:'6px' }}>
        <span>{icon}</span> {title}
      </div>
      {children}
    </div>
  )
}

function InfoGrid({ items }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'10px' }}>
      {items.map(item => (
        <div key={item.label} style={{ background:G[25], borderRadius:'12px', padding:'12px 14px', border:`1px solid ${G[100]}` }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
            {item.icon} {item.label}
          </div>
          <div style={{ fontSize:'13px', fontWeight:700, color:G[900] }}>{item.value || 'â€”'}</div>
        </div>
      ))}
    </div>
  )
}

function PrescriptionCard({ rx }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ borderRadius:'14px', border:`1px solid ${G[100]}`, overflow:'hidden' }}>
      <div onClick={() => setExpanded(!expanded)} style={{ padding:'14px 16px', background:G[25], cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px' }}>
        <div>
          <div style={{ fontSize:'13px', fontWeight:700, color:G[900], marginBottom:'2px' }}>{rx.diagnosis || 'Prescription'}</div>
          <div style={{ fontSize:'11px', color:'#64748B' }}>
            {rx.date || rx.created_at?.slice(0,10) || 'â€”'}
            {rx.medicines?.length > 0 && <span> Â· {rx.medicines.length} medicine{rx.medicines.length!==1?'s':''}</span>}
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {rx.follow_up_date && <span style={{ background:G[50], color:G[800], border:`1px solid ${G[200]}`, borderRadius:'999px', padding:'3px 9px', fontSize:'11px', fontWeight:700 }}>Follow-up: {rx.follow_up_date}</span>}
          <span style={{ fontSize:'18px', color:G[600], transition:'transform 0.2s', display:'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0)' }}>â€º</span>
        </div>
      </div>
      {expanded && (
        <div style={{ padding:'16px', background:'#fff', borderTop:`1px solid ${G[100]}` }}>
          {rx.medicines?.length > 0 && (
            <div style={{ marginBottom:'14px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'8px' }}>ðŸ’Š Medicines</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                {rx.medicines.map((m,i) => (
                  <div key={i} style={{ background:G[25], borderRadius:'10px', padding:'10px 13px', border:`1px solid ${G[100]}`, display:'grid', gridTemplateColumns:'minmax(0,1.5fr) repeat(3,1fr)', gap:'8px' }}>
                    <div>
                      <div style={{ fontSize:'12px', fontWeight:700, color:G[900] }}>{m.name}</div>
                      {m.instructions && <div style={{ fontSize:'11px', color:'#64748B' }}>{m.instructions}</div>}
                    </div>
                    {[['Dosage',m.dosage],['Frequency',m.frequency],['Duration',m.duration]].map(([lbl,val]) => (
                      <div key={lbl}>
                        <div style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', color:G[700], marginBottom:'2px' }}>{lbl}</div>
                        <div style={{ fontSize:'12px', color:G[800], fontWeight:600 }}>{val || 'â€”'}</div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          {rx.tests_recommended && (
            <div style={{ marginBottom:'10px' }}>
              <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'5px' }}>ðŸ”¬ Tests</div>
              <div style={{ fontSize:'12px', color:G[800], background:G[25], borderRadius:'9px', padding:'9px 12px', border:`1px solid ${G[100]}` }}>{rx.tests_recommended}</div>
            </div>
          )}
          {rx.notes && (
            <div>
              <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], marginBottom:'5px' }}>ðŸ“‹ Notes</div>
              <div style={{ fontSize:'12px', color:G[800], background:G[25], borderRadius:'9px', padding:'9px 12px', border:`1px solid ${G[100]}` }}>{rx.notes}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PatientMedicalHistory() {
  const { patientId } = useParams()
  const navigate       = useNavigate()
  const token          = localStorage.getItem('token')

  const [patient,       setPatient]       = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [appointments,  setAppointments]  = useState([])
  const [reports,       setReports]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [activeTab,     setActiveTab]     = useState('overview')

  useEffect(() => {
    if (!token || !patientId) { setLoading(false); return }
    Promise.all([
      axios.get(`${API_BASE_URL}/api/patients/${patientId}`,              { headers:{ Authorization:`Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/api/prescriptions/patient/${patientId}`, { headers:{ Authorization:`Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/api/appointments/patient/${patientId}`,  { headers:{ Authorization:`Bearer ${token}` } }),
      axios.get(`${API_BASE_URL}/api/reports/patient/${patientId}`,       { headers:{ Authorization:`Bearer ${token}` } }).catch(() => ({ data:[] })),
    ]).then(([p, rx, apts, reps]) => {
      setPatient(p.data)
      setPrescriptions(Array.isArray(rx.data)  ? rx.data  : [])
      setAppointments(Array.isArray(apts.data) ? apts.data : [])
      setReports(Array.isArray(reps.data)      ? reps.data : [])
    }).catch(() => {
      setPatient(null)
      setPrescriptions([])
      setAppointments([])
      setReports([])
    })
    .finally(() => setLoading(false))
  }, [patientId, token])

  const initials = (patient?.name || 'P').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  return (
    <div style={{ background:`linear-gradient(160deg,${G[25]} 0%,${G[50]} 50%,#F0FDFA 100%)`, minHeight:'100vh' }}>
      <div style={{ maxWidth:'1000px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Header */}
        <div style={{ borderRadius:'22px', overflow:'hidden', marginBottom:'20px', boxShadow:`0 8px 32px rgba(13,92,74,0.18)` }}>
          <div style={{ background:`linear-gradient(135deg,${G[900]} 0%,${G[800]} 55%,${G[700]} 100%)`, padding:'26px 32px', position:'relative' }}>
            <div style={{ position:'absolute', top:'-40px', right:'80px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(168,230,216,0.08)', pointerEvents:'none' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'14px', position:'relative' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                <div style={{ width:'60px', height:'60px', borderRadius:'16px', background:'rgba(255,255,255,0.14)', border:'1.5px solid rgba(255,255,255,0.22)', display:'grid', placeItems:'center', fontSize:'22px', fontWeight:700, color:'#fff', flexShrink:0 }}>
                  {loading ? 'â€¦' : initials}
                </div>
                <div>
                  <div style={{ fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:G[200], fontWeight:700, marginBottom:'4px' }}>Medical History</div>
                  <h1 style={{ fontSize:'24px', fontWeight:700, color:'#fff', margin:'0 0 4px' }}>{loading ? 'Loadingâ€¦' : patient?.name || 'Patient'}</h1>
                  <p style={{ fontSize:'13px', color:G[100], margin:0 }}>{patient?.email || ''}{patient?.phone ? ` Â· ${patient.phone}` : ''}</p>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {[
                  { label:'Prescriptions', value:prescriptions.length, color:G[200] },
                  { label:'Appointments',  value:appointments.length,  color:'#FEF08A' },
                  { label:'Reports',       value:reports.length,       color:G[100] },
                ].map(c => (
                  <div key={c.label} style={{ background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.16)', borderRadius:'12px', padding:'8px 14px', textAlign:'center' }}>
                    <div style={{ fontSize:'18px', fontWeight:700, color:c.color }}>{loading ? 'â€”' : c.value}</div>
                    <div style={{ fontSize:'10px', fontWeight:700, color:c.color, opacity:0.8, textTransform:'uppercase', letterSpacing:'0.07em' }}>{c.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:'#fff', borderRadius:'14px', border:`1px solid ${G[100]}`, padding:'10px 14px', marginBottom:'18px', display:'flex', gap:'6px', flexWrap:'wrap', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{ padding:'8px 16px', borderRadius:'10px', border:`1px solid ${activeTab===t.key ? G[200] : 'transparent'}`, background: activeTab===t.key ? G[50] : 'transparent', color: activeTab===t.key ? G[800] : '#64748B', fontWeight:700, fontSize:'13px', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', transition:'all 0.15s' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading
          ? <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'48px', textAlign:'center', color:'#94A3B8' }}>Loading patient historyâ€¦</div>
          : <>
              {/* Overview tab */}
              {activeTab === 'overview' && (
                <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                  <Section title="Patient Information" icon="ðŸ‘¤">
                    <InfoGrid items={[
                      { icon:'ðŸŽ‚', label:'Date of Birth', value: patient?.dob },
                      { icon:'âš§',  label:'Gender',        value: patient?.gender },
                      { icon:'ðŸ©¸', label:'Blood Group',   value: patient?.blood_group },
                      { icon:'ðŸ“', label:'Height',        value: patient?.height ? `${patient.height} cm` : null },
                      { icon:'âš–ï¸', label:'Weight',        value: patient?.weight ? `${patient.weight} kg` : null },
                      { icon:'ðŸ“±', label:'Phone',         value: patient?.phone },
                    ]} />
                  </Section>
                  {patient?.allergies && (
                    <Section title="Allergies & Conditions" icon="âš ï¸" accent="#FED7AA">
                      <div style={{ background:'#FFF7ED', borderRadius:'11px', padding:'13px 15px', border:'1px solid #FED7AA' }}>
                        <div style={{ fontSize:'13px', color:'#92400E', fontWeight:600, lineHeight:1.6 }}>{patient.allergies}</div>
                      </div>
                    </Section>
                  )}
                  {patient?.chronic_conditions && (
                    <Section title="Chronic Conditions" icon="ðŸ¥">
                      <div style={{ background:G[25], borderRadius:'11px', padding:'13px 15px', border:`1px solid ${G[100]}` }}>
                        <div style={{ fontSize:'13px', color:G[800], fontWeight:600, lineHeight:1.6 }}>{patient.chronic_conditions}</div>
                      </div>
                    </Section>
                  )}
                  <Section title="Summary" icon="ðŸ“Š">
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'10px' }}>
                      {[
                        { label:'Total Visits',       value:appointments.length,  color:G[800], bg:G[50] },
                        { label:'Prescriptions',      value:prescriptions.length, color:G[700], bg:G[25] },
                        { label:'Completed Sessions', value:appointments.filter(a=>a.status==='completed').length, color:G[600], bg:G[50] },
                      ].map(s => (
                        <div key={s.label} style={{ background:s.bg, borderRadius:'12px', padding:'14px', border:`1px solid ${G[100]}`, textAlign:'center' }}>
                          <div style={{ fontSize:'26px', fontWeight:700, color:s.color }}>{s.value}</div>
                          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:s.color, opacity:0.75 }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

              {/* Prescriptions tab */}
              {activeTab === 'prescriptions' && (
                <Section title="Prescription History" icon="ðŸ“">
                  {prescriptions.length === 0
                    ? <div style={{ textAlign:'center', padding:'32px 0', color:'#94A3B8' }}>No prescriptions recorded yet.</div>
                    : <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                        {prescriptions.map(rx => <PrescriptionCard key={rx.id} rx={rx} />)}
                      </div>
                  }
                </Section>
              )}

              {/* Appointments tab */}
              {activeTab === 'appointments' && (
                <Section title="Appointment History" icon="ðŸ“…">
                  {appointments.length === 0
                    ? <div style={{ textAlign:'center', padding:'32px 0', color:'#94A3B8' }}>No appointments found.</div>
                    : <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        {appointments.map(apt => {
                          const colors = { confirmed:{bg:G[50],color:G[800],border:G[200]}, completed:{bg:G[25],color:G[700],border:G[100]}, pending:{bg:'#FFF7ED',color:'#C2410C',border:'#FED7AA'}, rejected:{bg:'#FEF2F2',color:'#991B1B',border:'#FECACA'} }
                          const c = colors[apt.status] || colors.pending
                          return (
                            <div key={apt.id} style={{ background:G[25], borderRadius:'12px', border:`1px solid ${G[100]}`, padding:'12px 15px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'10px' }}>
                              <div>
                                <div style={{ fontSize:'13px', fontWeight:700, color:G[900], marginBottom:'2px' }}>{apt.date} Â· {apt.time_slot}</div>
                                <div style={{ fontSize:'11px', color:'#64748B' }}>{apt.reason || 'General consultation'}</div>
                              </div>
                              <span style={{ background:c.bg, color:c.color, border:`1px solid ${c.border}`, borderRadius:'999px', padding:'4px 11px', fontSize:'11px', fontWeight:700, whiteSpace:'nowrap' }}>
                                {apt.status?.charAt(0).toUpperCase()+apt.status?.slice(1)}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                  }
                </Section>
              )}

              {/* Reports tab */}
              {activeTab === 'reports' && (
                <Section title="Medical Reports & Tests" icon="ðŸ”¬">
                  {reports.length === 0
                    ? <div style={{ textAlign:'center', padding:'32px 0', color:'#94A3B8' }}>No reports uploaded yet.</div>
                    : <div style={{ display:'flex', flexDirection:'column', gap:'9px' }}>
                        {reports.map(rep => (
                          <div key={rep.id} style={{ background:G[25], borderRadius:'13px', border:`1px solid ${G[100]}`, padding:'14px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
                              <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:G[50], border:`1px solid ${G[200]}`, display:'grid', placeItems:'center', fontSize:'16px', flexShrink:0 }}>ðŸ“„</div>
                              <div style={{ minWidth:0 }}>
                                <div style={{ fontSize:'13px', fontWeight:700, color:G[900], marginBottom:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{rep.name || rep.file_name || 'Report'}</div>
                                <div style={{ fontSize:'11px', color:'#64748B' }}>{rep.date || rep.created_at?.slice(0,10) || 'â€”'} Â· {rep.type || 'Medical Report'}</div>
                              </div>
                            </div>
                            {rep.url && (
                              <a href={rep.url} target="_blank" rel="noopener noreferrer" style={{ padding:'7px 14px', borderRadius:'9px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'12px', textDecoration:'none', whiteSpace:'nowrap' }}>
                                View â†’
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                  }
                </Section>
              )}
            </>
        }
      </div>
    </div>
  )
}
