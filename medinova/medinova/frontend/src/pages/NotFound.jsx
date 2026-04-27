import { Link } from 'react-router-dom'
import { SYMBOL } from '@/utils/ui'
import { getStoredUser } from '@/utils/session'

function NotFound() {
  const user = getStoredUser()
  const dashboardLink = {
    patient: '/patient/dashboard',
    doctor:  '/doctor/dashboard',
    admin:   '/admin/dashboard',
    store:   '/store/dashboard',
    mr:      '/mr/dashboard',
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--color-bg)', display:'flex', alignItems:'center', justifyContent:'center', padding:'40px 20px' }}>
      <div style={{ textAlign:'center', maxWidth:'480px' }}>
        <div style={{ fontFamily:'var(--font-heading)', fontSize:'120px', color:'var(--color-primary)', lineHeight:1, marginBottom:'8px', opacity:0.3 }}>404</div>
        <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'32px', color:'var(--color-text-primary)', marginBottom:'12px' }}>
          Page not found
        </h1>
        <p style={{ color:'var(--color-text-muted)', fontSize:'16px', lineHeight:1.7, marginBottom:'36px' }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <Link to={user.role ? (dashboardLink[user.role] || '/') : '/'}>
            <button className="btn-primary" style={{ padding:'12px 28px' }}>
              {`Go to Dashboard ${SYMBOL.arrowRight}`}
            </button>
          </Link>
          <Link to="/">
            <button className="btn-outline" style={{ padding:'12px 28px' }}>
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
