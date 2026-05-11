import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import { STATES, getLGAs, getAreas } from '../../../data/nigeriaGeo'
import './Delivery.css'

function Delivery() {
  const [zones, setZones] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingZone, setEditingZone] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [stats, setStats] = useState({ activeZones: 0, inTransit: 0, pendingDispatch: 0 })
  const [form, setForm] = useState({ name: '', state: '', lga: '', areas: '', fee: '', eta: '', is_active: true })

  async function load() {
    const [zonesRes, ordersRes] = await Promise.all([
      supabase.from('delivery_zones').select('*').order('created_at', { ascending: true }),
      supabase.from('orders').select('id, payment_ref, status, delivery_method, delivery_address, total_amount, created_at')
        .in('status', ['pending', 'processing'])
        .eq('delivery_method', 'delivery')
        .order('created_at', { ascending: false }),
    ])

    const allZones = zonesRes.data || []
    const dispatchOrders = ordersRes.data || []

    setZones(allZones)
    setOrders(dispatchOrders)
    setStats({
      activeZones: allZones.filter(z => z.is_active).length,
      inTransit: dispatchOrders.filter(o => o.status === 'processing').length,
      pendingDispatch: dispatchOrders.filter(o => o.status === 'pending').length,
    })
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openAdd() {
    setForm({ name: '', areas: '', fee: '', eta: '', is_active: true })
    setEditingZone(null)
    setShowModal(true)
  }

  function openEdit(zone) {
  setForm({
    name: zone.name || '',
    state: zone.state || '',
    lga: zone.lga || '',
    areas: Array.isArray(zone.areas) ? zone.areas.join(', ') : zone.areas || '',
    fee: zone.fee || '',
    eta: zone.eta || '',
    is_active: zone.is_active ?? true,
  })
  setEditingZone(zone)
  setShowModal(true)
}

  async function handleSave() {
    if (!form.name || !form.fee) { alert('Zone name and fee are required.'); return }
    const payload = {
  name: form.name || `${form.lga}, ${form.state}`,
  state: form.state,
  lga: form.lga,
  areas: form.areas.split(',').map(a => a.trim()).filter(Boolean),
  fee: Number(form.fee),
  eta: form.eta,
  is_active: form.is_active,
}
    if (editingZone) {
      await supabase.from('delivery_zones').update(payload).eq('id', editingZone.id)
    } else {
      await supabase.from('delivery_zones').insert([payload])
    }
    setShowModal(false)
    load()
  }

  async function handleDelete(id) {
    await supabase.from('delivery_zones').delete().eq('id', id)
    setDeleteConfirm(null)
    load()
  }

  async function toggleZone(zone) {
    await supabase.from('delivery_zones').update({ is_active: !zone.is_active }).eq('id', zone.id)
    load()
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-NG', { month: 'numeric', day: 'numeric', year: 'numeric' })
  }

  function set(key, val) { setForm(prev => ({ ...prev, [key]: val })) }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Delivery</h1>
          <p className="admin-page-sub">Delivery zones, shipping fees and dispatch overview</p>
        </div>
        <button className="admin-btn-primary" onClick={openAdd}>+ Add Zone</button>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Active Zones</p>
            <p className="admin-stat-value">{stats.activeZones}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">In Transit</p>
            <p className="admin-stat-value">{stats.inTransit}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#f0fdf4' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
          </div>
        </div>
        <div className="admin-stat-card">
          <div>
            <p className="admin-stat-label">Pending Dispatch</p>
            <p className="admin-stat-value">{stats.pendingDispatch}</p>
          </div>
          <div className="admin-stat-icon" style={{ background: '#fef9c3' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Delivery Zones */}
      <div className="admin-table-wrapper" style={{ marginBottom: '24px' }}>
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Delivery Zones</p>
          </div>
        </div>

        {loading ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading...</p>
        ) : zones.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No zones yet. Add your first delivery zone.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Areas Covered</th>
                <th>Fee</th>
                <th>ETA</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr key={zone.id}>
                  <td style={{ fontWeight: 600 }}>{zone.name}</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    {Array.isArray(zone.areas) ? zone.areas.join(', ') : zone.areas || '—'}
                  </td>
                  <td style={{ fontWeight: 600 }}>₦{Number(zone.fee).toLocaleString()}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{zone.eta || '—'}</td>
                  <td>
                    <span
                      className={`status-badge ${zone.is_active ? 'status-active' : 'status-inactive'}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleZone(zone)}
                      title="Click to toggle"
                    >
                      {zone.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button className="admin-icon-btn" onClick={() => openEdit(zone)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button className="admin-icon-btn danger" onClick={() => setDeleteConfirm(zone)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Dispatch Overview */}
      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="3" width="15" height="13"/>
              <path d="M16 8h4l3 3v5h-7V8z"/>
              <circle cx="5.5" cy="18.5" r="2.5"/>
              <circle cx="18.5" cy="18.5" r="2.5"/>
            </svg>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px' }}>Dispatch Overview</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-muted)' }}>Orders awaiting dispatch or in transit</p>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <p style={{ padding: '24px', textAlign: 'center', color: 'var(--color-text-muted)' }}>No orders pending dispatch.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Delivery Address</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Total</th>
                <th style={{ textAlign: 'right' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.payment_ref || `#${order.id.slice(0, 8).toUpperCase()}`}</td>
                  <td style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                    {order.delivery_address?.address
                      ? `${order.delivery_address.address}, ${order.delivery_address.city || ''}`
                      : '—'}
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>₦{order.total_amount?.toLocaleString()}</td>
                  <td style={{ textAlign: 'right', color: 'var(--color-text-muted)' }}>{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Zone Modal */}
      {showModal && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal" style={{ maxWidth: '480px' }}>
            <div className="admin-modal-header">
              <h2>{editingZone ? 'Edit Zone' : 'Add Delivery Zone'}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal-body">
  {/* State */}
  <div className="modal-field">
    <label>State *</label>
    <select
      value={form.state}
      onChange={e => {
        set('state', e.target.value)
        set('lga', '')
        set('areas', '')
        set('name', e.target.value)
      }}
    >
      <option value="">Select state</option>
      {STATES.map(s => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  </div>

  {/* LGA */}
  {form.state && (
    <div className="modal-field">
      <label>LGA *</label>
      <select
        value={form.lga}
        onChange={e => {
          const lga = e.target.value
          set('lga', lga)
          set('name', `${lga}, ${form.state}`)
          // Auto-populate areas if available
          const availableAreas = getAreas(form.state, lga)
          if (availableAreas.length > 0) {
            set('areas', availableAreas.join(', '))
          } else {
            set('areas', '')
          }
        }}
      >
        <option value="">Select LGA</option>
        {getLGAs(form.state).map(lga => (
          <option key={lga} value={lga}>{lga}</option>
        ))}
      </select>
    </div>
  )}

  {/* Zone Name — auto-filled but editable */}
  <div className="modal-field">
    <label>Zone Name *</label>
    <input
      value={form.name}
      onChange={e => set('name', e.target.value)}
      placeholder="e.g. Lagos Mainland"
    />
    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
      Auto-filled from state/LGA — edit if needed
    </span>
  </div>

  {/* Areas */}
  <div className="modal-field">
    <label>Areas Covered</label>
    <textarea
      value={form.areas}
      onChange={e => set('areas', e.target.value)}
      placeholder="Auto-filled if available, or type comma-separated areas"
      rows={3}
    />
    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
      Comma separated — e.g. Yaba, Surulere, Ikeja
    </span>
  </div>

  {/* Fee + ETA */}
  <div className="modal-row">
    <div className="modal-field">
      <label>Fee (₦) *</label>
      <input
        type="number"
        value={form.fee}
        onChange={e => set('fee', e.target.value)}
        placeholder="0"
      />
    </div>
    <div className="modal-field">
      <label>ETA</label>
      <input
        value={form.eta}
        onChange={e => set('eta', e.target.value)}
        placeholder="e.g. 1–2 days"
      />
    </div>
  </div>

  {/* Status */}
  <div className="modal-field">
    <label>Status</label>
    <select value={form.is_active} onChange={e => set('is_active', e.target.value === 'true')}>
      <option value="true">Active</option>
      <option value="false">Inactive</option>
    </select>
  </div>
</div>
            <div className="admin-modal-footer">
              <button className="admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave}>
                {editingZone ? 'Save Changes' : 'Add Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="admin-modal-backdrop">
          <div className="admin-confirm-modal">
            <h3>Delete Zone?</h3>
            <p>Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
            <div className="admin-confirm-actions">
              <button className="admin-btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              <button className="admin-btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default Delivery