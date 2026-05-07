import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import './Cart.css'

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function Cart() {
  const { items, removeItem, removeSelected, updateQuantity, toggleCheck, getItemPrice, subtotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  function handleProceed() {
    if (!user) {
      navigate('/login')
      return
    }
    navigate('/checkout')
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-inner">
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to get started</p>
            <Link to="/shop" className="cart-empty-btn">Start Shopping</Link>
          </div>
        </div>
      </div>
    )
  }

  const hasChecked = items.some(item => item.checked)

  return (
    <div className="cart-page">
      <div className="cart-inner">

        {/* Breadcrumb */}
        <div className="cart-breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <span className="active">Cart</span>
        </div>

        <div className="cart-layout">

          {/* Left — Cart Items */}
          <div className="cart-left">
            <div className="cart-card">
              <div className="cart-card-header">
                <h2 className="cart-title">My Cart</h2>
                <div className="cart-header-actions">
                  {hasChecked && (
                    <button className="cart-remove-btn" onClick={removeSelected}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>
                      Remove Selected
                    </button>
                  )}
                  <button className="cart-save-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                      <polyline points="17 21 17 13 7 13 7 21"/>
                      <polyline points="7 3 7 8 15 8"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              {items.map(item => {
                const price = getItemPrice(item)
                const retailPrice = item.selectedVariant
                  ? item.selectedVariant.retail_price
                  : item.product.retail_price
                const wholesalePrice = item.selectedVariant
                  ? item.selectedVariant.wholesale_price
                  : item.product.wholesale_price
                const isWholesale = wholesalePrice &&
                  wholesalePrice < retailPrice &&
                  item.quantity >= item.product.min_wholesale_qty
                const wholesaleRemaining = item.product.min_wholesale_qty - item.quantity

                return (
                  <div
                    key={item.id}
                    className={`cart-item ${item.checked ? 'checked' : ''}`}
                  >
                    <input
                      type="checkbox"
                      className="cart-checkbox"
                      checked={item.checked}
                      onChange={() => toggleCheck(item.id)}
                    />
                    <div className="cart-item-image">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} />
                        : <div className="cart-img-placeholder" />
                      }
                    </div>
                    <div className="cart-item-info">
                      <p className="cart-item-name">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="cart-item-variant">{item.selectedVariant.size}</p>
                      )}
                      <div className="cart-item-pricing">
                        <span className={`cart-item-price ${isWholesale ? 'wholesale' : ''}`}>
                          {formatPrice(price)}
                        </span>
                        {isWholesale && (
                          <span className="cart-item-original">{formatPrice(retailPrice)}</span>
                        )}
                      </div>

                      {/* Wholesale nudge */}
                      {!isWholesale && wholesalePrice && wholesalePrice < retailPrice && (
                        <div className="cart-nudge">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Add {wholesaleRemaining} more of "{item.product.name}" to unlock wholesale pricing!
                        </div>
                      )}

                      {isWholesale && (
                        <div className="cart-wholesale-active">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#01A451" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                          Wholesale pricing activated!
                        </div>
                      )}
                    </div>

                    <div className="cart-item-right">
                      <div className="cart-quantity">
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >−</button>
                        <span>{item.quantity}</span>
                        <button
                          className="cart-qty-btn"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >+</button>
                      </div>
                      <button
                        className="cart-delete-btn"
                        onClick={() => removeItem(item.id)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right — Summary */}
          <div className="cart-right">

            {/* Cart Summary */}
            <div className="cart-summary-card">
              <h3 className="cart-summary-title">Cart Summary</h3>
              <div className="cart-summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary-row total">
                <span>Total Amount:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <button className="cart-checkout-btn" onClick={handleProceed}>
                Proceed to Checkout
              </button>
            </div>

            {/* Delivery & Return */}
            <div className="cart-delivery-card">
              <h3 className="cart-summary-title">Delivery & Return</h3>

              <div className="cart-delivery-item">
                <div className="cart-delivery-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <rect x="1" y="3" width="15" height="13" rx="1"/>
                    <path d="M16 8h4l3 5v3h-7V8z"/>
                    <circle cx="5.5" cy="18.5" r="2.5"/>
                    <circle cx="18.5" cy="18.5" r="2.5"/>
                  </svg>
                </div>
                <div>
                  <p className="cart-delivery-label">Door Delivery</p>
                  <p className="cart-delivery-desc">Shipping is calculated by selected state, city and area during checkout</p>
                  <p className="cart-delivery-highlight">Pay on Delivery Available</p>
                </div>
              </div>

              <div className="cart-delivery-divider" />

              <div className="cart-delivery-item">
                <div className="cart-delivery-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="cart-delivery-label">Pickup Option</p>
                  <p className="cart-delivery-desc">Flat Pickup fee: ₦500</p>
                  <p className="cart-delivery-desc">Pickup location: <strong>Shop 20 Peekmee Plaza, 95 Atekong drive opp. Kings Winery, Calabar, Cross River.</strong></p>
                </div>
              </div>

              <div className="cart-delivery-divider" />

              <div className="cart-delivery-item">
                <div className="cart-delivery-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <polyline points="1 4 1 10 7 10"/>
                    <path d="M3.51 15a9 9 0 1 0 .49-3.96"/>
                  </svg>
                </div>
                <div>
                  <p className="cart-delivery-label">Free 3-day Returns</p>
                  <p className="cart-delivery-desc">Return window opens after successful delivery</p>
                  <p className="cart-delivery-desc">Returns accepted within 3 days of delivery for unused items in original condition and packaging.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart