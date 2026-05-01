import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Navbar.css'

const categories = [
  'Body Care & Beauty',
  'Personal Care & Hygiene',
  'Hair Care',
  'Home Care & Cleaning',
  'Fragrance & Sprays',
  'Beverages & Edibles',
  'Home Essentials',
  'Orekelewa Products'
]

function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  async function handleLogout() {
    await logout()
    setShowUserMenu(false)
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Left — Logo + Nav Links */}
        <div className="navbar-left">
          <Link to="/" className="navbar-logo">
            <img src="/src/assets/logo.png" alt="Home Basics" className="logo-img" />
          </Link>

          {/* Categories Dropdown */}
          <div
            className="nav-dropdown"
            onMouseEnter={() => setShowCategories(true)}
            onMouseLeave={() => setShowCategories(false)}
          >
            <button className="nav-link">
              Categories
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {showCategories && (
              <div className="dropdown-menu">
                {categories.map(cat => (
                  <Link
                    key={cat}
                    to={`/shop?category=${encodeURIComponent(cat)}`}
                    className="dropdown-item"
                    onClick={() => setShowCategories(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link to="/become-member" className="nav-link">Membership</Link>
        </div>

        {/* Center — Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="What are you shopping for today?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Right — User + Cart */}
        <div className="navbar-right">

          {/* User Menu */}
          <div
            className="nav-icon-btn"
            onMouseEnter={() => setShowUserMenu(true)}
            onMouseLeave={() => setShowUserMenu(false)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>

            {showUserMenu && (
              <div className="dropdown-menu user-menu">
                {user ? (
                  <>
                    <div className="user-menu-name">
                      {profile?.full_name || 'My Account'}
                    </div>
                    <Link to="/account" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      My Account
                    </Link>
                    <Link to="/account?tab=orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      My Orders
                    </Link>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      Sign In
                    </Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                      Create Account
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <span className="cart-count">0</span>
          </Link>

        </div>
      </div>
    </nav>
  )
}

export default Navbar