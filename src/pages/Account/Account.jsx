import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Account.css'

function Account() {
  const { profile, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <div className="account-layout">
      <aside className="account-sidebar">
        <div className="account-sidebar__avatar">
          <div className="account-sidebar__initials">
            {profile?.full_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <p className="account-sidebar__name">{profile?.full_name || 'User'}</p>
            <p className="account-sidebar__role">{profile?.role || 'Retail'}</p>
          </div>
        </div>

        <nav className="account-sidebar__nav">
          <NavLink to="/account" end className={({ isActive }) => isActive ? 'account-sidebar__link active' : 'account-sidebar__link'}>
            Dashboard
          </NavLink>
          <NavLink to="/account/profile" className={({ isActive }) => isActive ? 'account-sidebar__link active' : 'account-sidebar__link'}>
            Profile
          </NavLink>
          <NavLink to="/account/orders" className={({ isActive }) => isActive ? 'account-sidebar__link active' : 'account-sidebar__link'}>
            Orders
          </NavLink>
          <NavLink to="/account/addresses" className={({ isActive }) => isActive ? 'account-sidebar__link active' : 'account-sidebar__link'}>
            Addresses
          </NavLink>
          <NavLink to="/account/membership" className={({ isActive }) => isActive ? 'account-sidebar__link active' : 'account-sidebar__link'}>
            Membership
          </NavLink>
          <NavLink to="/account/settings" className={({ isActive }) => isActive ? 'account-sidebar__link active' : 'account-sidebar__link'}>
            Settings
          </NavLink>
        </nav>

        <button className="account-sidebar__logout" onClick={handleLogout}>
          Log Out
        </button>
      </aside>

      <main className="account-main">
        <Outlet />
      </main>
    </div>
  )
}

export default Account