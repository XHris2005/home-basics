import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import ProductModal from '../Products/ProductModal'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ revenue: 0, total: 0, pending: 0, delivered: 0, members: 0, inStock: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProductModal, setShowProductModal] = useState(false)

  useEffect(() => {
    async function load() {
      const [ordersRes, membersRes, stockRes] = await Promise.all([
        supabase.from('orders').select('id, payment_ref, status, total_amount, payment_status, created_at').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'member'),
        supabase.from('products').select('stock').eq('is_active', true),
      ])

      const orders = ordersRes.data || []
      const revenue = orders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount || 0), 0)
      const pending = orders.filter(o => o.status === 'pending').length
      const delivered = orders.filter(o => o.status === 'delivered').length
      const inStock = (stockRes.data || []).filter(p => p.stock > 0).length

      setStats({
        revenue,
        total: orders.length,
        pending,
        delivered,
        members: membersRes.count || 0,
        inStock,
      })
      setRecentOrders(orders.slice(0, 5))
      setLoading(false)
    }
    load()
  }, [])

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-NG', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-sub">Overview of your store performance</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="admin-btn-primary" onClick={() => setShowProductModal(true)}>
            + Add Product
          </button>
          <button className="admin-btn-secondary" onClick={() => navigate('/admin/orders')}>
            Update Orders
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Revenue</p>
            <p className="admin-stat-value">₦{stats.revenue.toLocaleString()}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Total Orders</p>
            <p className="admin-stat-value">{stats.total}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
            </svg>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Pending</p>
            <p className="admin-stat-value">{stats.pending}</p>
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
            <p className="admin-stat-label">Delivered</p>
            <p className="admin-stat-value">{stats.delivered}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Members</p>
            <p className="admin-stat-value">{stats.members}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#fff7ed' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">In Stock</p>
            <p className="admin-stat-value">{stats.inStock}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '16px' }}>Recent Orders</p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-muted)' }}>Latest 5 orders placed</p>
          </div>
          <button className="admin-btn-secondary" onClick={() => navigate('/admin/orders')}>View all</button>
        </div>

        {loading ? (
          <p style={{ padding: '24px', color: 'var(--color-text-muted)', textAlign: 'center' }}>Loading...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Placed</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order.id} style={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>
                  <td style={{ fontWeight: 600 }}>{order.payment_ref || `#${order.id.slice(0, 6).toUpperCase()}`}</td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>₦{order.total_amount?.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showProductModal && (
  <ProductModal
    product={null}
    onClose={() => setShowProductModal(false)}
    onSaved={() => { setShowProductModal(false); load() }}
  />
)}
    </AdminLayout>
  )
}

export default Dashboard