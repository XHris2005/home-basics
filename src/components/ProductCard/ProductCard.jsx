import { Link } from 'react-router-dom'
import './ProductCard.css'

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function ProductCard({ product, isMember = false }) {
  const hasVariants = product.variants && product.variants.length > 0
  const displayPrice = hasVariants ? product.variants[0].retail_price : product.retail_price
  const displayWholesale = hasVariants ? product.variants[0].wholesale_price : product.wholesale_price
  const displayMember = hasVariants ? product.variants[0].member_price : product.member_price
  const showMemberPrice = product.is_member_product && displayMember

  return (
    <Link to={`/shop/${product.slug}`} className="product-card">
      <div className="product-card-image">
        {product.images && product.images.length > 0
          ? <img src={product.images[0]} alt={product.name} />
          : <div className="product-placeholder" />
        }
      </div>
      <div className="product-card-body">
        {product.categories && (
          <span className={`product-badge ${product.is_member_product ? 'badge-member' : 'badge-category'}`}>
            {product.is_member_product ? 'Member' : product.categories.name}
          </span>
        )}
        <p className="product-name">{product.name}</p>
        <p className="product-price">{formatPrice(displayPrice)}</p>
        {displayWholesale && displayWholesale < displayPrice && product.min_wholesale_qty && (
          <p className="product-wholesale">
            Wholesale Price: {formatPrice(displayWholesale)} • {product.min_wholesale_qty}+ items
          </p>
        )}
        {showMemberPrice && !isMember && (
          <p className="product-member-nudge">
            Member Price: {formatPrice(displayMember)} •{' '}
            <Link to="/login" onClick={e => e.stopPropagation()}>Login to access</Link>
          </p>
        )}
      </div>
    </Link>
  )
}

export default ProductCard