import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'

const STATUSES = ['all', 'pending', 'processing', 'delivered', 'cancelled']

function Orders() {
  const [orders, setOrders] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      setOrders(data || [])
      setFiltered(data || [])
      setLoading(false)
    }
    load()
  }, [])

  useEffect(() => {
    let result = [...orders]
    if (statusFilter !== 'all') result = result.filter(o => o.status === statusFilter)
    if (search.trim()) result = result.filter(o =>
      o.payment_ref?.toLowerCase().includes(search.toLowerCase())
    )
    setFiltered(result)
  }, [search, statusFilter, orders])

  async function updateStatus(orderId, newStatus) {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-NG', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Orders</h1>
          <p className="admin-page-sub">Manage and track all customer orders</p>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              placeholder="Search by order number..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s === 'all' ? 'All statuses' : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <span className="admin-table-count">{filtered.length} orders</span>
        </div>

        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>
        ) : filtered.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders found.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.payment_ref || `#${order.id.slice(0, 8).toUpperCase()}`}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {order.payment_status === 'paid' ? 'Card payment' : 'Pay on delivery'}
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₦{order.total_amount?.toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <select
                      className="admin-filter-select"
                      value={order.status}
                      onChange={e => updateStatus(order.id, e.target.value)}
                      style={{ fontSize: '12px', padding: '4px 10px' }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  )
}

export default Orders