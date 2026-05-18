import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import crown from '../../assets/crown.png'
import '../Login/Login.css'

function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
  e.preventDefault()
  setLoading(true)
  setError('')

  // Check if email exists
  const { data: exists, error: checkError } = await supabase
    .rpc('check_email_exists', { email_input: email })

  if (checkError || !exists) {
    setError('No account found with this email address. Please register first.')
    setLoading(false)
    return
  }

  // Email exists — send reset link
  const { error } = await forgotPassword(email)

  if (error) {
    setError(error.message)
    setLoading(false)
    return
  }

  setSent(true)
  setLoading(false)
}

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-left">
            <div className="auth-crown">
              <img src={crown} alt="crown" style={{ width: '48px', height: '40px' }} />
            </div>
            <h1 className="auth-title">Check your email</h1>
            <p className="auth-subtitle">
              A password reset link has been sent to your inbox.
            </p>
          </div>
          <div className="auth-right">
            <div className="auth-card">
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{
                  width: '64px', height: '64px', background: '#e8f7ef',
                  borderRadius: '50%', margin: '0 auto 20px',
                  lineHeight: '64px', fontSize: '28px', color: '#01A451'
                }}>
                  &#9993;
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a', margin: '0 0 12px' }}>
                  Reset link sent
                </h2>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6', margin: '0 0 8px' }}>
                  We sent a password reset link to
                </p>
                <p style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a', margin: '0 0 24px' }}>
                  {email}
                </p>
                <p style={{ fontSize: '13px', color: '#aaa', margin: '0 0 24px' }}>
                  Can't find it? Check your spam folder.
                </p>
                <Link to="/login" className="auth-btn" style={{ display: 'block', textAlign: 'center' }}>
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <div className="auth-crown">
            <img src={crown} alt="crown" style={{ width: '48px', height: '40px' }} />
          </div>
          <h1 className="auth-title">Forgot your password?</h1>
          <p className="auth-subtitle">
            No worries. Enter your email and we'll send you a reset link instantly.
          </p>
          <ul className="auth-benefits">
            <li><span className="benefit-check">✓</span> Reset link sent instantly</li>
            <li><span className="benefit-check">✓</span> Link expires in 1 hour</li>
            <li><span className="benefit-check">✓</span> Your account stays secure</li>
          </ul>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Checking...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="auth-switch">
              Remember your password? <Link to="/login">Sign in</Link>
            </p>
            <p className="auth-switch">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default ForgotPassword