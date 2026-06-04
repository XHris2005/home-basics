import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { cloudinaryOptimize } from '../../utils/formatters'
import './ProductCard.css'

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function ProductCard({ product, isMember = false }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const hasVariants = product.variants && product.variants.length > 0
  const productVariants = product.product_variants || product.variants || []
const displayPrice = hasVariants ? productVariants[0].retail_price : product.retail_price
const displayWholesale = hasVariants ? productVariants[0].wholesale_price : product.wholesale_price
const displayMember = hasVariants ? productVariants[0].member_price : product.member_price
  const showMemberPrice = product.is_member_product && displayMember

  function handleLoginClick(e) {
    e.preventDefault()
    e.stopPropagation()
    navigate('/login')
  }

  return (
    <Link to={`/shop/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {(() => {
  const cardImage = hasVariants && productVariants[0]?.images?.length
    ? productVariants[0].images[0]
    : product.images?.[0]
  return cardImage
    ? <img src={cloudinaryOptimize(cardImage, 400)} alt={product.name} />
    : <div className="product-placeholder" />
})()}
      </div>
      <div className="product-card-body">
        {(product.is_member_product || product.categories) && (
  <span className={`product-badge ${
    product.is_member_product ? 'badge-member' :
    product.name?.toLowerCase().startsWith('orekelewa') ? 'badge-orekelewa' :
    'badge-category'
  }`}>
    {product.is_member_product ? 'Member' :
     product.name?.toLowerCase().startsWith('orekelewa') ? 'Orekelewa' :
     product.categories?.name}
  </span>
)}
        <p className="product-name">{product.name}</p>
        <p className="product-price">{formatPrice(displayPrice)}</p>
        {displayWholesale && displayWholesale < displayPrice && product.min_wholesale_qty && (
          <p className="product-wholesale">
            Wholesale Price: {formatPrice(displayWholesale)} • {product.min_wholesale_qty}+ items
          </p>
        )}
        {showMemberPrice && (
  <p className="product-member-nudge">
    Member Price: {formatPrice(displayMember)} •{' '}
    {!user ? (
      <button className="product-login-btn" onClick={handleLoginClick}>
        Login to access
      </button>
    ) : !isMember ? (
  <button
    className="product-login-btn"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      navigate('/become-member')
    }}
  >
    Become a member
  </button>
    ) : null}
  </p>
)}
      </div>
    </Link>
  )
}

export default ProductCard