import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/useAuth'
import logo from '../../../assets/logo.png'
import './AdminLayout.css'

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  )},
  { label: 'Orders', path: '/admin/orders', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/>
    </svg>
  )},
  { label: 'Products', path: '/admin/products', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    </svg>
  )},
  { label: 'Customers', path: '/admin/customers', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )},
  { label: 'Membership', path: '/admin/membership', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )},
  { label: 'Delivery', path: '/admin/delivery', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13"/>
      <path d="M16 8h4l3 3v5h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  )},
  { label: 'Analytics', path: '/admin/analytics', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  )},
  { label: 'Settings', path: '/admin/settings', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  )},
]

function AdminLayout({ children }) {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const NavItems = ({ onNav }) => (
    <>
      {NAV_ITEMS.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          onClick={onNav}
        >
          {item.icon}
          <span>{item.label}</span>
        </NavLink>
      ))}
    </>
  )

  return (
    <div className="admin-shell">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src={logo} alt="Home Basics" className="admin-brand-logo" />
          <div>
            <p className="admin-brand-name">Homebasics</p>
            <p className="admin-brand-role">ADMIN</p>
          </div>
        </div>
        <nav className="admin-nav">
          <NavItems onNav={() => {}} />
        </nav>
        <button className="admin-signout" onClick={handleLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign out
        </button>
      </aside>

      {/* ── MAIN ── */}
      <div className="admin-main">

        {/* Desktop topbar */}
        <header className="admin-topbar">
          <p className="admin-portal-label">Management Portal</p>
          <div className="admin-topbar-right">
            <div>
              <p className="admin-topbar-email">{user?.email}</p>
              <p className="admin-topbar-role">ADMIN</p>
            </div>
            <div className="admin-topbar-avatar">
              {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Mobile topbar */}
        <header className="admin-mobile-topbar">
          <button className="admin-hamburger" onClick={() => setDrawerOpen(true)}>
            <span /><span /><span />
          </button>
          <div className="admin-topbar-avatar">
            {profile?.full_name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </header>

        <div className="admin-content">
          {children}
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {drawerOpen && (
        <div className="admin-drawer-overlay" onClick={() => setDrawerOpen(false)}>
          <div className="admin-drawer" onClick={e => e.stopPropagation()}>
            <div className="admin-drawer-header">
              <div className="admin-brand">
                <img src={logo} alt="Home Basics" className="admin-brand-logo" />
                <div>
                  <p className="admin-brand-name">Homebasics</p>
                  <p className="admin-brand-role">ADMIN</p>
                </div>
              </div>
              <button className="admin-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
            </div>
            <nav className="admin-nav">
              <NavItems onNav={() => setDrawerOpen(false)} />
            </nav>
            <button className="admin-signout" onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLayout