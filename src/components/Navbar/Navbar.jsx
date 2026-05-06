import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Navbar.css'

const categoryData = [
  {
    name: 'Body Care & Beauty',
    subcategories: ['Body Lotions', 'Body Wash / Shower Gel', 'Toners & Facial Care', 'Lip Balm', 'Deodorants']
  },
  {
    name: 'Personal Care & Hygiene',
    subcategories: ['Toothpaste & Brushes', 'Feminine Hygiene', 'Cotton & Swabs', 'Hand Sanitizers']
  },
  {
    name: 'Hair Care',
    subcategories: ['Shampoo', 'Conditioners', 'Hair Oils', 'Hair Treatments']
  },
  {
    name: 'Home Care & Cleaning',
    subcategories: ['Dishwashing', 'Floor Cleaners', 'Laundry', 'Air Fresheners']
  },
  {
    name: 'Fragrance & Sprays',
    subcategories: ['Perfumes', 'Body Sprays', 'Room Sprays']
  },
  {
    name: 'Beverages & Edibles',
    subcategories: ['Drinks', 'Snacks', 'Food Items']
  },
  {
    name: 'Home Essentials',
    subcategories: ['Kitchen Items', 'Bathroom', 'Storage']
  },
  {
    name: 'Orekelewa Products',
    subcategories: ['Shea Butter', 'Body Scrubs', 'Night Pads', 'Face & Body']
  }
]

function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showCategories, setShowCategories] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [activeCategory, setActiveCategory] = useState(categoryData[0])
  const [showSearch, setShowSearch] = useState(false)
  const searchRef = useRef(null)
  const categoryRef = useRef(null)
  const userMenuRef = useRef(null)

  const mockProducts = [
    'Orekelewa 50g Classic Shea Butter',
    'Orekelewa 200g Classic Shea Butter',
    'Orekelewa 350g Classic Shea Butter',
    'Orekelewa Face and Body Scrub',
    'Limancy Aloe Vera Shower Gel',
    'Limancy Milk Body Wash',
    'Bamboo Night Pad',
    'Himalayan Powder Salt Toothpaste',
    'Limancy Milk Nourishing Body Lotion',
    'Limancy Antiperspirant Deodorant'
  ]

  function handleSearchChange(e) {
    const val = e.target.value
    setSearchQuery(val)
    if (val.trim().length > 1) {
      const filtered = mockProducts.filter(p =>
        p.toLowerCase().includes(val.toLowerCase())
      )
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
    }
  }

  function handleSuggestionClick(suggestion) {
    navigate(`/shop?search=${encodeURIComponent(suggestion)}`)
    setSearchQuery('')
    setShowSearch(false)
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
    navigate('/')
  }

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false)
      }
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setShowCategories(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img src="/src/assets/logo.png" alt="Home Basics" className="logo-img" />
        </Link>

        {/* Categories Dropdown — click based */}
        <div className="nav-dropdown" ref={categoryRef}>
          <button
            className="nav-link"
            onClick={() => {
              setShowCategories(!showCategories)
              setShowUserMenu(false)
            }}
          >
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
                  <button
                    key={cat.name}
                    className={`cat-item ${activeCategory.name === cat.name ? 'active' : ''}`}
                    onMouseEnter={() => setActiveCategory(cat)}
                    onClick={() => {
                      navigate(`/shop?category=${encodeURIComponent(cat.name)}`)
                      setShowCategories(false)
                    }}
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
                      <Link
                        to={`/shop?category=${encodeURIComponent(sub)}`}
                        className="cat-sub-link"
                        onClick={() => setShowCategories(false)}
                      >
                        {sub}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link to="/become-member" className="nav-link">Membership</Link>

        {/* Search */}
        <div className="navbar-search-wrapper" ref={searchRef}>
          <form className="navbar-search" onSubmit={handleSearch}>
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="What are you shopping for today?"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </form>

          {showSearch && searchSuggestions.length > 0 && (
            <div className="search-dropdown">
              {searchSuggestions.map((s, i) => (
                <button
                  key={i}
                  className="search-suggestion"
                  onClick={() => handleSuggestionClick(s)}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <span>{highlightMatch(s, searchQuery)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Icons */}
        <div className="navbar-right">

          {/* User — click based */}
          {/* User — click based */}
<div className="nav-icon-btn" ref={userMenuRef} onClick={() => {
  setShowUserMenu(!showUserMenu)
  setShowCategories(false)
}}>
  {user ? (
    <div className="user-avatar">
      {profile?.full_name
        ? profile.full_name.charAt(0).toUpperCase()
        : user.email.charAt(0).toUpperCase()
      }
    </div>
  ) : (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
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