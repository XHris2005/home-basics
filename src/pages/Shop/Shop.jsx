import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getAllProducts } from '../../services/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import './Shop.css'

const BRANDS = ['Orekelewa', 'Limancy', 'Miubaby', 'Bocare', 'Others']
const SIZES = ['50g – 200g', '250g – 500g', '1kg+', '100ml – 250ml', '500ml – 1L+']
const DEALS = ['Orekelewa', 'Bulk Discount', 'Membership']
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most Sold', value: 'most_sold' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Highest Rating', value: 'rating' },
]

function Shop() {
  const { isMember } = useAuth()
  const [searchParams] = useSearchParams()
  const categoryParam = searchParams.get('category')
  const searchParam = searchParams.get('search')

  const [products, setProducts] = useState([])
  const [displayed, setDisplayed] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 9

  // Filters
  const [priceRange, setPriceRange] = useState([0, 50000])
  const [selectedBrands, setSelectedBrands] = useState([])
  const [selectedSizes, setSelectedSizes] = useState([])
  const [selectedDeals, setSelectedDeals] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  // Collapsible filter sections
  const [openSections, setOpenSections] = useState({
    price: true, brand: true, size: true, deals: true
  })

  const hasActiveFilters = selectedBrands.length > 0 || selectedSizes.length > 0 ||
    selectedDeals.length > 0 || priceRange[0] > 0 || priceRange[1] < 50000

  function toggleSection(key) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function togglePill(value, selected, setSelected) {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  function clearFilters() {
    setPriceRange([0, 50000])
    setSelectedBrands([])
    setSelectedSizes([])
    setSelectedDeals([])
  }

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getAllProducts({
        search: searchParam,
        category: categoryParam
      })
      setProducts(data)
      setLoading(false)
    }
    load()
  }, [searchParam, categoryParam])

  useEffect(() => {
    let filtered = [...products]

    // Price filter
    filtered = filtered.filter(p =>
      p.retail_price >= priceRange[0] && p.retail_price <= priceRange[1]
    )

    // Brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p =>
        selectedBrands.some(brand =>
          brand === 'Others'
            ? !['Orekelewa', 'Limancy', 'Miubaby', 'Bocare'].some(b => p.name.toLowerCase().includes(b.toLowerCase()))
            : p.name.toLowerCase().includes(brand.toLowerCase())
        )
      )
    }

    // Deals filter
    if (selectedDeals.includes('Bulk Discount')) {
      filtered = filtered.filter(p => p.wholesale_price < p.retail_price)
    }
    if (selectedDeals.includes('Membership')) {
      filtered = filtered.filter(p => p.is_member_product)
    }
    if (selectedDeals.includes('Orekelewa')) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes('orekelewa'))
    }

    // Sort
    if (sortBy === 'price_asc') filtered.sort((a, b) => a.retail_price - b.retail_price)
    if (sortBy === 'price_desc') filtered.sort((a, b) => b.retail_price - a.retail_price)
    if (sortBy === 'newest') filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    setDisplayed(filtered)
    setPage(1)
  }, [products, priceRange, selectedBrands, selectedSizes, selectedDeals, sortBy])

  const visibleProducts = displayed.slice(0, page * PAGE_SIZE)
  const hasMore = visibleProducts.length < displayed.length

  const pageTitle = categoryParam || (searchParam ? `Search: "${searchParam}"` : 'All Products')

  return (
    <div className="shop-page">
      <div className="shop-inner">

        {/* Breadcrumb + Sort */}
        <div className="shop-topbar">
          <div className="shop-breadcrumb">
            <Link to="/">Home</Link>
            <span>›</span>
            <span>{pageTitle}</span>
          </div>
          <div className="shop-sort">
            <span className="sort-label">Sort by:</span>
            <div className="sort-dropdown-wrapper">
              <button
                className="sort-dropdown-btn"
                onClick={() => setShowSortDropdown(!showSortDropdown)}
              >
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {showSortDropdown && (
                <div className="sort-dropdown-menu">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`sort-option ${sortBy === opt.value ? 'active' : ''}`}
                      onClick={() => { setSortBy(opt.value); setShowSortDropdown(false) }}
                    >
                      {opt.label}
                      {sortBy === opt.value && <span className="sort-check">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shop-layout">

          {/* Sidebar */}
          <aside className="shop-sidebar">
            <div className="sidebar-header">
              <p className="sidebar-title">Filters</p>
              {hasActiveFilters && (
                <div className="filter-active-row">
                  <span className="filter-active-badge">Filter active</span>
                  <button className="filter-clear-btn" onClick={clearFilters}>Clear all</button>
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="filter-section">
              <button className="filter-section-header" onClick={() => toggleSection('price')}>
                <span>Price Range</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: openSections.price ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openSections.price && (
                <div className="filter-section-body">
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="500"
                    value={priceRange[1]}
                    onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="price-range-slider"
                  />
                  <div className="price-range-labels">
                    <span>₦{priceRange[0].toLocaleString()}</span>
                    <span>₦{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Brand */}
            <div className="filter-section">
              <button className="filter-section-header" onClick={() => toggleSection('brand')}>
                <span>Brand</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: openSections.brand ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openSections.brand && (
                <div className="filter-section-body">
                  <div className="filter-pills">
                    {BRANDS.map(brand => (
                      <button
                        key={brand}
                        className={`filter-pill ${selectedBrands.includes(brand) ? 'active' : ''}`}
                        onClick={() => togglePill(brand, selectedBrands, setSelectedBrands)}
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Size */}
            <div className="filter-section">
              <button className="filter-section-header" onClick={() => toggleSection('size')}>
                <span>Size</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: openSections.size ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openSections.size && (
                <div className="filter-section-body">
                  <div className="filter-pills">
                    {SIZES.map(size => (
                      <button
                        key={size}
                        className={`filter-pill ${selectedSizes.includes(size) ? 'active' : ''}`}
                        onClick={() => togglePill(size, selectedSizes, setSelectedSizes)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Deals & Savings */}
            <div className="filter-section">
              <button className="filter-section-header" onClick={() => toggleSection('deals')}>
                <span>Deals & Savings</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ transform: openSections.deals ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openSections.deals && (
                <div className="filter-section-body">
                  <div className="filter-pills">
                    {DEALS.map(deal => (
                      <button
                        key={deal}
                        className={`filter-pill ${selectedDeals.includes(deal) ? 'active' : ''}`}
                        onClick={() => togglePill(deal, selectedDeals, setSelectedDeals)}
                      >
                        {deal}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="shop-content">
            {loading ? (
              <div className="shop-loading">Loading products...</div>
            ) : displayed.length === 0 ? (
              <div className="shop-empty">
                <p>No products found.</p>
                <button onClick={clearFilters} className="shop-clear-btn">Clear filters</button>
              </div>
            ) : (
              <>
                <div className="shop-grid">
                  {visibleProducts.map(product => (
                    <ProductCard key={product.id} product={product} isMember={isMember} />
                  ))}
                </div>
                {hasMore && (
                  <div className="load-more-wrapper">
                    <button
                      className="load-more-btn"
                      onClick={() => setPage(prev => prev + 1)}
                    >
                      Load More ↓
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Shop