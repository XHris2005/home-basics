import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import './Membership.css'

function Membership() {
  const [members, setMembers] = useState([])
  const [pending, setPending] = useState([])
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('codes')
 const [stats, setStats] = useState({ activeMembers: 0, totalCodes: 0, usedCodes: 0, expiredCodes: 0, pendingCount: 0 })

  // Add code form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newCode, setNewCode] = useState({ code: '', bearer_name: '' })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  const today = new Date()

  function getNextAprilThird() {
    const thisYear = new Date(today.getFullYear(), 3, 3) // April 3 this year
    if (today > thisYear) {
      return new Date(today.getFullYear() + 1, 3, 3).toISOString()
    }
    return thisYear.toISOString()
  }

  function codeStatus(code) {
    const expired = new Date(code.expires_at) < today
    if (expired) return 'expired'
    if (code.used_by) return 'used'
    return 'available'
  }

  async function load() {
    setLoading(true)
    const [codesRes, membersRes, pendingRes] = await Promise.all([
  supabase
    .from('membership_codes')
    .select('*')
    .order('created_at', { ascending: false }),
  supabase
    .from('profiles')
    .select('*')
    .eq('role', 'member'),
  supabase
    .from('profiles')
    .select('*')
    .eq('member_status', 'pending')
])

const codesData = codesRes.data || []
const membersData = membersRes.data || []
const pendingData = pendingRes.data || []

// Enrich codes with used_by profile info
const usedByIds = [...new Set(codesData.filter(c => c.used_by).map(c => c.used_by))]
let usedProfiles = []
if (usedByIds.length > 0) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .in('id', usedByIds)
  usedProfiles = data || []
}

const profileMap = {}
usedProfiles.forEach(p => { profileMap[p.id] = p })
// Enrich pending profiles with bearer_name from their submitted code
const pendingCodes = pendingData.map(p => p.member_code).filter(Boolean)
let codeDetails = []
if (pendingCodes.length > 0) {
  const { data } = await supabase
    .from('membership_codes')
    .select('code, bearer_name')
    .in('code', pendingCodes)
  codeDetails = data || []
}
const codeDetailMap = {}
codeDetails.forEach(c => { codeDetailMap[c.code] = c })

const enrichedPending = pendingData.map(p => ({
  ...p,
  codeBearer: p.member_code ? codeDetailMap[p.member_code]?.bearer_name : null
}))
setPending(enrichedPending)

const enrichedCodes = codesData.map(c => ({
  ...c,
  profiles: c.used_by ? profileMap[c.used_by] : null
}))

setCodes(enrichedCodes)
setMembers(membersData)
    setStats({
  totalCodes: codesData.length,
  usedCodes: codesData.filter(c => c.used_by).length,
  expiredCodes: codesData.filter(c => new Date(c.expires_at) < today && !c.used_by).length,
  activeMembers: membersData.length,
  pendingCount: pendingData.length,
})
    setLoading(false)
  }

  useEffect(() => {
  load()
  supabase
    .from('admin_notifications')
    .update({ is_read: true })
    .eq('is_read', false)
    .then(() => {
      window.dispatchEvent(new Event('notifs-cleared'))
    })
}, [])

  async function handleAddCode(e) {
    e.preventDefault()
    setAddError('')
    setAddSuccess('')
    setAddLoading(true)

    const { error } = await supabase.from('membership_codes').insert({
      code: newCode.code.trim().toUpperCase(),
      bearer_name: newCode.bearer_name.trim().toUpperCase(),
      issued_to: newCode.bearer_name.trim().toUpperCase(),
      expires_at: getNextAprilThird(),
      valid_months: 12,
    })

    if (error) {
      setAddError(error.code === '23505' ? 'This code already exists.' : error.message)
    } else {
      setAddSuccess('Code added successfully.')
      setNewCode({ code: '', bearer_name: '' })
      load()
    }
    setAddLoading(false)
  }

  async function approveMember(profile) {
  await supabase
    .from('profiles')
    .update({ role: 'member', member_status: 'approved' })
    .eq('id', profile.id)
  if (profile.member_code) {
    await supabase
      .from('membership_codes')
      .update({ used_by: profile.id })
      .eq('code', profile.member_code)
  }
  load()
}

