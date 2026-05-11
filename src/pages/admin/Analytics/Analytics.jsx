import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import './Analytics.css'

function Analytics() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ revenue: 0, orders: 0, customers: 0, members: 0, growth: 0 })
  const [revenueData, setRevenueData] = useState([])
  const [ordersData, setOrdersData] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [memberVsStandard, setMemberVsStandard] = useState({ member: 0, standard: 0 })
  const [statusBreakdown, setStatusBreakdown] = useState([])

  useEffect(() => {
    async function load() {
      const [ordersRes, profilesRes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: true }),
        supabase.from('profiles').select('id, role, created_at'),
      ])

      const orders = ordersRes.data || []
      const profiles = profilesRes.data || []
      const now = new Date()

      // Last 30 days revenue
      const last30 = orders.filter(o => {
        const d = new Date(o.created_at)
        return (now - d) / (1000 * 60 * 60 * 24) <= 30 && o.payment_status === 'paid'
      })
      const revenue = last30.reduce((s, o) => s + (o.total_amount || 0), 0)

      // Last 7 days vs previous 7 days for growth
      const last7 = orders.filter(o => (now - new Date(o.created_at)) / (1000 * 60 * 60 * 24) <= 7 && o.payment_status === 'paid')
      const prev7 = orders.filter(o => {
        const days = (now - new Date(o.created_at)) / (1000 * 60 * 60 * 24)
        return days > 7 && days <= 14 && o.payment_status === 'paid'
      })
      const lastRev = last7.reduce((s, o) => s + (o.total_amount || 0), 0)
      const prevRev = prev7.reduce((s, o) => s + (o.total_amount || 0), 0)
      const growth = prevRev === 0 ? 0 : (((lastRev - prevRev) / prevRev) * 100).toFixed(1)

      // Revenue last 14 days by day
      const revByDay = {}
      const ordByDay = {}
      for (let i = 13; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        revByDay[key] = 0
        ordByDay[key] = 0
      }
      orders.forEach(o => {
        const key = new Date(o.created_at).toISOString().slice(0, 10)
        if (revByDay[key] !== undefined) {
          if (o.payment_status === 'paid') revByDay[key] += o.total_amount || 0
          ordByDay[key] = (ordByDay[key] || 0) + 1
        }
      })

      setRevenueData(Object.entries(revByDay).map(([date, value]) => ({ date: date.slice(5), value })))
      setOrdersData(Object.entries(ordByDay).map(([date, value]) => ({ date: date.slice(5), value })))

      // Top products from order items
      const productCount = {}
      orders.forEach(o => {
        const items = Array.isArray(o.items) ? o.items : []
        items.forEach(item => {
          const name = item.product?.name || item.name || 'Unknown'
          productCount[name] = (productCount[name] || 0) + (item.quantity || 1)
        })
      })
      const sorted = Object.entries(productCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, qty]) => ({ name, qty }))
      setTopProducts(sorted)

      // Member vs Standard
      const memberOrders = orders.filter(o => {
        const profile = profiles.find(p => p.id === o.user_id)
        return profile?.role === 'member'
      })
      const memberRev = memberOrders.filter(o => o.payment_status === 'paid').reduce((s, o) => s + (o.total_amount || 0), 0)
      const standardRev = revenue - memberRev
      setMemberVsStandard({ member: memberRev, standard: standardRev })

      // Status breakdown
      const statusMap = {}
      orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] || 0) + 1 })
      setStatusBreakdown(Object.entries(statusMap).map(([status, count]) => ({ status, count })))

      setStats({
        revenue,
        orders: orders.length,
        customers: profiles.filter(p => p.role !== 'admin').length,
        members: profiles.filter(p => p.role === 'member').length,
        growth: Number(growth),
      })
      setLoading(false)
    }
    load()
  }, [])

  // Simple bar chart using divs
  function BarChart({ data, valuePrefix = '' }) {
    const max = Math.max(...data.map(d => d.value), 1)
    return (
      <div className="bar-chart">
        <div className="bar-chart-bars">
          {data.map((d, i) => (
            <div key={i} className="bar-col">
              <div className="bar-tooltip">
                {valuePrefix}{typeof d.value === 'number' && d.value >= 1000
                  ? `${(d.value / 1000).toFixed(1)}k`
                  : d.value}
              </div>
              <div
                className="bar"
                style={{ height: `${Math.max((d.value / max) * 100, 2)}%` }}
              />
              <span className="bar-label">{d.date}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  function DonutChart({ member, standard }) {
    const total = member + standard || 1
    const memberPct = Math.round((member / total) * 100)
    const standardPct = 100 - memberPct
    const circumference = 2 * Math.PI * 40
    const memberDash = (memberPct / 100) * circumference

    return (
      <div className="donut-wrapper">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="16" />
          <circle cx="50" cy="50" r="40" fill="none"
            stroke="var(--color-primary)" strokeWidth="16"
            strokeDasharray={`${memberDash} ${circumference - memberDash}`}
            strokeDashoffset={circumference / 4}
            strokeLinecap="round"
          />
          {standard > 0 && (
            <circle cx="50" cy="50" r="40" fill="none"
              stroke="#f97316" strokeWidth="16"
              strokeDasharray={`${circumference - memberDash} ${memberDash}`}
              strokeDashoffset={-(memberDash - circumference / 4)}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="donut-legend">
          <div className="donut-legend-item">
            <span className="donut-dot" style={{ background: 'var(--color-primary)' }} />
            <span>Member ({memberPct}%)</span>
          </div>
          <div className="donut-legend-item">
            <span className="donut-dot" style={{ background: '#f97316' }} />
            <span>Standard ({standardPct}%)</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Analytics</h1>
          <p className="admin-page-sub">Sales performance over the last 30 days</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Revenue (30d)</p>
            <p className="admin-stat-value">₦{stats.revenue.toLocaleString()}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Orders</p>
            <p className="admin-stat-value">{stats.orders}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Customers</p>
            <p className="admin-stat-value">{stats.customers}</p>
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
            <p className="admin-stat-label">Growth (7d)</p>
            <p className="admin-stat-value" style={{ color: stats.growth >= 0 ? 'var(--color-primary)' : 'var(--color-error)' }}>
              {stats.growth >= 0 ? '+' : ''}{stats.growth}%
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '40px' }}>Loading...</p>
      ) : (
        <>
          {/* Charts row */}
          <div className="analytics-charts-row">
            <div className="analytics-chart-card">
              <p className="analytics-chart-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                </svg>
                Revenue (last 14 days)
              </p>
              <BarChart data={revenueData} valuePrefix="₦" />
            </div>
            <div className="analytics-chart-card">
              <p className="analytics-chart-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                </svg>
                Orders trend
              </p>
              <BarChart data={ordersData} />
            </div>
          </div>

          {/* Bottom row */}
          <div className="analytics-charts-row" style={{ marginTop: '20px' }}>
            {/* Top products */}
            <div className="analytics-chart-card">
              <p className="analytics-chart-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Best selling products
              </p>
              {topProducts.length === 0 ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>No order data yet.</p>
              ) : (
                <div className="top-products-list">
                  {topProducts.map((p, i) => {
                    const max = topProducts[0].qty
                    return (
                      <div key={i} className="top-product-row">
                        <span className="top-product-rank">{i + 1}</span>
                        <div className="top-product-info">
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span className="top-product-name">{p.name}</span>
                            <span className="top-product-qty">{p.qty} sold</span>
                          </div>
                          <div className="top-product-bar-track">
                            <div
                              className="top-product-bar-fill"
                              style={{ width: `${(p.qty / max) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Member vs Standard */}
            <div className="analytics-chart-card">
              <p className="analytics-chart-title">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                Member vs Standard sales
              </p>
              <DonutChart member={memberVsStandard.member} standard={memberVsStandard.standard} />
              <div className="member-vs-standard-totals">
                <div>
                  <p className="admin-stat-label">Member Revenue</p>
                  <p style={{ fontWeight: 700, color: 'var(--color-primary)', margin: 0 }}>
                    ₦{memberVsStandard.member.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="admin-stat-label">Standard Revenue</p>
                  <p style={{ fontWeight: 700, color: '#f97316', margin: 0 }}>
                    ₦{memberVsStandard.standard.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Status breakdown */}
              <div style={{ marginTop: '20px' }}>
                <p className="analytics-chart-title" style={{ marginBottom: '12px' }}>Order Status Breakdown</p>
                <div className="status-breakdown">
                  {statusBreakdown.map(({ status, count }) => (
                    <div key={status} className="status-breakdown-row">
                      <span className={`status-badge status-${status}`}>
                        {status?.charAt(0).toUpperCase() + status?.slice(1)}
                      </span>
                      <span style={{ fontWeight: 600 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  )
}

export default Analytics