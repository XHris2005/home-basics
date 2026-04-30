import { Navigate, Outlet } from 'react-router-dom'

function ProtectedRoute({ adminOnly = false }) {
  // We will hook this up to real auth after Supabase setup
  const user = null
  const isAdmin = false

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return <Outlet />
}

export default ProtectedRoute