async function rejectMember(id) {
  await supabase
    .from('profiles')
    .update({ member_status: 'none', member_code: null })
    .eq('id', id)
  load()
}

  async function deactivateMember(id) {
    await supabase.from('profiles').update({ role: 'retail' }).eq('id', id)
    load()
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredCodes = codes.filter(c =>
    !search.trim() ||
    c.code?.toLowerCase().includes(search.toLowerCase()) ||
    c.bearer_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredPending = pending.filter(p =>
  !search.trim() ||
  p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
  p.email?.toLowerCase().includes(search.toLowerCase()) ||
  p.member_code?.toLowerCase().includes(search.toLowerCase())
)

  const filteredMembers = members.filter(m =>
    !search.trim() || m.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Membership</h1>
          <p className="admin-page-sub">Manage membership codes and active members</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Active Members</p>
            <p className="admin-stat-value" style={{ color: '#ea580c' }}>{stats.activeMembers}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#fff7ed' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Total Codes</p>
            <p className="admin-stat-value">{stats.totalCodes}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
            </svg>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Used Codes</p>
            <p className="admin-stat-value" style={{ color: 'var(--color-primary)' }}>{stats.usedCodes}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Expired (Unused)</p>
            <p className="admin-stat-value" style={{ color: stats.expiredCodes > 0 ? '#dc2626' : 'var(--color-text)' }}>
              {stats.expiredCodes}
            </p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#fef2f2' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="membership-tabs">
        <button className={`membership-tab ${tab === 'codes' ? 'active' : ''}`} onClick={() => { setTab('codes'); setSearch('') }}>
          Codes
          <span className="membership-tab-count">{stats.totalCodes}</span>
        </button>
        <button className={`membership-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => { setTab('pending'); setSearch('') }}>
  Pending
  {stats.pendingCount > 0 && (
    <span className="membership-tab-count membership-tab-count--pending">{stats.pendingCount}</span>
  )}
</button>
        <button className={`membership-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => { setTab('members'); setSearch('') }}>
          Active Members
          <span className="membership-tab-count">{stats.activeMembers}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="admin-search-box" style={{ maxWidth: '300px', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            placeholder={tab === 'codes' ? 'Search code or name...' : 'Search members...'}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {tab === 'codes' && (
          <button className="admin-btn-primary" onClick={() => { setShowAddForm(!showAddForm); setAddError(''); setAddSuccess('') }}>
            + Add Code
          </button>
        )}
      </div>

      {/* Add Code Form */}
      {tab === 'codes' && showAddForm && (
        <div className="membership-add-form">
          <p className="membership-add-title">Add New Membership Code</p>
          {addError && <p className="membership-form-error">{addError}</p>}
          {addSuccess && <p className="membership-form-success">{addSuccess}</p>}
          <form onSubmit={handleAddCode} className="membership-form-row">
            <input
              className="admin-input"
              placeholder="Code (e.g. NG01234567)"
              value={newCode.code}
              onChange={e => setNewCode({ ...newCode, code: e.target.value })}
              required
            />
            <input
              className="admin-input"
              placeholder="Bearer name"
              value={newCode.bearer_name}
              onChange={e => setNewCode({ ...newCode, bearer_name: e.target.value })}
              required
            />
            <button type="submit" className="admin-btn-primary" disabled={addLoading}>
              {addLoading ? 'Adding...' : 'Add Code'}
            </button>
            <button type="button" className="admin-btn-secondary" onClick={() => setShowAddForm(false)}>
              Cancel
            </button>
          </form>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            Expiry will be set to April 3, {new Date(getNextAprilThird()).getFullYear()} automatically.
          </p>
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>Loading...</p>
      ) : tab === 'codes' ? (
        <div className="admin-table-wrapper">
          <div className="admin-table-toolbar">
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>
              All Codes ({filteredCodes.length})
            </p>
          </div>
          {filteredCodes.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>No codes found.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Bearer Name</th>
                  <th>Status</th>
                  <th>Used By</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.map(c => {
                  const status = codeStatus(c)
                  return (
                    <tr key={c.id}>
                      <td><span className="code-chip">{c.code}</span></td>
                      <td style={{ fontWeight: 500 }}>{c.bearer_name}</td>
                      <td>
                        <span className={`status-badge ${
                          status === 'available' ? 'status-delivered' :
                          status === 'used' ? 'status-processing' : 'status-cancelled'
                        }`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                        {c.profiles?.full_name || '—'}
                        {c.profiles?.email && <div style={{ fontSize: '11px' }}>{c.profiles.email}</div>}
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(c.expires_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      ) : tab === 'pending' ? (
        <div className="admin-table-wrapper">
          <div className="admin-table-toolbar">
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Pending Approvals ({filteredPending.length})</p>
          </div>
          {filteredPending.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>No pending applications.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Email</th>
                  <th>Code Submitted</th>
                  <th>Code Holder</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPending.map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.full_name || 'No name'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{p.email || '—'}</td>
                    <td><span className="code-chip">{p.member_code || '—'}</span></td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                      {p.codeBearer || '—'}
                      {p.codeBearer && p.full_name && (
                        <div style={{ fontSize: '11px', marginTop: '2px', color: '#dc2626' }}>
                          Name mismatch
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="admin-btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                          onClick={() => approveMember(p)}
                        >
                          Approve
                        </button>
                        <button
                          className="admin-btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 14px', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => rejectMember(p.id)}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <div className="admin-table-toolbar">
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Active Members ({filteredMembers.length})</p>
          </div>
          {filteredMembers.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>No active members yet.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Since</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>👑</span>
                        <span style={{ fontWeight: 600 }}>{m.full_name || 'No name'}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{m.email || '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{m.phone || '—'}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(m.created_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="admin-btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 14px', color: 'var(--color-error)', borderColor: '#fca5a5' }}
                        onClick={() => deactivateMember(m.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </AdminLayout>
  )
}

export default Membership