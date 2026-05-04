import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFeaturedProducts, getOrekelwaDeals } from '../../services/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import './Home.css'

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function Home() {
  const { isMember } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [dealsProducts, setDealsProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProducts() {
      const [featured, deals] = await Promise.all([
        getFeaturedProducts(),
        getOrekelwaDeals()
      ])
      setFeaturedProducts(featured)
      setDealsProducts(deals)
      setLoading(false)
    }
    loadProducts()
  }, [])

 if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p>Loading...</p>
    </div>
  )

  return (
    <div className="home">

      {/* ── HERO ── */}
{/* ── HERO ── */}
<section className="hero">
  <div className="hero-inner">

    {/* Top Left — product card */}
    <div className="hero-card" style={{ top: '20px', left: '0px', width: '150px' }}>
      <div className="hero-card-img" style={{
    backgroundImage: 'url(https://res.cloudinary.com/db2a43rey/image/upload/v1777816491/1777673684456_avgyk5.png)',
    backgroundSize: 'cover', backgroundPosition: 'center', height: '130px'
  }} />
  <p className="hero-card-name">Orekelewa Organics...</p>
  <span className="hero-card-stars">★★★★★ (4K)</span>
    </div>

    {/* Top Left — Orekelewa brand card overlapping */}
    <div className="hero-card hero-card-brand" style={{ top: '10px', left: '160px', width: '105px', height: '110px', backgroundImage: 'url(/src/assets/hero-bg-green.jpg)', backgroundSize: 'cover' }}>
      <span className="hero-brand-text">Orekelewa</span>
    </div>

    {/* Bottom Left — black stone */}
    <div className="hero-card hero-card-dark" style={{ bottom: '70px', left: '40px', width: '105px', height: '110px', backgroundImage: 'url(/src/assets/hero-bg-black.jpg)', backgroundSize: 'cover' }} />

    {/* Bottom Left — antiperspirant card overlapping */}
    <div className="hero-card" style={{ bottom: '-70px', left: '100px', width: '150px' }}>
      <div className="hero-card-img" style={{
    backgroundImage: 'url(https://res.cloudinary.com/db2a43rey/image/upload/v1777816636/1777727879912_oawhae.png)',
    backgroundSize: 'cover', backgroundPosition: 'center', height: '130px'
  }} />
      <p className="hero-card-name">Antiperspirant Deodo...</p>
      <span className="hero-card-stars">★★★★★ (4K)</span>
    </div>

    {/* Top Right — dark space card */}
    <div className="hero-card hero-card-dark" style={{ top: '85px', right: '70px', width: '105px', height: '110px', backgroundImage: 'url(/src/assets/hero-bg-dark.jpg)', backgroundSize: 'cover' }} />

    {/* Top Right — bamboo blanket card overlapping */}
    <div className="hero-card" style={{ top: '0px', right: '130px', width: '150px' }}>
      <div className="hero-card-img" style={{
    backgroundImage: 'url(https://res.cloudinary.com/db2a43rey/image/upload/v1777816644/1777735906323_kzikiy.png)',
    backgroundSize: 'cover', backgroundPosition: 'center', height: '130px'
  }} />
      <p className="hero-card-name">Bamboo blanket</p>
      <span className="hero-card-stars">★★★★★ (4K)</span>
    </div>

    {/* Bottom Right — Limacy brand card */}
    <div className="hero-card hero-card-brand" style={{ bottom: '-20px', right: '200px', width: '105px', height: '110px', backgroundImage: 'url(/src/assets/hero-bg-blue.jpg)', backgroundSize: 'cover' }}>
      <span className="hero-brand-text">Limacy</span>
    </div>

    {/* Bottom Right — Limacy product card overlapping */}
    <div className="hero-card" style={{ bottom: '10px', right: '20px', width: '150px' }}>
      <div className="hero-card-img" style={{
    backgroundImage: 'url(https://res.cloudinary.com/db2a43rey/image/upload/v1777816614/1777673684892_bddmn8.png)',
    backgroundSize: 'cover', backgroundPosition: 'center', height: '110px'
  }} />
      <p className="hero-card-name">Limacy Milk Body Lot...</p>
      <span className="hero-card-stars">★★★★★ (4K)</span>
    </div>

    {/* Center content */}
    <div className="hero-content">
      <h1 className="hero-headline">
        Stock Your <span className="hero-green">Home Smartly</span><br />
        Without Paying Premium Prices
      </h1>
      <p className="hero-subtext">
        Unlock premium everyday home essentials. Transparent pricing for everyone with exclusive membership pricing and whole sale options.
      </p>
      <Link to="/shop" className="hero-btn">
        Start Shopping →
      </Link>
    </div>

  </div>
</section>

      {/* ── MEMBER DISCOUNT BANNER ── */}
      <section className="member-banner">
        <div className="member-banner-inner">
          <div className="member-banner-left">
            <p className="member-banner-title">Get Exclusive Member Discounts</p>
            <p className="member-banner-sub">Unlock exclusive membership pricing on products you use daily</p>
          </div>
          <Link to="/register" className="member-banner-btn">
            Unlock Member Prices
          </Link>
        </div>
      </section>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="products-section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Our most popular picks</p>
            </div>
            <Link to="/shop" className="view-all-link">View All →</Link>
          </div>

          <div className="products-scroll-wrapper">
  <div className="products-scroll" id="featured-scroll">
    {featuredProducts.map(product => (
      <ProductCard key={product.id} product={product} isMember={isMember} />
    ))}
  </div>
  <button className="scroll-arrow" onClick={() => {
    document.getElementById('featured-scroll').scrollBy({ left: 320, behavior: 'smooth' })
  }}>›</button>
</div>
        </div>
      </section>

      {/* ── WHOLESALE CTA BANNER ── */}
      <section className="wholesale-banner">
        <div className="wholesale-banner-inner">
          <div className="wholesale-banner-left">
            <h2 className="wholesale-banner-title">
              Get up to 15% Discount on<br />Orekelewa Products
            </h2>
            <p className="wholesale-banner-sub">
              Get discounted pricing automatically when you buy 24+ of a single Orekelewa product.
            </p>
            <Link to="/shop?category=Orekelewa+Products" className="wholesale-banner-btn">
              Shop Wholesale Discount
            </Link>
          </div>
          <div className="wholesale-banner-right">
  <div className="wholesale-img-stack">
    <div className="wholesale-product-card wholesale-card-1">
      <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816636/1777735906221_i9q18v.jpg" alt="Shea Butter" />
    </div>
    <div className="wholesale-product-card wholesale-card-2">
      <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816648/enhanced_product_hv213t.png" alt="Deluxe Shea Butter" />
    </div>
    <div className="wholesale-product-card wholesale-card-3">
      <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816491/1777673684456_avgyk5.png" alt="Face Scrub" />
    </div>
    <div className="wholesale-product-card wholesale-card-4">
      <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816649/IMG-20260413-WA0016_zszkcs.jpg" alt="Coconut Oil" />
    </div>
  </div>
</div>
        </div>
      </section>

      {/* ── OREKELEWA DEALS ── */}
      <section className="products-section">
        <div className="section-inner">
          <div className="section-header">
            <div>
              <h2 className="section-title">Orekelewa Deals</h2>
              <p className="section-subtitle">Get discounted prices on bulk purchase per unit on all Orekelewa products</p>
            </div>
            <Link to="/shop?category=Orekelewa+Products" className="view-all-link">View All →</Link>
          </div>

  <div className="products-scroll-wrapper">
  <div className="products-scroll" id="deals-scroll">
    {dealsProducts.map(product => (
      <ProductCard key={product.id} product={product} isMember={isMember} />
    ))}
  </div>
  <button className="scroll-arrow" onClick={() => {
    document.getElementById('deals-scroll').scrollBy({ left: 320, behavior: 'smooth' })
  }}>›</button>
</div>
</div>
      </section>

      {/* ── BECOME A MEMBER ── */}
      <section className="become-member-section">
        <div className="become-member-inner">
          <div className="become-member-crown">
  <img src="/src/assets/crown.png" alt="crown" style={{ width: '52px', height: '44px' }} />
</div>
          <h2 className="become-member-title">Become a Member</h2>
          <p className="become-member-sub">
            Register with a referral code and unlock exclusive member pricing and special discounts on selected products. All members enjoy special discounts
          </p>
          <Link to="/register" className="become-member-btn">Activate Membership</Link>
        </div>
      </section>

      {/* ── TRUST BADGES ── */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 5v3h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Fast Delivery</p>
              <p className="trust-desc">Quick & reliable shipping</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Secure Payments</p>
              <p className="trust-desc">100% protected transactions</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Member Pricing</p>
              <p className="trust-desc">Exclusive member prices</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="1.5">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Wholesale Deals</p>
              <p className="trust-desc">Buy 24+ & save more (Orekelewa)</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/src/assets/logo.png" alt="Homebasics" className="footer-logo-img" />
              <span className="footer-logo-text">Homebasics</span>
            </div>
            <p className="footer-brand-desc">
              Your #1 go-to destination for everyday essentials. Shop quality products at better prices with fast, reliable delivery.
            </p>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Categories</p>
            <Link to="/shop?category=Body+Care+%26+Beauty" className="footer-link">Body Care & Beauty</Link>
            <Link to="/shop?category=Personal+Care+%26+Hygiene" className="footer-link">Personal Care & Hygiene</Link>
            <Link to="/shop?category=Hair+Care" className="footer-link">Hair Care</Link>
            <Link to="/shop?category=Home+Care+%26+Cleaning" className="footer-link">Home Care & Cleaning</Link>
            <Link to="/shop?category=Fragrance+%26+Sprays" className="footer-link">Fragrance & Sprays</Link>
            <Link to="/shop?category=Beverages+%26+Edibles" className="footer-link">Beverages & Edibles</Link>
            <Link to="/shop?category=Home+Essentials" className="footer-link">Home Essentials</Link>
            <Link to="/shop?category=Orekelewa+Products" className="footer-link">Orekelewa Products</Link>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Contact</p>
            <span className="footer-link">Call Us</span>
            <span className="footer-link">Customer Support</span>
            <span className="footer-link">Email Support</span>
            <span className="footer-link">0901234567890</span>
            <span className="footer-link">Orekelewa Products</span>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Account</p>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/register" className="footer-link">Create Account</Link>
            <Link to="/account" className="footer-link">My Account</Link>
            <Link to="/cart" className="footer-link">Cart</Link>
            <Link to="/account?tab=orders" className="footer-link">My Order</Link>
          </div>

          <div className="footer-col">
            <p className="footer-col-title">Company</p>
            <span className="footer-link">About Homebasics</span>
            <Link to="/become-member" className="footer-link">Membership</Link>
            <span className="footer-link">Privacy Policy</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Homebasics. All rights reserved</p>
        </div>
      </footer>

    </div>
  )
}

export default Home