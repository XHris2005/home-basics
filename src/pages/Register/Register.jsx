import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import crown from '../../assets/crown.png'
import './Register.css'

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^a-zA-Z0-9]).{8,}$/

function Register() {
  const { register, googleLogin } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showPasswordHints, setShowPasswordHints] = useState(false)

  const passwordValid = passwordRegex.test(formData.password)
  const passwordsMatch = formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    setError('')
    const result = await googleLogin()
    if (result?.error) {
      setError(result.error.message)
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!passwordValid) {
      setError('Password does not meet the requirements.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error } = await register({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    navigate('/register-success')
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
          <p className="auth-subtitle">
            Register with a referral code to access member pricing and special discounts.
          </p>
          <ul className="auth-benefits">
            <li><span className="benefit-check">✓</span> Exclusive member pricing on selected products</li>
            <li><span className="benefit-check">✓</span> Early access to new products launches</li>
            <li><span className="benefit-check">✓</span> Save more when you buy 24+</li>
            <li><span className="benefit-check">✓</span> Better prices every time you shop</li>
          </ul>
        </div>

        {/* Right */}
        <div className="auth-right">
          <div className="auth-card">
            {error && <div className="auth-error">{error}</div>}

            {/* Google Signup */}
            <button
              type="button"
              className="auth-google-btn"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">

              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Your full name"
                  autoComplete="off"
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
                  autoComplete="off"
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
                  autoComplete="off"
                  required
                />
              </div>

              {/* Password */}
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div
                  className="input-with-icon"
                  style={{
                    border: showPasswordHints && formData.password.length > 0 && !passwordValid
                      ? '1.5px solid #e53935'
                      : '1.5px solid #e8e8e8',
                    borderRadius: '10px'
                  }}
                >
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    onFocus={() => setShowPasswordHints(true)}
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

                {showPasswordHints && (
                  <div className="password-hints">
                    <p className={`password-hint ${formData.password.length >= 8 ? 'valid' : 'invalid'}`}>
                      <span>{formData.password.length >= 8 ? '✓' : '✗'}</span>
                      At least 8 characters
                    </p>
                    <p className={`password-hint ${/[A-Z]/.test(formData.password) ? 'valid' : 'invalid'}`}>
                      <span>{/[A-Z]/.test(formData.password) ? '✓' : '✗'}</span>
                      At least one uppercase letter
                    </p>
                    <p className={`password-hint ${/[a-z]/.test(formData.password) ? 'valid' : 'invalid'}`}>
                      <span>{/[a-z]/.test(formData.password) ? '✓' : '✗'}</span>
                      At least one lowercase letter
                    </p>
                    <p className={`password-hint ${/[0-9]/.test(formData.password) ? 'valid' : 'invalid'}`}>
                      <span>{/[0-9]/.test(formData.password) ? '✓' : '✗'}</span>
                      At least one number
                    </p>
                    <p className={`password-hint ${/[^a-zA-Z0-9]/.test(formData.password) ? 'valid' : 'invalid'}`}>
                      <span>{/[^a-zA-Z0-9]/.test(formData.password) ? '✓' : '✗'}</span>
                      At least one symbol (e.g. @, #, !)
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div
                  className="input-with-icon"
                  style={{
                    border: formData.confirmPassword.length > 0 && !passwordsMatch
                      ? '1.5px solid #e53935'
                      : '1.5px solid #e8e8e8',
                    borderRadius: '10px'
                  }}
                >
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="eye-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
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
                {formData.confirmPassword.length > 0 && !passwordsMatch && (
                  <p style={{ fontSize: '12px', color: '#e53935', margin: '4px 0 0' }}>
                    Passwords do not match.
                  </p>
                )}
              </div>

              {/* Membership notice */}
              <div className="register-name-notice">
                <span className="register-name-notice__icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </span>
                <p className="register-name-notice__text">
                  To activate your membership code, please make sure your full name matches exactly what is on your membership record.
                </p>
              </div>

              <button type="submit" className="auth-btn" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Register