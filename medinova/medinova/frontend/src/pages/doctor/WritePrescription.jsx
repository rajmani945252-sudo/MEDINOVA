import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { EMOJI, SYMBOL } from '@/utils/ui'


const G = {
  900:'#072E25',800:'#0D5C4A',700:'#0F7A62',600:'#118A6F',
  500:'#13A07F',400:'#3DB897',200:'#A8E6D8',100:'#D4F3EC',
  50:'#EBF9F5',25:'#F4FCFA',
}

const emptyMed = () => ({ name:'', dosage:'', frequency:'', duration:'', instructions:'' })

function MedRow({ med, index, onChange, onRemove, canRemove }) {
  return (
    <div style={{ background:G[25], borderRadius:'14px', border:`1px solid ${G[100]}`, padding:'16px', position:'relative' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
        <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700] }}>
          {EMOJI.medicine} Medicine #{index+1}
        </div>
        {canRemove && (
          <button onClick={() => onRemove(index)} style={{ width:'26px', height:'26px', borderRadius:'8px', border:'1px solid #FECACA', background:'#FEF2F2', color:'#DC2626', fontWeight:700, fontSize:'14px', cursor:'pointer', display:'grid', placeItems:'center', lineHeight:1 }}>{SYMBOL.cross}</button>
        )}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }} className="med-row-grid">
        {[
          { key:'name',         label:'Medicine Name',  placeholder:'e.g. Paracetamol 500mg' },
          { key:'dosage',       label:'Dosage',         placeholder:'e.g. 1 tablet' },
          { key:'frequency',    label:'Frequency',      placeholder:'e.g. Twice daily' },
          { key:'duration',     label:'Duration',       placeholder:'e.g. 5 days' },
        ].map(f => (
          <div key={f.key}>
            <label style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], display:'block', marginBottom:'4px' }}>{f.label}</label>
            <input value={med[f.key]} onChange={e => onChange(index, f.key, e.target.value)}
              placeholder={f.placeholder}
              style={{ width:'100%', padding:'9px 12px', borderRadius:'9px', border:`1px solid ${G[100]}`, background:'#fff', fontSize:'13px', color:G[900], outline:'none', boxSizing:'border-box' }} />
          </div>
        ))}
        <div style={{ gridColumn:'1 / -1' }}>
          <label style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.07em', color:G[700], display:'block', marginBottom:'4px' }}>Special Instructions</label>
          <input value={med.instructions} onChange={e => onChange(index, 'instructions', e.target.value)}
            placeholder="e.g. Take after meals, avoid alcohol"
            style={{ width:'100%', padding:'9px 12px', borderRadius:'9px', border:`1px solid ${G[100]}`, background:'#fff', fontSize:'13px', color:G[900], outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>
    </div>
  )
}

