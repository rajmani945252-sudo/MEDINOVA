import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { API_BASE_URL } from '@/utils/api'

function SymptomChecker() {
  const [symptoms,    setSymptoms]    = useState('')
  const [result,      setResult]      = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const token    = localStorage.getItem('token')
  const navigate = useNavigate()

  const handleCheck = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await axios.post(`${API_BASE_URL}/api/smart/symptoms`,
        { symptoms },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setResult(res.data)
    } catch {
      setResult(null)
      setError('Unable to check symptoms right now. Please try again in a moment.')
    }
    finally { setLoading(false) }
  }

  const examples = ['chest pain','headache and fever','skin rash','back pain','anxiety and stress','cough and cold']

  return (
    <div className="page">
      <div className="page-content">

        <div className="fade-up" style={{ marginBottom:'28px' }}>
          <Link to="/patient/dashboard" style={{ color:'var(--color-text-muted)', fontSize:'13px', textDecoration:'none', display:'inline-flex', alignItems:'center', gap:'4px', marginBottom:'12px' }}>
            ← Back to Dashboard
          </Link>
          <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'32px', color:'var(--color-primary)', marginBottom:'6px' }}>
            AI Symptom Checker
          </h1>
          <p style={{ color:'var(--color-text-muted)', fontSize:'14px' }}>
            Describe your symptoms and we will suggest the right doctor for you
          </p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px', alignItems:'start' }}>

          <div className="fade-up-1">
            <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'28px', boxShadow:'var(--shadow-card)' }}>

              <div style={{ background:'var(--color-primary-ghost)', borderRadius:'var(--radius-md)', padding:'14px 16px', marginBottom:'24px', fontSize:'13px', color:'var(--color-primary)', lineHeight:1.6 }}>
                🤖 Our AI checks your symptoms and suggests the right doctor specialization. This is not a medical diagnosis — always consult a real doctor.
              </div>

              <form onSubmit={handleCheck}>
                <div style={{ marginBottom:'16px' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    Describe your symptoms
                  </label>
                  <textarea className="input" rows={5}
                    placeholder="e.g. I have chest pain, shortness of breath and fatigue for the last 2 days..."
                    value={symptoms}
                    onChange={e => setSymptoms(e.target.value)}
                    required />
                </div>

                <div style={{ marginBottom:'20px' }}>
                  <div style={{ fontSize:'12px', color:'var(--color-text-muted)', marginBottom:'10px' }}>Try an example:</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {examples.map(ex => (
                      <button key={ex} type="button"
                        onClick={() => setSymptoms(ex)}
                        style={{ padding:'6px 14px', borderRadius:'20px', border:'1.5px solid var(--color-border)', background:'transparent', color:'var(--color-text-muted)', fontSize:'12px', cursor:'pointer', fontFamily:'var(--font-main)', transition:'var(--transition)' }}>
                        {ex}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="btn-primary" type="submit"
                  style={{ width:'100%', padding:'14px', fontSize:'15px' }}
                  disabled={loading || !symptoms.trim()}>
                  {loading ? 'Checking symptoms...' : '🔍 Check Symptoms'}
                </button>
              </form>
            </div>
          </div>

          <div className="fade-up-2">
            {error && (
              <div style={{ background:'#FFF6F5', border:'1px solid #F1C9C6', borderRadius:'var(--radius-lg)', padding:'16px', color:'#A93226', fontSize:'13px', lineHeight:1.7, marginBottom:'16px' }}>
                {error}
              </div>
            )}
            {!result && (
              <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'40px', textAlign:'center', boxShadow:'var(--shadow-sm)' }}>
                <div style={{ fontSize:'60px', marginBottom:'16px' }}>🩺</div>
                <h3 style={{ fontFamily:'var(--font-heading)', color:'var(--color-text-primary)', marginBottom:'8px' }}>Enter your symptoms</h3>
                <p style={{ color:'var(--color-text-muted)', fontSize:'13px' }}>Results will appear here after you check your symptoms</p>
              </div>
            )}

            {result && (
              <div>
                <div style={{ background:'var(--color-primary-ghost)', border:'1px solid var(--color-primary-pale)', borderRadius:'var(--radius-lg)', padding:'20px', marginBottom:'20px' }}>
                  <div style={{ fontSize:'13px', fontWeight:'700', color:'var(--color-primary)', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.5px' }}>
                    Suggested Specializations
                  </div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {result.suggestions.map(s => (
                      <span key={s} style={{ background:'var(--color-primary)', color:'white', padding:'6px 16px', borderRadius:'20px', fontSize:'13px', fontWeight:'600' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {result.doctors.length > 0 ? (
                  <div>
                    <div style={{ fontSize:'14px', fontWeight:'700', color:'var(--color-text-primary)', marginBottom:'14px' }}>
                      Available Doctors ({result.doctors.length})
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                      {result.doctors.map(doc => (
                        <div key={doc.id} style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'18px', boxShadow:'var(--shadow-sm)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                            <div style={{ width:'44px', height:'44px', background:'var(--color-primary-ghost)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px' }}>👨‍⚕️</div>
                            <div>
                              <div style={{ fontWeight:'700', color:'var(--color-text-primary)' }}>{doc.name}</div>
                              <div style={{ color:'var(--color-primary)', fontSize:'13px', fontWeight:'600' }}>{doc.specialization}</div>
                              <div style={{ color:'var(--color-text-muted)', fontSize:'12px', marginTop:'2px' }}>
                                📍 {doc.location} · {doc.experience} yrs · ₹{doc.fees}
                              </div>
                            </div>
                          </div>
                          <button className="btn-primary" style={{ padding:'8px 18px', fontSize:'13px' }}
                            onClick={() => navigate(`/patient/book/${doc.id}`, { state: { doctor: doc } })}>
                            Book →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ background:'var(--color-surface)', border:'1px solid var(--color-border)', borderRadius:'var(--radius-lg)', padding:'28px', textAlign:'center' }}>
                    <div style={{ fontSize:'40px', marginBottom:'12px' }}>🔍</div>
                    <p style={{ color:'var(--color-text-muted)' }}>No doctors found for these specializations yet. <Link to="/patient/search" style={{ color:'var(--color-primary)', fontWeight:'700' }}>Browse all doctors →</Link></p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

export default SymptomChecker
