import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'
import { EMOJI, SYMBOL } from '@/utils/ui'


function HealthCard() {
  const [data,     setData]     = useState(null)
  const [editing,  setEditing]  = useState(false)
  const [form,     setForm]     = useState({ blood_group:'', height:'', weight:'', allergies:'', conditions:'' })
  const [msg,      setMsg]      = useState('')
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  const h     = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/smart/health-card`, h)
      .then(res => {
        setData(res.data)
        if (res.data.healthRecord) {
          const r = res.data.healthRecord
          setForm({ blood_group: r.blood_group||'', height: r.height||'', weight: r.weight||'', allergies: r.allergies||'', conditions: r.conditions||'' })
        }
      }).catch(() => setData({ user, totalAppointments: 0, healthRecord: null }))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_BASE_URL}/api/smart/health-card`, form, h)
      setMsg('Health record saved!')
      setEditing(false)
      axios.get(`${API_BASE_URL}/api/smart/health-card`, h).then(res => setData(res.data))
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Unable to save health record right now.'); setTimeout(() => setMsg(''), 3000) }
  }

  const bloodGroups = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
  const bmi = form.height && form.weight
    ? (parseFloat(form.weight) / ((parseFloat(form.height)/100) ** 2)).toFixed(1)
    : null

  const bmiStatus = bmi
    ? bmi < 18.5 ? { label:'Underweight', color:'#1565C0' }
    : bmi < 25   ? { label:'Normal',      color:'#2E7D32' }
    : bmi < 30   ? { label:'Overweight',  color:'#E65100' }
    : { label:'Obese', color:'#C62828' }
    : null

  return (
    <div className="page">
      <div className="page-content">

        <div className="fade-up" style={{ marginBottom:'28px' }}>
          <Link to="/patient/dashboard" style={{ color:'var(--color-text-muted)', fontSize:'13px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px', marginBottom:'12px' }}>
            {SYMBOL.arrowLeft} Back to Dashboard
          </Link>
          <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'32px', color:'var(--color-primary)', marginBottom:'6px' }}>
            Digital Health Card
          </h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:'14px' }}>Your complete health profile in one place</p>
        </div>

        {msg && (
          <div style={{ background:'#E8F5E9', color:'#2E7D32', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:'20px', borderLeft:'3px solid #43A047', fontWeight:'600' }}>
            {SYMBOL.check} {msg}
          </div>
        )}

        {data && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.5fr', gap:'24px', alignItems:'start' }}>

            <div className="fade-up-1">
              <div style={{ background:'var(--color-primary)', borderRadius:'var(--radius-xl)', padding:'28px', color:'white', position:'relative', overflow:'hidden', marginBottom:'16px' }}>
                <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'150px', height:'150px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
                <div style={{ position:'absolute', bottom:'-20px', left:'-20px', width:'100px', height:'100px', borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

                <div style={{ position:'relative', zIndex:1 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
                    <div style={{ background:'rgba(255,255,255,0.2)', borderRadius:'12px', padding:'8px 14px', fontSize:'13px', fontWeight:'600' }}>
                      medinova health card
                    </div>
                    <div style={{ fontSize:'28px' }}>{EMOJI.hospital}</div>
                  </div>

                  <div style={{ width:'52px', height:'52px', background:'rgba(255,255,255,0.2)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', fontWeight:'700', marginBottom:'12px' }}>
                    {data.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ fontSize:'20px', fontWeight:'700', marginBottom:'4px' }}>{data.user?.name}</div>
                  <div style={{ fontSize:'13px', opacity:0.8, marginBottom:'20px' }}>{data.user?.email}</div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'12px' }}>
                      <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Blood Group</div>
                      <div style={{ fontSize:'20px', fontWeight:'800' }}>{form.blood_group || SYMBOL.emDash}</div>
                    </div>
                    <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'12px' }}>
                      <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Appointments</div>
                      <div style={{ fontSize:'20px', fontWeight:'800' }}>{data.totalAppointments}</div>
                    </div>
                    {bmi && (
                      <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'10px', padding:'12px', gridColumn:'1/-1' }}>
                        <div style={{ fontSize:'11px', opacity:0.7, marginBottom:'4px', textTransform:'uppercase', letterSpacing:'0.5px' }}>BMI</div>
                        <div style={{ fontSize:'20px', fontWeight:'800' }}>{bmi} <span style={{ fontSize:'13px', fontWeight:'400', opacity:0.8 }}>({bmiStatus?.label})</span></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {form.allergies && (
                <div style={{ background:'#FFEBEE', border:'1px solid #FFCDD2', borderRadius:'var(--radius-lg)', padding:'16px' }}>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'#C62828', marginBottom:'6px' }}>{EMOJI.warning} Allergies</div>
                  <div style={{ fontSize:'13px', color:'#B71C1C' }}>{form.allergies}</div>
                </div>
              )}
            </div>

            <div className="fade-up-2">
              <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow-card)' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                  <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'20px', color:'var(--color-primary)' }}>Health Information</h2>
                  <button className="btn-outline" onClick={() => setEditing(!editing)} style={{ padding:'8px 18px', fontSize:'13px' }}>
                    {editing ? 'Cancel' : `${SYMBOL.pencil} Edit`}
                  </button>
                </div>

                {!editing ? (
                  <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                    {[
                      { label:'Blood Group',       value: form.blood_group },
                      { label:'Height',            value: form.height ? `${form.height} cm` : null },
                      { label:'Weight',            value: form.weight ? `${form.weight} kg` : null },
                      { label:'BMI',               value: bmi ? `${bmi} ${SYMBOL.emDash} ${bmiStatus?.label}` : null },
                      { label:'Allergies',         value: form.allergies },
                      { label:'Medical Conditions',value: form.conditions },
                    ].map(item => (
                      <div key={item.label} style={{ display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid var(--color-border)' }}>
                        <span style={{ fontSize:'13px', color:'var(--color-text-muted)', fontWeight:'600' }}>{item.label}</span>
                        <span style={{ fontSize:'13px', color: item.value ? 'var(--color-text-primary)' : 'var(--color-text-muted)', fontWeight: item.value ? '600' : '400', maxWidth:'200px', textAlign:'right' }}>
                          {item.value || 'Not set'}
                        </span>
                      </div>
                    ))}
                    {!data.healthRecord && (
                      <div style={{ background:'#FFF3E0', border:'1px solid #FFB74D', borderRadius:'var(--radius-md)', padding:'14px', fontSize:'13px', color:'#E65100', marginTop:'8px' }}>
                        {EMOJI.memo} Your health record is empty. Click Edit to fill in your details.
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSave}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'14px' }}>
                      <div>
                        <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Blood Group</label>
                        <select className="input" value={form.blood_group} onChange={e => setForm({...form, blood_group:e.target.value})}>
                          <option value="">Select</option>
                          {bloodGroups.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Height (cm)</label>
                        <input className="input" type="number" placeholder="e.g. 170"
                          value={form.height} onChange={e => setForm({...form, height:e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Weight (kg)</label>
                        <input className="input" type="number" placeholder="e.g. 70"
                          value={form.weight} onChange={e => setForm({...form, weight:e.target.value})} />
                      </div>
                      <div>
                        <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>BMI (auto)</label>
                        <input className="input" value={bmi ? `${bmi} ${SYMBOL.emDash} ${bmiStatus?.label}` : 'Enter height & weight'} readOnly style={{ background:'var(--color-surface-alt)', color: bmiStatus?.color || 'var(--color-text-muted)' }} />
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Allergies</label>
                        <input className="input" placeholder="e.g. Penicillin, Peanuts"
                          value={form.allergies} onChange={e => setForm({...form, allergies:e.target.value})} />
                      </div>
                      <div style={{ gridColumn:'1/-1' }}>
                        <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Medical Conditions</label>
                        <textarea className="input" rows={3} placeholder="e.g. Diabetes Type 2, Hypertension"
                          value={form.conditions} onChange={e => setForm({...form, conditions:e.target.value})} />
                      </div>
                    </div>
                    <button className="btn-primary" type="submit" style={{ width:'100%', padding:'12px' }}>
                      Save Health Record
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default HealthCard
