import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import './Customers.css'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [viewing, setViewing] = useState(null)
  const [stats, setStats] = useState({ total: 0, members: 0, totalSpend: 0 })
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total_amount, payment_status')

      const enriched = (profiles || []).filter(p => p.role !== 'admin') .map(p => {
        const userOrders = (orders || []).filter(o => o.user_id === p.id)
        const spent = userOrders
          .filter(o => o.payment_status === 'paid')
          .reduce((s, o) => s + (o.total_amount || 0), 0)
        return { ...p, orderCount: userOrders.length, totalSpent: spent }
      })

      setCustomers(enriched)
      setFiltered(enriched)

      const members = enriched.filter(p => p.role === 'member').length
      const totalSpend = enriched.reduce((s, p) => s + p.totalSpent, 0)
      setStats({ total: enriched.length, members, totalSpend })
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = [...customers]
    if (filter === 'member') result = result.filter(c => c.role === 'member')
    if (filter === 'standard') result = result.filter(c => c.role !== 'member' && c.role !== 'admin')
    if (search.trim()) result = result.filter(c =>
      c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, filter, customers])

  useEffect(() => {
  function handleClick(e) {
    if (!e.target.closest('.customer-filter-wrapper')) {
      setShowFilterDropdown(false)
    }
  }
  document.addEventListener('mousedown', handleClick)
  return () => document.removeEventListener('mousedown', handleClick)
}, [])

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-NG', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Customers</h1>
          <p className="admin-page-sub">Manage customer accounts, memberships and order history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Total Customers</p>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Members</p>
            <p className="admin-stat-value" style={{ color: '#ea580c' }}>{stats.members}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Total Spend</p>
            <p className="admin-stat-value">₦{stats.totalSpend.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search customers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="customer-filter-wrapper">
  <button
    className="customer-filter-btn"
    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
  >
    {filter === 'all' ? 'All customers' : filter === 'member' ? 'Members only' : 'Non-members'}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  </button>

  {showFilterDropdown && (
    <div className="customer-filter-dropdown">
      {[
        { value: 'all', label: 'All customers' },
        { value: 'member', label: 'Members only' },
        { value: 'standard', label: 'Non-members' },
      ].map(opt => (
        <button
          key={opt.value}
          className={`customer-filter-option ${filter === opt.value ? 'active' : ''}`}
          onClick={() => { setFilter(opt.value); setShowFilterDropdown(false) }}
        >
          {filter === opt.value && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          )}
          {filter !== opt.value && <span style={{ width: '14px', display: 'inline-block' }} />}
          {opt.label}
        </button>
      ))}
    </div>
  )}
</div>

          <span className="admin-table-count">{filtered.length} of {customers.length}</span>
        </div>

        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No customers found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Orders</th>
                <th style={{ textAlign: 'right' }}>Spent</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{c.full_name || 'No name'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                      Joined {formatDate(c.created_at)}
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <div>{c.phone || '—'}</div>
                    {c.city && <div>{c.city}</div>}
                  </td>
                  <td>
                    {c.role === 'member' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        background: '#fff7ed', color: '#ea580c',
                        border: '1px solid #fed7aa', borderRadius: '999px',
                        fontSize: '12px', fontWeight: 600, padding: '3px 10px'
                      }}>
                        👑 Member
                      </span>
                    ) : (
                      <span className="status-badge status-inactive">Standard</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center' }}>{c.orderCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₦{c.totalSpent.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="admin-btn-secondary" style={{ fontSize: '12px', padding: '6px 14px' }}
                      onClick={() => setViewing(c)}>
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Customer Detail Modal */}
      {viewing && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h2>{viewing.full_name || 'Customer'}</h2>
              <button className="admin-modal-close" onClick={() => setViewing(null)}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="customer-detail-grid">
                <div className="customer-detail-item">
                  <span className="customer-detail-label">Email</span>
                  <span>{viewing.email || '—'}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail-label">Phone</span>
                  <span>{viewing.phone || '—'}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail-label">City</span>
                  <span>{viewing.city || '—'}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail-label">Role</span>
                  <span style={{ textTransform: 'capitalize' }}>{viewing.role || 'user'}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail-label">Orders</span>
                  <span>{viewing.orderCount}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail-label">Total Spent</span>
                  <span style={{ fontWeight: 700 }}>₦{viewing.totalSpent.toLocaleString()}</span>
                </div>
                <div className="customer-detail-item">
                  <span className="customer-detail-label">Joined</span>
                  <span>{new Date(viewing.created_at).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setViewing(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default Customers