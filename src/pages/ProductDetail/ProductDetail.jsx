import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getProductBySlug } from '../../services/products'
import { useCart } from '../../context/CartContext'
import { cloudinaryOptimize } from '../../utils/formatters'
import './ProductDetail.css'

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function ProductDetail() {
  const { slug } = useParams()
  const { user, isMember } = useAuth()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [deliveryTab, setDeliveryTab] = useState('delivery')

  // Variant selectors
  const [selectedFragrance, setSelectedFragrance] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)

  useEffect(() => {
    async function load() {
      const data = await getProductBySlug(slug)
      setProduct(data)
      setLoading(false)
    }
    load()
  }, [slug])

  // Derive variant data
  const variants = product?.product_variants || []
  const hasVariants = variants.length > 0

  // Unique fragrances (null fragrance means no fragrance selector needed)
  const fragrances = hasVariants
    ? [...new Set(variants.map(v => v.fragrance).filter(Boolean))].sort()
    : []
  const hasFragrances = fragrances.length > 0

  // Sizes available for selected fragrance (or all sizes if no fragrance)
  const availableSizes = hasVariants
    ? [...new Set(
        variants
          .filter(v => !hasFragrances || v.fragrance === selectedFragrance)
          .map(v => v.size)
      )]
    : []

  // When fragrance changes, reset size and variant
  useEffect(() => {
  setSelectedSize(null)
  setSelectedVariant(null)
  setSelectedImage(0)
  // Preview first variant image for this fragrance immediately
  if (selectedFragrance) {
    const preview = variants.find(v => v.fragrance === selectedFragrance)
    if (preview?.images?.length > 0) setSelectedImage(0)
  }
}, [selectedFragrance])

  // When size changes, find the matching variant
  useEffect(() => {
    if (!selectedSize) { setSelectedVariant(null); return }
    const match = variants.find(v =>
      v.size === selectedSize &&
      (!hasFragrances || v.fragrance === selectedFragrance)
    )
    setSelectedVariant(match || null)
    // Update image if variant has its own images
    if (match?.images?.length > 0) setSelectedImage(0)
  }, [selectedSize, selectedFragrance])

  if (loading) return <div className="pd-loading">Loading...</div>
  if (!product) return <div className="pd-loading">Product not found.</div>

  // Active images — variant images take priority
  const fragrancePreviewImages = selectedFragrance && !selectedVariant
  ? variants.find(v => v.fragrance === selectedFragrance)?.images
  : null

