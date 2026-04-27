import { Navigate } from 'react-router-dom'
import { getStoredToken, getStoredUser } from '@/utils/session'

function ProtectedRoute({ children, role }) {
  const token = getStoredToken()
  const user = getStoredUser()

  if (!token) return <Navigate to="/login" />
  if (role && user.role !== role) return <Navigate to="/login" />

  return children
}

export default ProtectedRoute
