import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import crown from "../../assets/crown.png";
import './Register.css'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    memberCode: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.memberCode ? 'member' : 'retail',
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
      <div className="auth-container">

        {/* Left */}
        <div className="auth-left">
          <div className="auth-crown">
  <img src={crown} alt="crown" style={{ width: '48px', height: '40px' }} />
</div>
          <h1 className="auth-title">Become a Member</h1>
          <p className="auth-subtitle">Register with a referral code to access member pricing and special discounts.</p>
          <ul className="auth-benefits">
            <li>
              <span className="benefit-check">✓</span>
              Exclusive member pricing on selected products
            </li>
            <li>
              <span className="benefit-check">✓</span>
              Early access to new products launches
            </li>
            <li>
              <span className="benefit-check">✓</span>
              Save more when you buy 24+
            </li>
            <li>
              <span className="benefit-check">✓</span>
              Better prices every time you shop
            </li>
          </ul>
        </div>

        {/* Right */}
        <div className="auth-right">
          <div className="auth-card">
            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
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

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="memberCode">
                  Membership Code
                  <span className="optional-label"> (optional — leave blank for regular account)</span>
                </label>
                <input
                  id="memberCode"
                  name="memberCode"
                  type="text"
                  value={formData.memberCode}
                  onChange={handleChange}
                  placeholder="Enter membership code"
                />
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already a member? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Register