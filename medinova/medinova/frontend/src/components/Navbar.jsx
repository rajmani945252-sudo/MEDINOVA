import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const token = localStorage.getItem('token')

  const logout = () => { localStorage.clear(); navigate('/login') }

  const dashboardLink = {
    patient: '/patient/dashboard',
    doctor:  '/doctor/dashboard',
    admin:   '/admin/dashboard',
    store:   '/store/dashboard',
    mr:      '/mr/dashboard',
  }

  return (
    <nav style={{
      background: 'var(--color-navbar-bg)',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 20px rgba(0,105,92,0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'10px' }}>
        <div style={{
          background: 'white',
          width: '36px', height: '36px',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <span style={{ color:'var(--color-primary)', fontWeight:'800', fontSize:'18px', fontFamily:'var(--font-heading)' }}>M</span>
        </div>
        <div>
          <span style={{ color:'white', fontFamily:'var(--font-heading)', fontSize:'20px', fontWeight:'700', letterSpacing:'-0.3px' }}>medinova</span>
          <div style={{ color:'rgba(255,255,255,0.55)', fontSize:'9px', letterSpacing:'2px', textTransform:'uppercase', marginTop:'-2px' }}>Smart Healthcare</div>
        </div>
      </Link>

      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        {token && user.name ? (
          <>
            <Link to={dashboardLink[user.role] || '/'} style={{ textDecoration:'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.12)',
                padding: '6px 14px',
                borderRadius: '20px',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}>
                <div style={{
                  width: '28px', height: '28px',
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: '700', color: 'white'
                }}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ color:'white', fontSize:'13px', fontWeight:'600' }}>{user.name}</span>
                <span style={{ background:'rgba(255,255,255,0.2)', color:'white', fontSize:'10px', padding:'2px 8px', borderRadius:'10px', textTransform:'capitalize' }}>{user.role}</span>
              </div>
            </Link>
            <button onClick={logout} style={{
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '7px 16px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-main)',
              transition: 'var(--transition)',
            }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">
              <button style={{
                background: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.5)',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'var(--transition)',
              }}>Login</button>
            </Link>
            <Link to="/register">
              <button style={{
                background: 'white',
                color: 'var(--color-primary)',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontFamily: 'var(--font-main)',
                fontWeight: '700',
                fontSize: '13px',
                transition: 'var(--transition)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>Get Started</button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar