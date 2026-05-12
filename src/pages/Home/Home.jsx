import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getFeaturedProducts, getOrekelwaDeals, getAllProducts } from '../../services/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import crown from "../../assets/crown.png";
import './Home.css'

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return

    setTimeout(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('visible')
            observer.unobserve(el)
          }
        },
        { threshold: 0, rootMargin: '0px 0px -60px 0px' }
      )
      observer.observe(el)
    }, 150)

  }, [])
  return ref
}

function Home() {
  const { isMember } = useAuth()
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [dealsProducts, setDealsProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [cardProducts, setCardProducts] = useState([])

  const memberBannerRef  = useScrollReveal()
  const featuredRef      = useScrollReveal()
  const wholesaleRef     = useScrollReveal()
  const dealsRef         = useScrollReveal()
  const becomeMemberRef  = useScrollReveal()

  useEffect(() => {
    async function loadProducts() {
  const [featured, deals, all] = await Promise.all([
    getFeaturedProducts(),
    getOrekelwaDeals(),
    getAllProducts()
  ])
  setFeaturedProducts(featured)
  setDealsProducts(deals)
  setAllProducts(all)
  setLoading(false)
}
    loadProducts()
  }, [])

  useEffect(() => {
  if (allProducts.length === 0) return

  function pickRandom() {
  const shuffled = [...allProducts].sort(() => Math.random() - 0.5)
  // Each card gets a unique product by taking one from each position
  setCardProducts([
    shuffled[0] || null,
    shuffled[1] || null,
    shuffled[2] || null,
    shuffled[3] || null,
  ])
}

  pickRandom()
  const interval = setInterval(pickRandom, 6000)
  return () => clearInterval(interval)
}, [allProducts])

  useEffect(() => {
  const timer = setTimeout(() => {
    document.querySelectorAll('.fade-in-up').forEach(el => el.classList.add('visible'))
  }, 1500)
  return () => clearTimeout(timer)
}, [])


  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <p>Loading...</p>
    </div>
  )

  return (
    <div className="home">

      {/* ── HERO ── */}
<section className="hero">
  <div className="hero-inner">

    {/* Top-left */}
    <div className="hero-flip-wrapper" style={{ position: 'absolute', top: '60px', left: '30px', zIndex: 1, transform: 'rotate(-12deg)' }}>
      <div className="flip-card" style={{ '--delay': '0s' }}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
  <img src={cardProducts[0]?.images?.[0]} className="flip-front-img-actual" alt="" />
  <p className="flip-front-name">{cardProducts[0]?.name}</p>
  <span className="flip-front-stars">★★★★★</span>
</div>
          <div className="flip-card-back">
            <p className="discount-label">SAVE UP TO</p>
            <p className="discount-percent">15%</p>
            <p className="discount-sub">on bulk orders</p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom-left */}
    <div className="hero-flip-wrapper hero-flip-wrapper--small" style={{ position: 'absolute', bottom: '20px', left: '120px', zIndex: 1, transform: 'rotate(12deg)' }}>
      <div className="flip-card" style={{ '--delay': '1.5s' }}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
  <img src={cardProducts[1]?.images?.[0]} className="flip-front-img-actual" alt="" />
  <p className="flip-front-name">{cardProducts[0]?.name}</p>
  <span className="flip-front-stars">★★★★★</span>
</div>
          <div className="flip-card-back">
            <p className="discount-label">SAVE UP TO</p>
            <p className="discount-percent">15%</p>
            <p className="discount-sub">on bulk orders</p>
          </div>
        </div>
      </div>
    </div>

    {/* Top-right */}
    <div className="hero-flip-wrapper" style={{ position: 'absolute', top: '40px', right: '60px', zIndex: 1, transform: 'rotate(8deg)' }}>
      <div className="flip-card" style={{ '--delay': '3s' }}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
  <img src={cardProducts[2]?.images?.[0]} className="flip-front-img-actual" alt="" />
  <p className="flip-front-name">{cardProducts[0]?.name}</p>
  <span className="flip-front-stars">★★★★★</span>
</div>
          <div className="flip-card-back">
            <p className="discount-label">SAVE UP TO</p>
            <p className="discount-percent">15%</p>
            <p className="discount-sub">on bulk orders</p>
          </div>
        </div>
      </div>
    </div>

    {/* Bottom-right */}
    <div className="hero-flip-wrapper hero-flip-wrapper--small" style={{ position: 'absolute', bottom: '20px', right: '30px', zIndex: 1, transform: 'rotate(-12deg)' }}>
      <div className="flip-card" style={{ '--delay': '4.5s' }}>
        <div className="flip-card-inner">
          <div className="flip-card-front">
  <img src={cardProducts[3]?.images?.[0]} className="flip-front-img-actual" alt="" />
  <p className="flip-front-name">{cardProducts[0]?.name}</p>
  <span className="flip-front-stars">★★★★★</span>
</div>
          <div className="flip-card-back">
            <p className="discount-label">SAVE UP TO</p>
            <p className="discount-percent">15%</p>
            <p className="discount-sub">on bulk orders</p>
          </div>
        </div>
      </div>
    </div>

    {/* Center content */}
    <div className="hero-content">
      <h1 className="hero-headline">
        Stock Your <span className="hero-green">Home Smartly</span><br />
        Without Paying Premium Prices
      </h1>
      <p className="hero-subtext">
        Unlock premium everyday home essentials. Transparent pricing for everyone with exclusive membership pricing and wholesale options.
      </p>
      <Link to="/shop" className="hero-btn">
        Start Shopping →
      </Link>
    </div>

  </div>
</section>

      {/* ── MEMBER DISCOUNT BANNER ── */}
      <section ref={memberBannerRef} className="member-banner fade-in-up">
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
      <section ref={featuredRef} className="products-section fade-in-up">
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
<section ref={wholesaleRef} className="wholesale-banner-section fade-in-up">
  <div className="wholesale-banner">
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
        <div className="wholesale-overlap-stack">
          <div className="wholesale-overlap-img wholesale-overlap-img--back">
            <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816636/1777735906221_i9q18v.jpg" alt="Shea Butter" />
          </div>
          <div className="wholesale-overlap-img wholesale-overlap-img--mid">
            <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816648/enhanced_product_hv213t.png" alt="Deluxe Shea Butter" />
          </div>
          <div className="wholesale-overlap-img wholesale-overlap-img--front">
            <img src="https://res.cloudinary.com/db2a43rey/image/upload/v1777816491/1777673684456_avgyk5.png" alt="Face Scrub" />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

      {/* ── OREKELEWA DEALS ── */}
      <section ref={dealsRef} className="products-section fade-in-up">
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
      <section ref={becomeMemberRef} className="become-member-section fade-in-up">
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