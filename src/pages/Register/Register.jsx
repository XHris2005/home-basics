import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Register.css'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [accountType, setAccountType] = useState('retail')
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    memberCode: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (accountType === 'member' && !formData.memberCode.trim()) {
      setError('Please enter your membership code')
      return
    }

    setLoading(true)

    const { error } = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: accountType,
      memberCode: formData.memberCode
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/login')
  }

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join Home Basics today</p>
        </div>

        {/* Account Type Selector */}
        <div className="account-type-selector">
          <button
            type="button"
            className={`type-btn ${accountType === 'retail' ? 'active' : ''}`}
            onClick={() => setAccountType('retail')}
          >
            Regular Account
          </button>
          <button
            type="button"
            className={`type-btn ${accountType === 'member' ? 'active' : ''}`}
            onClick={() => setAccountType('member')}
          >
            Member Account
          </button>
        </div>

        {accountType === 'member' && (
          <div className="member-notice">
            🏷️ Member accounts get exclusive pricing. You'll need your membership
            code from the parent organisation. Your account will be reviewed within
            24 hours.
          </div>
        )}

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="08012345678"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat password"
                required
              />
            </div>
          </div>

          {accountType === 'member' && (
            <div className="form-group">
              <label htmlFor="memberCode">Membership Code</label>
              <input
                id="memberCode"
                name="memberCode"
                type="text"
                value={formData.memberCode}
                onChange={handleChange}
                placeholder="Enter your membership code"
                required
              />
            </div>
          )}

          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register