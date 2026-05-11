import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import './Membership.css'

function Membership() {
  const [members, setMembers] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('applications')
  const [stats, setStats] = useState({ activeMembers: 0, pending: 0, totalSavings: 0 })

  async function load() {
    const [profilesRes, appsRes, ordersRes, productsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('role', 'member'),
      supabase.from('member_applications').select('*, profiles(full_name, email, phone)').order('created_at', { ascending: false }),
      supabase.from('orders').select('user_id, items, payment_status'),
      supabase.from('products').select('id, retail_price, member_price').not('member_price', 'is', null),
    ])

    const memberProfiles = profilesRes.data || []
    const apps = appsRes.data || []
    const orders = ordersRes.data || []
    const products = productsRes.data || []

    // Calculate savings per member
    const priceMap = {}
    products.forEach(p => { priceMap[p.id] = { retail: p.retail_price, member: p.member_price } })

    const enriched = memberProfiles.map(p => {
      const userOrders = orders.filter(o => o.user_id === p.id)
      let savings = 0
      userOrders.filter(o => o.payment_status === 'paid').forEach(order => {
        const items = Array.isArray(order.items) ? order.items : []
        items.forEach(item => {
          const prod = priceMap[item.product_id || item.id]
          if (prod?.member && prod.retail > prod.member) {
            savings += (prod.retail - prod.member) * (item.quantity || 1)
          }
        })
      })
      return { ...p, savings }
    })

    setMembers(enriched)
    setApplications(apps)
    setStats({
      activeMembers: memberProfiles.length,
      pending: apps.filter(a => a.status === 'pending').length,
      totalSavings: enriched.reduce((s, m) => s + m.savings, 0),
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function approveApplication(app) {
    const { data: { user } } = await supabase.auth.getUser()
    await Promise.all([
      supabase.from('member_applications').update({
        status: 'approved',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      }).eq('id', app.id),
      supabase.from('profiles').update({ role: 'member' }).eq('id', app.user_id),
    ])
    load()
  }

  async function rejectApplication(app) {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('member_applications').update({
      status: 'rejected',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', app.id)
    load()
  }

  async function deactivateMember(id) {
    await supabase.from('profiles').update({ role: 'user' }).eq('id', id)
    load()
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-NG', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  const filteredMembers = members.filter(m =>
    !search.trim() || m.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredApps = applications.filter(a =>
    !search.trim() ||
    a.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    a.member_code?.toLowerCase().includes(search.toLowerCase())
  )

  const pendingApps = filteredApps.filter(a => a.status === 'pending')
  const reviewedApps = filteredApps.filter(a => a.status !== 'pending')

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Membership</h1>
          <p className="admin-page-sub">Review applications and manage active members</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
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
            <p className="admin-stat-label">Pending Applications</p>
            <p className="admin-stat-value" style={{ color: stats.pending > 0 ? '#ca8a04' : 'var(--color-text)' }}>
              {stats.pending}
            </p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#fef9c3' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Total Member Savings</p>
            <p className="admin-stat-value">₦{stats.totalSavings.toLocaleString()}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="membership-tabs">
        <button className={`membership-tab ${tab === 'applications' ? 'active' : ''}`} onClick={() => setTab('applications')}>
          Applications
          {stats.pending > 0 && <span className="membership-tab-badge">{stats.pending}</span>}
        </button>
        <button className={`membership-tab ${tab === 'members' ? 'active' : ''}`} onClick={() => setTab('members')}>
          Active Members
        </button>
      </div>

      {/* Search */}
      <div className="admin-search-box" style={{ marginBottom: '16px', maxWidth: '320px' }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          placeholder={tab === 'applications' ? 'Search by name or code...' : 'Search members...'}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>Loading...</p>
      ) : tab === 'applications' ? (

        <div className="admin-table-wrapper">
          {/* Pending */}
          <div className="admin-table-toolbar">
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>
              Pending Review
              {pendingApps.length > 0 && (
                <span className="membership-tab-badge" style={{ marginLeft: '8px' }}>{pendingApps.length}</span>
              )}
            </p>
          </div>

          {pendingApps.length === 0 ? (
            <p style={{ padding: '20px', color: 'var(--color-text-muted)', fontSize: '14px' }}>No pending applications.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Code Submitted</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.map(app => (
                  <tr key={app.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.profiles?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{app.profiles?.email}</div>
                    </td>
                    <td>
                      <span className="code-chip">{app.member_code}</span>
                    </td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(app.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="admin-btn-primary" style={{ fontSize: '12px', padding: '6px 16px' }}
                          onClick={() => approveApplication(app)}>
                          Approve
                        </button>
                        <button className="admin-btn-secondary" style={{ fontSize: '12px', padding: '6px 16px', color: 'var(--color-error)', borderColor: '#fca5a5' }}
                          onClick={() => rejectApplication(app)}>
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Reviewed */}
          {reviewedApps.length > 0 && (
            <>
              <div className="admin-table-toolbar" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Previously Reviewed</p>
              </div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Code</th>
                    <th>Status</th>
                    <th>Reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewedApps.map(app => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 600 }}>{app.profiles?.full_name || 'Unknown'}</td>
                      <td><span className="code-chip">{app.member_code}</span></td>
                      <td>
                        <span className={`status-badge ${app.status === 'approved' ? 'status-delivered' : 'status-cancelled'}`}>
                          {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                        </span>
                      </td>
                      <td style={{ color: 'var(--color-text-muted)' }}>
                        {app.reviewed_at ? formatDate(app.reviewed_at) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
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
                  <th>Contact</th>
                  <th style={{ textAlign: 'right' }}>Savings</th>
                  <th style={{ textAlign: 'right' }}>Since</th>
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
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>{m.phone || '—'}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>₦{m.savings.toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{formatDate(m.created_at)}</td>
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