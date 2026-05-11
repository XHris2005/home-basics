import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function AuthCallback() {
  const { profile, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (profile?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/', { replace: true })
      }
    }
  }, [loading, profile])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <p>Signing you in...</p>
    </div>
  )
}

export default AuthCallback