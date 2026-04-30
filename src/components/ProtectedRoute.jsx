import { useSelector } from 'react-redux'
import { Navigate, useLocation } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { userInfo } = useSelector((state) => state.user)
  const location = useLocation()

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (adminOnly && !userInfo.isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
