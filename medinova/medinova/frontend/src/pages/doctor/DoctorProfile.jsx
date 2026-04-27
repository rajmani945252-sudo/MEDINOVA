import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'


function DoctorProfile() {
  const [form,    setForm]    = useState({ name:'', phone:'', specialization:'', experience:'', fees:'', location:'', bio:'', available:true })
  const [msg,     setMsg]     = useState('')
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('token')
  const user  = JSON.parse(localStorage.getItem('user') || '{}')
  const h     = { headers: { Authorization: `Bearer ${token}` } }

  useEffect(() => {
    setForm(f => ({ ...f, name: user.name || '', phone: user.phone || '' }))
    axios.get(`${API_BASE_URL}/api/doctors/profile`, h)
      .then(res => {
        const d = res.data
        setForm(f => ({
          ...f,
          specialization: d.specialization || '',
          experience:     d.experience     || '',
          fees:           d.fees           || '',
          location:       d.location       || '',
          bio:            d.bio            || '',
          available:      d.available      ?? true,
        }))
      }).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await axios.put(`${API_BASE_URL}/api/doctors/profile`, form, h)
      const updated = { ...user, name: form.name, phone: form.phone }
      localStorage.setItem('user', JSON.stringify(updated))
      setMsg('Profile updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch { setMsg('Unable to update profile right now.'); setTimeout(() => setMsg(''), 3000) }
    finally { setLoading(false) }
  }

  const specializations = ['Cardiologist','Dermatologist','Orthopedic','Neurologist','Pediatrician','Gynecologist','ENT Specialist','Ophthalmologist','Dentist','Psychiatrist','General Physician','Gastroenterologist','Endocrinologist','Nephrologist','Pulmonologist','Other']

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
      <div className="page-content">

        <div className="fade-up" style={{ marginBottom:'28px' }}>
          <Link to="/doctor/dashboard" style={{ color:'var(--color-text-muted)', fontSize:'13px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px', marginBottom:'12px' }}>
            â† Back to Dashboard
          </Link>
          <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'32px', color:'var(--color-primary)' }}>Doctor Profile</h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:'14px', marginTop:'4px' }}>Update your professional information</p>
        </div>

        <div className="fade-up-1" style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'24px', alignItems:'start' }}>

          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow-card)', textAlign:'center' }}>
            <div style={{ width:'80px', height:'80px', background:'var(--color-primary)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'32px', fontWeight:'700', color:'white', fontFamily:'var(--font-heading)' }}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontFamily:'var(--font-heading)', fontSize:'20px', color:'var(--color-text-primary)', marginBottom:'4px' }}>{user.name}</div>
            <div style={{ color:'var(--color-primary)', fontSize:'13px', fontWeight:'600', marginBottom:'8px' }}>{form.specialization || 'Doctor'}</div>
            <div style={{ color:'var(--color-text-muted)', fontSize:'13px', marginBottom:'16px' }}>{user.email}</div>
            <div
              onClick={() => setForm({...form, available: !form.available})}
              style={{ background: form.available ? '#E8F5E9' : '#FFEBEE', color: form.available ? '#2E7D32' : '#C62828', padding:'8px 18px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', display:'inline-block', cursor:'pointer', transition:'var(--transition)' }}>
              {form.available ? 'âœ“ Available' : 'âœ— Unavailable'}
            </div>
            <div style={{ fontSize:'11px', color:'var(--color-text-muted)', marginTop:'6px' }}>Click to toggle availability</div>
          </div>

          <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow-card)' }}>
            <h2 style={{ fontFamily:'var(--font-heading)', fontSize:'20px', color:'var(--color-primary)', marginBottom:'20px' }}>Professional Information</h2>

            {msg && <div style={{ background:'#E8F5E9', color:'#2E7D32', padding:'12px 16px', borderRadius:'var(--radius-md)', marginBottom:'20px', borderLeft:'3px solid #43A047', fontWeight:'600' }}>âœ… {msg}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Full Name</label>
                  <input className="input" value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Phone</label>
                  <input className="input" value={form.phone} onChange={e => setForm({...form, phone:e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Specialization</label>
                  <select className="input" value={form.specialization} onChange={e => setForm({...form, specialization:e.target.value})} required>
                    <option value="">Select</option>
                    {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Experience (years)</label>
                  <input className="input" type="number" placeholder="e.g. 10"
                    value={form.experience} onChange={e => setForm({...form, experience:e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Consultation Fees (â‚¹)</label>
                  <input className="input" type="number" placeholder="e.g. 500"
                    value={form.fees} onChange={e => setForm({...form, fees:e.target.value})} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Location</label>
                  <input className="input" placeholder="e.g. Mumbai"
                    value={form.location} onChange={e => setForm({...form, location:e.target.value})} />
                </div>
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Bio</label>
                  <textarea className="input" rows={3} placeholder="Brief description about yourself..."
                    value={form.bio} onChange={e => setForm({...form, bio:e.target.value})} />
                </div>
              </div>
              <button className="btn-primary" type="submit"
                style={{ padding:'12px 32px' }} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