const activeImages = selectedVariant?.images?.length
  ? selectedVariant.images
  : fragrancePreviewImages?.length
  ? fragrancePreviewImages
  : product.images || []

  // Pricing — from variant if selected, else product-level
  const retailPrice = selectedVariant?.retail_price ?? product.retail_price
  const wholesalePrice = selectedVariant?.wholesale_price ?? product.wholesale_price
  const memberPrice = selectedVariant?.member_price ?? product.member_price

  const isWholesaleActive = quantity >= product.min_wholesale_qty &&
    wholesalePrice && wholesalePrice < retailPrice
  const wholesaleRemaining = product.min_wholesale_qty - quantity

  const activePrice = isMember && product.is_member_product && memberPrice
    ? memberPrice
    : isWholesaleActive ? wholesalePrice : retailPrice

  // Description
  const descLines = (product.description || '').split('\n').filter(l => l.trim())
  const shortDesc = descLines.slice(0, 3).join('\n')
  const hasLongDesc = descLines.length > 3

  // Add to cart guard
  const canAddToCart = !hasVariants ||
    (!hasFragrances && selectedSize) ||
    (hasFragrances && selectedFragrance && selectedSize)

  return (
    <div className="pd-page">
      <div className="pd-inner">

        {/* Breadcrumb */}
        <div className="pd-breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to={`/shop?category=${product.categories?.name}`}>
            {product.categories?.name}
          </Link>
          <span>›</span>
          <span>{product.name}</span>
        </div>

        <div className="pd-layout">

          {/* Top Row */}
          <div className="pd-top-row">

            {/* Image */}
            <div className="pd-image-section">
              <div className="pd-main-image">
                {activeImages.length > 0
                  ? <img src={cloudinaryOptimize(activeImages[selectedImage], 800)} alt={product.name} />
                  : <div className="pd-image-placeholder" />
                }
              </div>
              {activeImages.length > 1 && (
                <div className="pd-thumbnails">
                  {activeImages.map((img, i) => (
                    <button
                      key={i}
                      className={`pd-thumb ${selectedImage === i ? 'active' : ''}`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <img src={cloudinaryOptimize(img, 150)} alt={`${product.name} ${i + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Card */}
            <div className="pd-info-card">
              <h1 className="pd-name">{product.name}</h1>

              <div className="pd-meta">
                <div className="pd-stars">
                  {'★★★★★'.split('').map((s, i) => (
                    <span key={i} className="pd-star filled">{s}</span>
                  ))}
                  <span className="pd-rating-text">0 verified ratings</span>
                </div>
                <span className="pd-dot">•</span>
                <span className="pd-opf">OPF: {product.id?.slice(0, 12).toUpperCase()}</span>
              </div>

              <p className="pd-short-desc">{descLines.slice(0, 1).join(' ')}</p>

              {/* ── VARIANT SELECTORS ── */}
              {hasVariants && (
                <div className="pd-variants">

                  {/* Fragrance selector */}
                  {hasFragrances && (
                    <div className="pd-variant-group">
                      <p className="pd-variant-label">
                        Fragrance:
                        {selectedFragrance && (
                          <span className="pd-variant-selected"> {selectedFragrance}</span>
                        )}
                      </p>
                      <div className="pd-variant-pills">
                        {fragrances.map(f => (
                          <button
                            key={f}
                            className={`pd-variant-pill ${selectedFragrance === f ? 'active' : ''}`}
                            onClick={() => setSelectedFragrance(f)}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size selector — show always if no fragrance, else only after fragrance picked */}
                  {(!hasFragrances || selectedFragrance) && (
                    <div className="pd-variant-group">
                      <p className="pd-variant-label">
                        Size:
                        {selectedSize && (
                          <span className="pd-variant-selected"> {selectedSize}</span>
                        )}
                      </p>
                      <div className="pd-variant-pills">
                        {availableSizes.map(s => (
                          <button
                            key={s}
                            className={`pd-variant-pill ${selectedSize === s ? 'active' : ''}`}
                            onClick={() => setSelectedSize(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Prompt if nothing selected yet */}
                  {hasFragrances && !selectedFragrance && (
                    <p className="pd-variant-prompt">Select a fragrance to see sizes and pricing</p>
                  )}
                </div>
              )}

              {/* Pricing Table — show product-level for no-variant products,
                  or once variant is fully selected */}
              {(!hasVariants || selectedVariant) && (
                <div className="pd-pricing">
                  <div className={`pd-price-row ${!isWholesaleActive && !isMember ? 'active-price' : ''}`}>
                    <span className="pd-price-label">Retail Price</span>
                    <span className="pd-price-value">{formatPrice(retailPrice)}</span>
                  </div>
                  {wholesalePrice && wholesalePrice < retailPrice && (
                    <div className={`pd-price-row wholesale ${isWholesaleActive ? 'active-price' : ''}`}>
                      <div>
                        <span className="pd-price-label pd-price-label-green">Wholesale Price</span>
                        <p className="pd-price-sublabel">Buy {product.min_wholesale_qty}+ units</p>
                      </div>
                      <span className="pd-price-value">{formatPrice(wholesalePrice)}</span>
                    </div>
                  )}
                  {product.is_member_product && memberPrice && (
                    <div className={`pd-price-row member ${isMember ? 'active-price' : ''}`}>
                      <div>
                        <span className="pd-price-label pd-price-label-member">Member Price</span>
                        {!isMember && <p className="pd-price-sublabel">Login as a member to access</p>}
                      </div>
                      <span className="pd-price-value pd-price-member">{formatPrice(memberPrice)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Placeholder pricing before variant selected */}
              {hasVariants && !selectedVariant && (hasFragrances ? selectedFragrance : true) && (
                <div className="pd-pricing">
                  <div className="pd-price-row">
                    <span className="pd-price-label" style={{ color: 'var(--color-text-muted)' }}>
                      Select a size to see pricing
                    </span>
                  </div>
                </div>
              )}

              {/* Wholesale nudge */}
              {(!hasVariants || selectedVariant) && wholesalePrice &&
                wholesalePrice < retailPrice && !isWholesaleActive && (
                <div className="pd-wholesale-nudge">
                  <span className="pd-nudge-icon">ℹ️</span>
                  <div>
                    <p className="pd-nudge-title">
                      Add {wholesaleRemaining} more for wholesale pricing!
                    </p>
                    <p className="pd-nudge-sub">
                      Reach {product.min_wholesale_qty} units to unlock bulk discounts.
                    </p>
                  </div>
                </div>
              )}

              {/* Quantity + Add to Cart */}
              <div className="pd-actions">
                <div className="pd-quantity">
                  <button className="pd-qty-btn" onClick={() => setQuantity(q => Math.max(1, q - 1))}>−</button>
                  <span className="pd-qty-value">{quantity}</span>
                  <button className="pd-qty-btn" onClick={() => setQuantity(q => q + 1)}>+</button>
                </div>
                <button
                  className="pd-add-cart-btn"
                  disabled={!canAddToCart}
                  style={{ opacity: canAddToCart ? 1 : 0.5, cursor: canAddToCart ? 'pointer' : 'not-allowed' }}
                  onClick={() => canAddToCart && addItem(product, quantity, selectedVariant)}
                >
                  🛒 {canAddToCart ? 'Add to Cart' : hasFragrances && !selectedFragrance ? 'Select Fragrance' : 'Select Size'}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="pd-bottom-row">

            {/* Left — Description + Rating */}
            <div className="pd-left-bottom">
              <div className="pd-description-card">
                <h3 className="pd-desc-title">Product Description</h3>
                <div className={`pd-desc-content ${showFullDesc ? 'expanded' : 'collapsed'}`}>
                  {(showFullDesc ? product.description : shortDesc)
                    ?.split('\n')
                    .map((line, i) => (
                      line.trim()
                        ? <p key={i} className={line.endsWith(':') ? 'pd-desc-heading' : 'pd-desc-text'}>{line}</p>
                        : <br key={i} />
                    ))
                  }
                </div>
                {hasLongDesc && (
                  <button className="pd-desc-toggle" onClick={() => setShowFullDesc(!showFullDesc)}>
                    {showFullDesc ? 'Hide Full Description ▲' : 'Read Full Description ▼'}
                  </button>
                )}
              </div>

              <div className="pd-rating-card">
                <h3 className="pd-desc-title">Product Rating</h3>
                <div className="pd-rating-empty">
                  <p>No reviews yet. Be the first to review this product.</p>
                </div>
              </div>
            </div>

            {/* Right — Delivery */}
            <div className="pd-delivery-card">
              <div className="pd-delivery-header">
                <div className="pd-delivery-title-row">
                  <div className="pd-delivery-icon-circle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <path d="M16 8h4l3 5v3h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                  </div>
                  <div>
                    <p className="pd-delivery-title">Delivery & Returns</p>
                    <p className="pd-delivery-sub">Choose your location for door delivery</p>
                  </div>
                </div>
                <span className="pd-delivery-fee">₦1,000 <br/><small>Shipping Fee Applied</small></span>
              </div>

              <div className="pd-delivery-tabs">
                <button
                  className={`pd-delivery-tab ${deliveryTab === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryTab('delivery')}
                >🚚 Delivery</button>
                <button
                  className={`pd-delivery-tab ${deliveryTab === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryTab('pickup')}
                >📦 Pickup</button>
              </div>

              {deliveryTab === 'delivery' && (
                <div className="pd-delivery-selects">
                  <select className="pd-select"><option>Cross River</option><option>Lagos</option><option>Abuja</option></select>
                  <select className="pd-select"><option>Calabar Municipal</option></select>
                  <select className="pd-select"><option>Etta Agbor</option></select>
                </div>
              )}

              <div className="pd-delivery-info">
                <div className="pd-delivery-info-item">
                  <span className="pd-info-label">Delivery Time</span>
                  <span className="pd-info-value green">
                    <span className="pd-info-dot">●</span> 1–3 Business Days
                  </span>
                </div>
                <div className="pd-delivery-info-item">
                  <span className="pd-info-label">Doorstep Delivery</span>
                  <span className="pd-info-value green">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="2">
                      <rect x="1" y="3" width="15" height="13" rx="1"/>
                      <path d="M16 8h4l3 5v3h-7V8z"/>
                      <circle cx="5.5" cy="18.5" r="2.5"/>
                      <circle cx="18.5" cy="18.5" r="2.5"/>
                    </svg>
                    Pay on Delivery Available
                  </span>
                </div>
              </div>

              <div className="pd-returns">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="2">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 .49-3.96"/>
                </svg>
                <span className="pd-returns-text">Free 3-day returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail