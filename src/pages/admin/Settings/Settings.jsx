import { useState, useEffect } from 'react'
import { supabase } from '../../../services/supabase'
import AdminLayout from '../AdminLayout/AdminLayout'
import './Settings.css'

function Settings() {
  const [saving, setSaving] = useState({})
  const [success, setSuccess] = useState({})

  // Payment methods
  const [payments, setPayments] = useState({
    cash_on_delivery: true,
    card_payment: true,
    bank_transfer: true,
  })

  // Return policy
  const [returnPolicy, setReturnPolicy] = useState({
    window_days: 7,
    policy_text: 'Returns accepted within 7 days of delivery for unopened items.',
  })

  // Delivery fees
  const [deliveryFees, setDeliveryFees] = useState({
    default_delivery_fee: 1000,
    pickup_fee: 500,
    free_shipping_threshold: 0,
  })

  // Notifications
  const [notifications, setNotifications] = useState({
    order_confirmation: true,
    order_shipped: true,
    low_stock_alert: true,
    new_member_application: true,
  })

  // Store info
  const [storeInfo, setStoreInfo] = useState({
    store_name: 'Home Basics',
    store_email: '',
    store_phone: '',
    store_address: '',
  })

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('store_settings').select('*')
      if (!data || data.length === 0) return
      const map = {}
      data.forEach(row => { map[row.key] = row.value })

      if (map.payments) setPayments(JSON.parse(map.payments))
      if (map.return_policy) setReturnPolicy(JSON.parse(map.return_policy))
      if (map.delivery_fees) setDeliveryFees(JSON.parse(map.delivery_fees))
      if (map.notifications) setNotifications(JSON.parse(map.notifications))
      if (map.store_info) setStoreInfo(JSON.parse(map.store_info))
    }
    load()
  }, [])

  async function saveSection(key, value) {
    setSaving(prev => ({ ...prev, [key]: true }))
    await supabase.from('store_settings').upsert({ key, value: JSON.stringify(value) }, { onConflict: 'key' })
    setSaving(prev => ({ ...prev, [key]: false }))
    setSuccess(prev => ({ ...prev, [key]: true }))
    setTimeout(() => setSuccess(prev => ({ ...prev, [key]: false })), 2500)
  }

  function SaveBtn({ sectionKey, onClick }) {
    return (
      <button
        className={`admin-btn-primary settings-save-btn ${success[sectionKey] ? 'saved' : ''}`}
        onClick={onClick}
        disabled={saving[sectionKey]}
      >
        {saving[sectionKey] ? 'Saving...' : success[sectionKey] ? '✓ Saved' : 'Save'}
      </button>
    )
  }

  function Toggle({ checked, onChange }) {
    return (
      <button
        className={`settings-toggle ${checked ? 'on' : 'off'}`}
        onClick={() => onChange(!checked)}
      >
        <span className="settings-toggle-thumb" />
      </button>
    )
  }

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Settings</h1>
          <p className="admin-page-sub">Configure store-wide preferences</p>
        </div>
      </div>

      <div className="settings-grid">

        {/* Payment Methods */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#f0fdf4' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <div>
              <p className="settings-card-title">Payment methods</p>
              <p className="settings-card-sub">Enable how customers can pay</p>
            </div>
          </div>

          <div className="settings-rows">
            {[
              { key: 'cash_on_delivery', label: 'Cash on delivery' },
              { key: 'card_payment', label: 'Card payment' },
              { key: 'bank_transfer', label: 'Bank transfer' },
            ].map(({ key, label }) => (
              <div key={key} className="settings-row">
                <span>{label}</span>
                <Toggle
                  checked={payments[key]}
                  onChange={val => setPayments(prev => ({ ...prev, [key]: val }))}
                />
              </div>
            ))}
          </div>

          <SaveBtn sectionKey="payments" onClick={() => saveSection('payments', payments)} />
        </div>

        {/* Return Policy */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#f0fdf4' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <polyline points="1 4 1 10 7 10"/>
                <path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
              </svg>
            </div>
            <div>
              <p className="settings-card-title">Return policy</p>
              <p className="settings-card-sub">Define how returns are accepted</p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="modal-field">
              <label>Return window (days)</label>
              <input
                type="number"
                value={returnPolicy.window_days}
                onChange={e => setReturnPolicy(prev => ({ ...prev, window_days: Number(e.target.value) }))}
              />
            </div>
            <div className="modal-field">
              <label>Policy text</label>
              <textarea
                rows={3}
                value={returnPolicy.policy_text}
                onChange={e => setReturnPolicy(prev => ({ ...prev, policy_text: e.target.value }))}
              />
            </div>
          </div>

          <SaveBtn sectionKey="return_policy" onClick={() => saveSection('return_policy', returnPolicy)} />
        </div>

        {/* Notifications */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#fef9c3' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
            <div>
              <p className="settings-card-title">Notifications</p>
              <p className="settings-card-sub">Email & alert preferences</p>
            </div>
          </div>

          <div className="settings-rows">
            {[
              { key: 'order_confirmation', label: 'Order confirmation emails' },
              { key: 'order_shipped', label: 'Order shipped alerts' },
              { key: 'low_stock_alert', label: 'Low stock alerts' },
              { key: 'new_member_application', label: 'New member application alerts' },
            ].map(({ key, label }) => (
              <div key={key} className="settings-row">
                <span>{label}</span>
                <Toggle
                  checked={notifications[key]}
                  onChange={val => setNotifications(prev => ({ ...prev, [key]: val }))}
                />
              </div>
            ))}
          </div>

          <SaveBtn sectionKey="notifications" onClick={() => saveSection('notifications', notifications)} />
        </div>

        {/* Delivery Fees */}
        <div className="settings-card">
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#f0fdf4' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <p className="settings-card-title">Delivery fees</p>
              <p className="settings-card-sub">Default fees and free shipping threshold</p>
            </div>
          </div>

          <div className="settings-fields">
            <div className="modal-field">
              <label>Default delivery fee (₦)</label>
              <input
                type="number"
                value={deliveryFees.default_delivery_fee}
                onChange={e => setDeliveryFees(prev => ({ ...prev, default_delivery_fee: Number(e.target.value) }))}
              />
            </div>
            <div className="modal-field">
              <label>Pickup fee (₦)</label>
              <input
                type="number"
                value={deliveryFees.pickup_fee}
                onChange={e => setDeliveryFees(prev => ({ ...prev, pickup_fee: Number(e.target.value) }))}
              />
            </div>
            <div className="modal-field">
              <label>Free shipping threshold (₦) — 0 to disable</label>
              <input
                type="number"
                value={deliveryFees.free_shipping_threshold}
                onChange={e => setDeliveryFees(prev => ({ ...prev, free_shipping_threshold: Number(e.target.value) }))}
              />
            </div>
          </div>

          <SaveBtn sectionKey="delivery_fees" onClick={() => saveSection('delivery_fees', deliveryFees)} />
        </div>

        {/* Store Info */}
        <div className="settings-card" style={{ gridColumn: '1 / -1' }}>
          <div className="settings-card-header">
            <div className="settings-card-icon" style={{ background: '#f0fdf4' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="settings-card-title">Store information</p>
              <p className="settings-card-sub">Basic store details</p>
            </div>
          </div>

          <div className="settings-fields settings-fields-grid">
            <div className="modal-field">
              <label>Store name</label>
              <input
                value={storeInfo.store_name}
                onChange={e => setStoreInfo(prev => ({ ...prev, store_name: e.target.value }))}
              />
            </div>
            <div className="modal-field">
              <label>Store email</label>
              <input
                type="email"
                value={storeInfo.store_email}
                onChange={e => setStoreInfo(prev => ({ ...prev, store_email: e.target.value }))}
                placeholder="hello@homebasics.com"
              />
            </div>
            <div className="modal-field">
              <label>Store phone</label>
              <input
                value={storeInfo.store_phone}
                onChange={e => setStoreInfo(prev => ({ ...prev, store_phone: e.target.value }))}
                placeholder="+234..."
              />
            </div>
            <div className="modal-field">
              <label>Store address</label>
              <input
                value={storeInfo.store_address}
                onChange={e => setStoreInfo(prev => ({ ...prev, store_address: e.target.value }))}
                placeholder="123 Main Street, Calabar"
              />
            </div>
          </div>

          <SaveBtn sectionKey="store_info" onClick={() => saveSection('store_info', storeInfo)} />
        </div>

      </div>
    </AdminLayout>
  )
}

export default Settings