export default function WritePrescription() {
  const { id }     = useParams()
  const location   = useLocation()
  const navigate   = useNavigate()
  const token      = localStorage.getItem('token')
  const doctor     = JSON.parse(localStorage.getItem('user') || '{}')

  const apt = location.state?.appointment || {}

  const [medicines,   setMedicines]   = useState([emptyMed()])
  const [diagnosis,   setDiagnosis]   = useState('')
  const [notes,       setNotes]       = useState('')
  const [followUp,    setFollowUp]    = useState('')
  const [tests,       setTests]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState(null)
  const [submitted,   setSubmitted]   = useState(false)

  const showToast = (msg, ok=true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500) }

  const addMed    = () => setMedicines(m => [...m, emptyMed()])
  const removeMed = i => setMedicines(m => m.filter((_,idx) => idx !== i))
  const changeMed = (i, key, val) => setMedicines(m => m.map((med, idx) => idx===i ? { ...med, [key]:val } : med))

  const handleSubmit = async () => {
    if (!diagnosis.trim()) { showToast('Please enter a diagnosis.', false); return }
    if (medicines.some(m => !m.name.trim())) { showToast('Please fill in all medicine names.', false); return }
    setSaving(true)
    try {
      await axios.post(`${API_BASE_URL}/api/prescriptions`, {
        appointment_id: id,
        diagnosis, notes, follow_up_date: followUp, tests_recommended: tests,
        medicines,
      }, { headers:{ Authorization:`Bearer ${token}` } })
      setSubmitted(true)
      showToast('Prescription submitted successfully!')
    } catch { showToast('Failed to submit prescription.', false) }
    finally { setSaving(false) }
  }

  if (submitted) return (
    <div style={{ background:`linear-gradient(160deg,${G[25]} 0%,${G[50]} 50%,#F0FDFA 100%)`, minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ background:'#fff', borderRadius:'24px', padding:'48px 40px', textAlign:'center', maxWidth:'440px', boxShadow:`0 16px 48px rgba(13,92,74,0.14)`, border:`1px solid ${G[100]}` }}>
        <div style={{ width:'72px', height:'72px', borderRadius:'20px', background:G[50], border:`1px solid ${G[200]}`, display:'grid', placeItems:'center', fontSize:'30px', margin:'0 auto 18px' }}>{SYMBOL.check}</div>
        <h2 style={{ fontSize:'22px', fontWeight:700, color:G[900], marginBottom:'8px' }}>Prescription Sent!</h2>
        <p style={{ fontSize:'14px', color:'#64748B', lineHeight:1.7, marginBottom:'28px' }}>
          The prescription for <strong>{apt.patient_name || 'the patient'}</strong> has been submitted and will be visible in their medical records.
        </p>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={() => navigate('/doctor/appointments')} style={{ flex:1, padding:'12px', borderRadius:'12px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
            Back to Appointments
          </button>
          <button onClick={() => { setSubmitted(false); setMedicines([emptyMed()]); setDiagnosis(''); setNotes(''); setFollowUp(''); setTests('') }}
            style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', background:G[800], color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
            Write Another
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ background:`linear-gradient(160deg,${G[25]} 0%,${G[50]} 50%,#F0FDFA 100%)`, minHeight:'100vh' }}>
      {toast && (
        <div style={{ position:'fixed', top:'20px', right:'20px', zIndex:1000, background: toast.ok ? G[800] : '#DC2626', color:'#fff', padding:'12px 20px', borderRadius:'12px', fontWeight:700, fontSize:'13px', boxShadow:'0 8px 24px rgba(0,0,0,0.18)' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:'820px', margin:'0 auto', padding:'24px 20px' }}>

        {/* Header */}
        <div style={{ borderRadius:'22px', overflow:'hidden', marginBottom:'20px', boxShadow:`0 8px 32px rgba(13,92,74,0.18)` }}>
          <div style={{ background:`linear-gradient(135deg,${G[900]} 0%,${G[800]} 55%,${G[700]} 100%)`, padding:'26px 30px', position:'relative' }}>
            <div style={{ position:'absolute', top:'-40px', right:'80px', width:'160px', height:'160px', borderRadius:'50%', background:'rgba(168,230,216,0.08)', pointerEvents:'none' }} />
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'14px', position:'relative' }}>
              <div>
                <div style={{ fontSize:'11px', letterSpacing:'0.12em', textTransform:'uppercase', color:G[200], fontWeight:700, marginBottom:'5px' }}>Digital Prescription</div>
                <h1 style={{ fontSize:'26px', fontWeight:700, color:'#fff', margin:'0 0 5px' }}>{EMOJI.memo} Write Prescription</h1>
                <p style={{ fontSize:'13px', color:G[100], margin:0 }}>
                  Patient: <strong style={{ color:'#fff' }}>{apt.patient_name || `Appointment #${id}`}</strong>
                  {apt.date && <span> {SYMBOL.bullet} {apt.date} {apt.time_slot}</span>}
                </p>
              </div>
              <button onClick={() => navigate(-1)} style={{ padding:'10px 18px', borderRadius:'12px', border:'1.5px solid rgba(168,230,216,0.3)', background:'rgba(255,255,255,0.09)', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
                {SYMBOL.arrowLeft} Back
              </button>
            </div>
          </div>
        </div>

        {/* Doctor & Patient info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'18px' }} className="rx-info-grid">
          {[
            { title:`${EMOJI.doctor} Prescribing Doctor`, lines:[ `Dr. ${doctor.name || 'Doctor'}`, doctor.specialization || 'Specialist', doctor.hospital || 'MediNova Clinic' ] },
            { title:`${EMOJI.person} Patient Details`, lines:[ apt.patient_name || SYMBOL.emDash, `Date: ${apt.date || SYMBOL.emDash}`, `Slot: ${apt.time_slot || SYMBOL.emDash}` ] },
          ].map(card => (
            <div key={card.title} style={{ background:'#fff', borderRadius:'16px', border:`1px solid ${G[100]}`, padding:'18px 20px', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
              <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700], marginBottom:'10px' }}>{card.title}</div>
              {card.lines.map((l,i) => (
                <div key={i} style={{ fontSize: i===0 ? '14px' : '12px', fontWeight: i===0 ? 700 : 500, color: i===0 ? G[900] : '#64748B', marginBottom:'3px' }}>{l}</div>
              ))}
            </div>
          ))}
        </div>

        {/* Diagnosis */}
        <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'20px 22px', marginBottom:'14px', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700], marginBottom:'10px' }}>{EMOJI.stethoscope} Diagnosis & Chief Complaint</div>
          <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} rows={3}
            placeholder={`Enter primary diagnosis, chief complaint, clinical findings${SYMBOL.ellipsis}`}
            style={{ width:'100%', padding:'11px 14px', borderRadius:'11px', border:`1px solid ${G[100]}`, background:G[25], fontSize:'13px', color:G[900], outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', lineHeight:1.6 }} />
        </div>

        {/* Medicines */}
        <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'20px 22px', marginBottom:'14px', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700] }}>{EMOJI.medicine} Medicines Prescribed</div>
            <button onClick={addMed} style={{ padding:'7px 14px', borderRadius:'9px', border:`1px solid ${G[200]}`, background:G[50], color:G[800], fontWeight:700, fontSize:'12px', cursor:'pointer', display:'flex', alignItems:'center', gap:'5px' }}>
              + Add Medicine
            </button>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {medicines.map((med,i) => (
              <MedRow key={i} med={med} index={i} onChange={changeMed} onRemove={removeMed} canRemove={medicines.length > 1} />
            ))}
          </div>
        </div>

        {/* Tests & Follow-up */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }} className="rx-info-grid">
          <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'20px 22px', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700], marginBottom:'10px' }}>{EMOJI.microscope} Tests Recommended</div>
            <textarea value={tests} onChange={e => setTests(e.target.value)} rows={3}
              placeholder={`CBC, Blood sugar, X-Ray${SYMBOL.ellipsis}`}
              style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:`1px solid ${G[100]}`, background:G[25], fontSize:'13px', color:G[900], outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
          <div style={{ background:'#fff', borderRadius:'18px', border:`1px solid ${G[100]}`, padding:'20px 22px', boxShadow:`0 2px 8px rgba(13,92,74,0.05)` }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700], marginBottom:'10px' }}>{EMOJI.calendar} Follow-up Date</div>
            <input type="date" value={followUp} onChange={e => setFollowUp(e.target.value)}
              style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:`1px solid ${G[100]}`, background:G[25], fontSize:'13px', color:G[900], outline:'none', boxSizing:'border-box', marginBottom:'10px' }} />
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:G[700], marginBottom:'6px' }}>{EMOJI.clipboard} Additional Notes</div>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder={`Rest advice, diet, lifestyle notes${SYMBOL.ellipsis}`}
              style={{ width:'100%', padding:'10px 13px', borderRadius:'10px', border:`1px solid ${G[100]}`, background:G[25], fontSize:'13px', color:G[900], outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box' }} />
          </div>
        </div>

        {/* Submit */}
        <div style={{ background:`linear-gradient(135deg,${G[900]} 0%,${G[800]} 100%)`, borderRadius:'18px', padding:'20px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'14px', boxShadow:`0 8px 24px rgba(13,92,74,0.22)` }}>
          <div>
            <div style={{ fontSize:'14px', fontWeight:700, color:'#fff', marginBottom:'3px' }}>Ready to submit?</div>
            <div style={{ fontSize:'12px', color:G[100] }}>The prescription will be saved and sent to the patient.</div>
          </div>
          <div style={{ display:'flex', gap:'10px' }}>
            <button onClick={() => navigate(-1)} style={{ padding:'12px 22px', borderRadius:'12px', border:'1.5px solid rgba(255,255,255,0.2)', background:'rgba(255,255,255,0.09)', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer' }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={saving} style={{ padding:'12px 28px', borderRadius:'12px', border:'none', background:G[400], color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', opacity: saving ? 0.7 : 1, display:'flex', alignItems:'center', gap:'7px' }}>
              {saving ? `${SYMBOL.hourglass} Submitting${SYMBOL.ellipsis}` : `${SYMBOL.check} Submit Prescription`}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 600px) { .rx-info-grid { grid-template-columns: 1fr !important; } .med-row-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
