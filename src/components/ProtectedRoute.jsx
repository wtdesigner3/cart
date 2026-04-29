import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { userInfo } = useSelector((state) => state.user)

  if (!userInfo) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && !userInfo.isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}
