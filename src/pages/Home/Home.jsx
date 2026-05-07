import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFeaturedProducts, getOrekelwaDeals } from '../../services/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import crown from "../../assets/crown.png";
import './Home.css'

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
  <img src={crown} alt="crown" style={{ width: '52px', height: '44px' }} />
</div>
          <h2 className="become-member-title">Become a Member</h2>
          <p className="become-member-sub">
            Register with a referral code and unlock exclusive member pricing and special discounts on selected products. All members enjoy special discounts
          </p>
          <Link to="/register" className="become-member-btn">Activate Membership</Link>
        </div>
      </section>
    </div>
  )
}

export default Home