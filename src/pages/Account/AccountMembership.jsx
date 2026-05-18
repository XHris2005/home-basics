import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../services/supabase'
import './AccountMembership.css'

const MEMBERSHIP_CODE_REGEX = /^NG\d{8}$/

function namesMatch(profileName, bearerName) {
  if (!profileName || !bearerName) return false

  const normalize = name => name.toLowerCase().trim().split(/\s+/).sort()
  const profileWords = normalize(profileName)
  const bearerWords = normalize(bearerName)

  return bearerWords.every(word => profileWords.includes(word)) ||
    profileWords.every(word => bearerWords.includes(word))
}

function AccountMembership() {
  const { user, profile, isMember, isPendingMember, fetchProfile } = useAuth()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [pendingSubmitted, setPendingSubmitted] = useState(false)

  function validateCodeFormat(code) {
    return MEMBERSHIP_CODE_REGEX.test(code)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setPendingSubmitted(false)

    if (!validateCodeFormat(code)) {
      setError('Invalid membership code format.')
      return
    }

    setLoading(true)

    try {
      // Check code exists in database
      const { data: codeData, error: codeError } = await supabase
        .from('membership_codes')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (codeError || !codeData) {
        await supabase.from('admin_notifications').insert({
          type: 'code_not_found',
          message: `User ${profile?.full_name} (${user.email}) attempted to use membership code ${code} — code not found in database.`,
          is_read: false,
        })
        setError('Membership code not found. Please check your code or contact support.')
        setLoading(false)
        return
      }

      // Check if already used by someone else
      if (codeData.used_by && codeData.used_by !== user.id) {
        await supabase.from('admin_notifications').insert({
          type: 'code_already_used',
          message: `User ${profile?.full_name} (${user.email}) attempted to use membership code ${code} which is already activated by another account.`,
          is_read: false,
        })
        setError('This membership code has already been used. Please contact support.')
        setLoading(false)
        return
      }

      // Check if expired
      const now = new Date()
      const expiresAt = new Date(codeData.expires_at)
      if (now > expiresAt) {
        await supabase.from('admin_notifications').insert({
          type: 'code_expired',
          message: `User ${profile?.full_name} (${user.email}) attempted to use expired membership code ${code}.`,
          is_read: false,
        })
        setError('This membership code has expired. Please contact support.')
        setLoading(false)
        return
      }

      // Check name match
      const isNameMatch = namesMatch(profile?.full_name, codeData.bearer_name)

      if (!isNameMatch) {
        // Name doesn't match — set as pending
        await supabase
          .from('profiles')
          .update({
            member_code: code,
            member_status: 'pending',
          })
          .eq('id', user.id)

        await supabase.from('admin_notifications').insert({
          type: 'name_mismatch',
          message: `Membership pending review: User ${profile?.full_name} (${user.email}) used code ${code} assigned to "${codeData.bearer_name}". Names do not match — manual approval required.`,
          is_read: false,
        })

        await fetchProfile(user.id)
        setPendingSubmitted(true)
        setLoading(false)
        return
      }

      // Everything valid — activate membership
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          role: 'member',
          member_code: code,
          member_status: 'approved',
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Mark code as used
      await supabase
        .from('membership_codes')
        .update({ used_by: user.id })
        .eq('id', codeData.id)

      // Notify admin
      await supabase.from('admin_notifications').insert({
        type: 'new_member',
        message: `New member activated: ${profile?.full_name} (${user.email}) using code ${code}.`,
        is_read: false,
      })

      await fetchProfile(user.id)
      setSuccess(true)
      setCode('')

    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Already a member
  if (isMember) {
    return (
      <div className="account-membership">
        <div className="account-membership__header">
          <h1 className="account-membership__title">Membership</h1>
          <p className="account-membership__sub">Your membership status</p>
        </div>

        <div className="account-membership__card account-membership__card--active">
          <div className="account-membership__badge account-membership__badge--active">
            Active
          </div>
          <h2 className="account-membership__card-title">
            You're a Member 🎉
          </h2>
          <p className="account-membership__card-text">
            You have access to exclusive member pricing on all eligible products.
          </p>
          <div className="account-membership__code-row">
            <span className="account-membership__code-label">Membership Code</span>
            <span className="account-membership__code-value">
              {profile?.member_code}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Pending — name mismatch, waiting for admin approval
  if (isPendingMember || pendingSubmitted) {
    return (
      <div className="account-membership">
        <div className="account-membership__header">
          <h1 className="account-membership__title">Membership</h1>
          <p className="account-membership__sub">Your membership status</p>
        </div>

        <div className="account-membership__card account-membership__card--pending">
          <div className="account-membership__badge account-membership__badge--pending">
            Pending Review
          </div>
          <h2 className="account-membership__card-title">
            Application Under Review
          </h2>
          <p className="account-membership__card-text">
            Your membership code has been submitted but your name could not be automatically verified. Our admin team is reviewing your application and will activate your membership shortly.
          </p>
          <p className="account-membership__card-text">
            If you have any questions, please contact support.
          </p>
          <div className="account-membership__code-row">
            <span className="account-membership__code-label">Code Submitted</span>
            <span className="account-membership__code-value">
              {profile?.member_code || code}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Not a member — show upgrade form
  return (
    <div className="account-membership">
      <div className="account-membership__header">
        <h1 className="account-membership__title">Membership</h1>
        <p className="account-membership__sub">
          Upgrade your account to access exclusive member pricing
        </p>
      </div>

      {/* Benefits Card */}
      <div className="account-membership__benefits">
        <h2 className="account-membership__benefits-title">Member Benefits</h2>
        <div className="account-membership__benefits-list">
          <div className="account-membership__benefit">
            <span className="account-membership__benefit-icon">💰</span>
            <div>
              <p className="account-membership__benefit-title">Exclusive Member Pricing</p>
              <p className="account-membership__benefit-text">
                Access special member prices on all eligible products.
              </p>
            </div>
          </div>
          <div className="account-membership__benefit">
            <span className="account-membership__benefit-icon">🛍️</span>
            <div>
              <p className="account-membership__benefit-title">Members-Only Products</p>
              <p className="account-membership__benefit-text">
                Shop products exclusively available to members.
              </p>
            </div>
          </div>
          <div className="account-membership__benefit">
            <span className="account-membership__benefit-icon">⚡</span>
            <div>
              <p className="account-membership__benefit-title">Instant Access</p>
              <p className="account-membership__benefit-text">
                Valid codes are approved instantly — no waiting.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Form */}
      <div className="account-membership__form-card">
        <h2 className="account-membership__form-title">Enter Membership Code</h2>
        <p className="account-membership__form-text">
          Enter the membership code issued to you by the organisation.
        </p>

        {success && (
          <div className="account-membership__success">
            🎉 Welcome! Your membership has been activated successfully.
          </div>
        )}

        <form onSubmit={handleSubmit} className="account-membership__form">
          <div className="account-membership__field">
            <label className="account-membership__label">Membership Code</label>
            <input
              className="account-membership__input"
              type="text"
              value={code}
              onChange={e => {
                setCode(e.target.value.toUpperCase())
                setError(null)
              }}
              placeholder="Enter your membership code"
              maxLength={10}
              required
            />
            {error && <p className="account-membership__error">{error}</p>}
          </div>

          <button
            type="submit"
            className="account-membership__btn"
            disabled={loading || code.length === 0}
          >
            {loading ? 'Verifying...' : 'Activate Membership'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AccountMembership