import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import logo from "../../assets/logo.png";
import { useCart } from '../../hooks/useCart'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import './Navbar.css'


const categoryData = [
  { name: 'Personal Care & Hygiene', subcategories: ['Toothpaste & Brushes', 'Feminine Hygiene', 'Cotton & Swabs', 'Hand Sanitizers'] },
  { name: 'Skincare', subcategories: ['Body Lotions', 'Body Wash', 'Toners & Facial Care', 'Lip Balm', 'Deodorants'] },
  { name: 'Baby Care', subcategories: ['Baby Lotion', 'Baby Wash', 'Diapers', 'Baby Wipes'] },
  { name: 'Tea & Beverages', subcategories: ['Teas', 'Juices', 'Energy Drinks', 'Water'] },
  { name: 'Snacks & Food', subcategories: ['Snacks', 'Cereals', 'Condiments', 'Food Items'] },
  { name: 'Supplements', subcategories: ['Vitamins', 'Minerals', 'Protein', 'Herbal'] },
]

function Navbar() {
  const location = useLocation()
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/register-success'].includes(location.pathname)
  const { user, profile, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showCategories, setShowCategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState(categoryData[0])
  const [showSearch, setShowSearch] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileExpandedCat, setMobileExpandedCat] = useState(null)

  const searchRef = useRef(null)
  const categoryRef = useRef(null)
  const userMenuRef = useRef(null)

  const mockProducts = [
    'Orekelewa 50g Classic Shea Butter', 'Orekelewa 200g Classic Shea Butter',
    'Orekelewa 350g Classic Shea Butter', 'Orekelewa Face and Body Scrub',
    'Limancy Aloe Vera Shower Gel', 'Limancy Milk Body Wash',
    'Bamboo Night Pad', 'Himalayan Powder Salt Toothpaste',
    'Limancy Milk Nourishing Body Lotion', 'Limancy Antiperspirant Deodorant'
  ]

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchQuery(val)
    if (val.trim().length > 1) {
      const filtered = mockProducts.filter(p => p.toLowerCase().includes(val.toLowerCase()))
      setSearchSuggestions(filtered.slice(0, 7))
      setShowSearch(true)
    } else {
      setSearchSuggestions([])
      setShowSearch(false)
    }
  }

  function handleSearch(e) {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setShowSearch(false)
      setMobileMenuOpen(false)
    }
  }

  function handleSuggestionClick(suggestion) {
    navigate(`/shop?search=${encodeURIComponent(suggestion)}`)
    setSearchQuery('')
    setShowSearch(false)
    setMobileMenuOpen(false)
  }

  function highlightMatch(text, query) {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text
    return (
      <>
        {text.slice(0, index)}
        <strong>{text.slice(index, index + query.length)}</strong>
        {text.slice(index + query.length)}
      </>
    )
  }

  async function handleLogout() {
    await logout()
    setShowUserMenu(false)
    setMobileMenuOpen(false)
    navigate('/')
  }

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearch(false)
      if (categoryRef.current && !categoryRef.current.contains(e.target)) setShowCategories(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <>
      <nav className="navbar">
  <div className="navbar-inner">

    {/* Logo — always visible */}
    <Link to="/" className="navbar-logo">
      <img src={logo} alt="Home Basics" className="logo-img" />
    </Link>

    {/* Only show full navbar on non-auth pages */}
    {!isAuthPage && (
      <>
        {/* Categories Dropdown — desktop */}
        <div className="nav-dropdown desktop-only" ref={categoryRef}>
          <button className="nav-link" onClick={() => { setShowCategories(!showCategories); setShowUserMenu(false) }}>
            Categories
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ transform: showCategories ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {showCategories && (
            <div className="categories-dropdown">
              <div className="cat-left">
                <p className="cat-all-label">All Categories</p>
                {categoryData.map(cat => (
                  <button key={cat.name}
                    className={`cat-item ${activeCategory.name === cat.name ? 'active' : ''}`}
                    onMouseEnter={() => setActiveCategory(cat)}
                    onClick={() => { navigate(`/shop?category=${encodeURIComponent(cat.name)}`); setShowCategories(false) }}
                  >
                    {cat.name}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                ))}
              </div>
              <div className="cat-right">
                <p className="cat-right-title">{activeCategory.name}</p>
                <div className="cat-subcategories">
                  {activeCategory.subcategories.map(sub => (
                    <div key={sub} className="cat-sub-col">
                      <Link to={`/shop?category=${encodeURIComponent(sub)}`} className="cat-sub-link" onClick={() => setShowCategories(false)}>
                        {sub}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link to="/become-member" className="nav-link desktop-only">Membership</Link>

        {/* Search — desktop */}
        <div className="navbar-search-wrapper desktop-only" ref={searchRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="What are you shopping for today?" value={searchQuery} onChange={handleSearchChange} />
          </form>
          {showSearch && searchSuggestions.length > 0 && (
            <div className="search-dropdown">
              {searchSuggestions.map((s, i) => (
                <button key={i} className="search-suggestion" onClick={() => handleSuggestionClick(s)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span>{highlightMatch(s, searchQuery)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="navbar-right" style={{ marginLeft: 'auto' }}>
          {/* User — desktop */}
          <div className="nav-icon-btn desktop-only" ref={userMenuRef} onClick={() => { setShowUserMenu(!showUserMenu); setShowCategories(false) }}>
            {user ? (
              <div className="user-avatar">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
            {showUserMenu && (
              <div className="dropdown-menu user-menu" onClick={e => e.stopPropagation()}>
                {user ? (
                  <>
                    <div className="user-menu-name">{profile?.full_name || 'My Account'}</div>
                    <Link to="/account" className="dropdown-item" onClick={() => setShowUserMenu(false)}>My Account</Link>
                    <Link to="/account?tab=orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                    {profile?.role === 'admin' && (
                      <Link to="/admin" className="dropdown-item" onClick={() => setShowUserMenu(false)}>Admin Dashboard</Link>
                    )}
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>Sign Out</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item" onClick={() => setShowUserMenu(false)}>Sign In</Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setShowUserMenu(false)}>Create Account</Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User icon — mobile only */}
          <div className="nav-icon-btn mobile-only" onClick={() => navigate(user ? '/account' : '/login')}>
            {user ? (
              <div className="user-avatar">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
              </div>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </div>

          {/* Cart */}
          <Link to="/cart" className="nav-icon-btn cart-btn">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </Link>

          {/* Hamburger — mobile only */}
          <button className="hamburger-btn mobile-only" onClick={() => setMobileMenuOpen(true)}>
            <span /><span /><span />
          </button>
        </div>
      </>
    )}

    {/* Auth page right side — just sign in / register links */}
    {isAuthPage && (
      <div className="navbar-right">
        {location.pathname === '/register' ? (
          <Link to="/login" className="auth-nav-link">Sign In</Link>
        ) : location.pathname === '/login' ? (
          <Link to="/register" className="auth-nav-link">Create Account</Link>
        ) : null}
      </div>
    )}

  </div>
</nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-drawer" onClick={e => e.stopPropagation()}>

            {/* Drawer header */}
            <div className="mobile-drawer-header">
              <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
                <img src={logo} alt="Home Basics" className="logo-img" />
              </Link>
              <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>✕</button>
            </div>

            {/* Search */}
            <div className="mobile-search-wrapper">
              <form className="navbar-search" onSubmit={handleSearch}>
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input type="text" placeholder="What are you shopping for today?" value={searchQuery} onChange={handleSearchChange} />
              </form>
              {showSearch && searchSuggestions.length > 0 && (
                <div className="search-dropdown">
                  {searchSuggestions.map((s, i) => (
                    <button key={i} className="search-suggestion" onClick={() => handleSuggestionClick(s)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                      </svg>
                      <span>{highlightMatch(s, searchQuery)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nav links */}
<div className="mobile-nav-links">

  {/* Categories accordion */}
  <p className="mobile-cat-section-label">CATEGORIES</p>
  <div className="mobile-nav-section">
    <button className="mobile-nav-link mobile-nav-toggle" onClick={() => setMobileExpandedCat(mobileExpandedCat === 'categories' ? null : 'categories')}>
      Categories
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ transform: mobileExpandedCat === 'categories' ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>
    {mobileExpandedCat === 'categories' && (
      <div className="mobile-cat-list">
        {categoryData.map(cat => (
          <button key={cat.name} className="mobile-cat-item"
            onClick={() => { navigate(`/shop?category=${encodeURIComponent(cat.name)}`); setMobileMenuOpen(false) }}>
            {cat.name}
          </button>
        ))}
      </div>
    )}
  </div>

  {/* Membership below categories */}
  <Link to="/become-member" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Membership</Link>

</div>

            {/* Account section */}
            <div className="mobile-drawer-footer">
              {user ? (
                <>
                  <div className="mobile-user-name">{profile?.full_name || user.email}</div>
                  <Link to="/account" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>My Account</Link>
                  <Link to="/account?tab=orders" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
                  {profile?.role === 'admin' && (
                    <Link to="/admin" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button className="mobile-logout-btn" onClick={handleLogout}>Sign Out</button>
                </>
              ) : (
                <div className="mobile-auth-btns">
                  <Link to="/login" className="mobile-auth-btn mobile-auth-outline" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
                  <Link to="/register" className="mobile-auth-btn mobile-auth-fill" onClick={() => setMobileMenuOpen(false)}>Create Account</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}

export default Navbar