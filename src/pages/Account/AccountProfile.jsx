import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import './AccountProfile.css'

function AccountProfile() {
  const { profile, fetchProfile, user } = useAuth()

  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  function handleChange(e) {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setSuccess(false)
    setError(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq('id', user.id)

    if (error) {
      setError('Failed to update profile. Please try again.')
    } else {
      await fetchProfile(user.id)
      setSuccess(true)
    }

    setLoading(false)
  }

  return (
    <div className="account-profile">
      <div className="account-profile__header">
        <h1 className="account-profile__title">Profile</h1>
        <p className="account-profile__sub">Manage your personal information</p>
      </div>

      <div className="account-profile__card">
        {/* Avatar */}
        <div className="account-profile__avatar">
          <div className="account-profile__initials">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="account-profile__name">{profile?.full_name || 'User'}</p>
            <p className="account-profile__email">{user?.email}</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="account-profile__form">
          <div className="account-profile__field">
            <label className="account-profile__label">Full Name</label>
            <input
              className="account-profile__input"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="account-profile__field">
            <label className="account-profile__label">Email Address</label>
            <input
              className="account-profile__input account-profile__input--disabled"
              type="email"
              value={user?.email || ''}
              disabled
            />
            <p className="account-profile__hint">Email cannot be changed</p>
          </div>

          <div className="account-profile__field">
            <label className="account-profile__label">Phone Number</label>
            <input
              className="account-profile__input"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="account-profile__field">
            <label className="account-profile__label">Account Type</label>
            <input
              className="account-profile__input account-profile__input--disabled"
              type="text"
              value={profile?.role || 'retail'}
              disabled
            />
          </div>

          {error && <p className="account-profile__error">{error}</p>}
          {success && <p className="account-profile__success">Profile updated successfully.</p>}

          <button
            type="submit"
            className="account-profile__btn"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AccountProfile