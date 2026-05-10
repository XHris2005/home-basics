import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import './AccountSettings.css'

function AccountSettings() {
  const { user, logout } = useAuth()
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordError, setPasswordError] = useState(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deleteInput, setDeleteInput] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  function handlePasswordChange(e) {
    setPasswordData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setPasswordError(null)
    setPasswordSuccess(false)
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError(null)
    setPasswordSuccess(false)

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match.')
      return
    }

    setPasswordLoading(true)

    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    })

    if (error) {
      setPasswordError('Failed to update password. Please try again.')
    } else {
      setPasswordSuccess(true)
      setPasswordData({ newPassword: '', confirmPassword: '' })
    }

    setPasswordLoading(false)
  }

  async function handleDeleteAccount() {
    if (deleteInput !== user?.email) {
      setDeleteError('Email does not match. Please type your email exactly.')
      return
    }

    setDeleteLoading(true)
    setDeleteError(null)

    try {
      // Delete profile first (cascade will handle addresses etc.)
      await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)

      // Sign out
      await logout()
    } catch (err) {
      setDeleteError('Failed to delete account. Please contact support.')
      setDeleteLoading(false)
    }
  }

  return (
    <div className="account-settings">
      <div className="account-settings__header">
        <h1 className="account-settings__title">Settings</h1>
        <p className="account-settings__sub">Manage your account settings</p>
      </div>

      {/* Change Password */}
      <div className="account-settings__card">
        <h2 className="account-settings__card-title">Change Password</h2>
        <p className="account-settings__card-text">
          Choose a strong password with at least 6 characters.
        </p>

        <form onSubmit={handlePasswordSubmit} className="account-settings__form">
          <div className="account-settings__field">
            <label className="account-settings__label">New Password</label>
            <input
              className="account-settings__input"
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="account-settings__field">
            <label className="account-settings__label">Confirm New Password</label>
            <input
              className="account-settings__input"
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              placeholder="Confirm new password"
              required
            />
          </div>

          {passwordError && (
            <p className="account-settings__error">{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className="account-settings__success">
              Password updated successfully.
            </p>
          )}

          <button
            type="submit"
            className="account-settings__btn"
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="account-settings__card">
        <h2 className="account-settings__card-title">Account Information</h2>
        <div className="account-settings__info-row">
          <span className="account-settings__info-label">Email</span>
          <span className="account-settings__info-value">{user?.email}</span>
        </div>
        <div className="account-settings__info-row">
          <span className="account-settings__info-label">Account Created</span>
          <span className="account-settings__info-value">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : '—'}
          </span>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="account-settings__card account-settings__card--danger">
        <h2 className="account-settings__card-title account-settings__card-title--danger">
          Danger Zone
        </h2>
        <p className="account-settings__card-text">
          Deleting your account is permanent and cannot be undone. All your
          data including orders and addresses will be removed.
        </p>

        {!deleteConfirm ? (
          <button
            className="account-settings__btn account-settings__btn--danger"
            onClick={() => setDeleteConfirm(true)}
          >
            Delete Account
          </button>
        ) : (
          <div className="account-settings__delete-confirm">
            <p className="account-settings__delete-text">
              To confirm, type your email address:{' '}
              <strong>{user?.email}</strong>
            </p>
            <input
              className="account-settings__input"
              type="email"
              value={deleteInput}
              onChange={e => {
                setDeleteInput(e.target.value)
                setDeleteError(null)
              }}
              placeholder="Type your email to confirm"
            />
            {deleteError && (
              <p className="account-settings__error">{deleteError}</p>
            )}
            <div className="account-settings__delete-actions">
              <button
                className="account-settings__btn account-settings__btn--ghost"
                onClick={() => {
                  setDeleteConfirm(false)
                  setDeleteInput('')
                  setDeleteError(null)
                }}
              >
                Cancel
              </button>
              <button
                className="account-settings__btn account-settings__btn--danger"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Yes, Delete My Account'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountSettings