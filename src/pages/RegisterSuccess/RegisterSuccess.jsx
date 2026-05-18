import { Link } from 'react-router-dom'
import crown from '../../assets/crown.png'
import './RegisterSuccess.css'

function RegisterSuccess() {
  return (
    <div className="auth-page">
      <div className="auth-container">

        <div className="auth-left">
          <div className="auth-crown">
            <img src={crown} alt="crown" style={{ width: '48px', height: '40px' }} />
          </div>
          <h1 className="auth-title">Almost there!</h1>
          <p className="auth-subtitle">
            Your account has been created. Just one more step to get started.
          </p>
        </div>

        <div className="auth-right">
          <div className="auth-card">
            <div className="register-success">
              <div className="register-success__icon">&#9993;</div>
              <h2 className="register-success__title">Check your email</h2>
              <p className="register-success__text">
                We sent a confirmation link to your email address. Click the link to activate your account.
              </p>
              <p className="register-success__sub">
                Can't find it? Check your spam folder.
              </p>
              <Link to="/login" className="register-success__btn">
                Go to Login
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default RegisterSuccess