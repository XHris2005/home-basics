import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import AddressBookModal from '../../components/AddressBookModal/AddressBookModal'
import { createOrder } from '../../services/orders'
import './Checkout.css'

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function Checkout() {
  const { items, getItemPrice, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [showAddressBook, setShowAddressBook] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)

  const PICKUP_FEE = 500
  const deliveryFee = deliveryMethod === 'pickup'
    ? PICKUP_FEE
    : selectedAddress ? 1000 : 0

  const total = subtotal + deliveryFee
  const canPlaceOrder = deliveryMethod === 'pickup' || selectedAddress

  async function handlePlaceOrder() {
  if (deliveryMethod === 'delivery' && !selectedAddress) {
    setShowAddressBook(true)
    return
  }

  if (typeof window.PaystackPop === 'undefined') {
    alert('Payment system not loaded. Please refresh and try again.')
    return
  }

  setLoading(true)

  const orderItems = items.map(item => ({
    product_id: item.product.id,
    name: item.product.name,
    image: item.product.images?.[0] || null,
    variant: item.selectedVariant?.size || null,
    quantity: item.quantity,
    price: getItemPrice(item),
  }))

  function onPaymentSuccess(response) {
    createOrder({
      user_id: user.id,
      items: orderItems,
      subtotal,
      shipping_fee: deliveryFee,
      total_amount: total,
      payment_ref: response.reference,
      payment_status: 'paid',
      delivery_method: deliveryMethod,
      delivery_address: deliveryMethod === 'delivery' ? selectedAddress : null,
      status: 'pending',
    })
      .then(() => {
        clearCart()
        navigate('/order-success', { state: { ref: response.reference, total } })
      })
      .catch((err) => {
        console.error('Order save failed:', err)
        clearCart()
        navigate('/order-success', { state: { ref: response.reference, total } })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function onPaymentClose() {
    setLoading(false)
  }

  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    email: user.email,
    amount: total * 100,
    currency: 'NGN',
    ref: `HB-${Date.now()}`,
    callback: onPaymentSuccess,
    onClose: onPaymentClose,
  })

  handler.openIframe()
}

  return (
    <div className="checkout-page">
      <div className="checkout-inner">

        {/* Breadcrumb */}
        <div className="checkout-breadcrumb">
          <Link to="/">Home</Link>
          <span>›</span>
          <Link to="/cart">Cart</Link>
          <span>›</span>
          <span className="active">Order Confirmation</span>
        </div>

        <h1 className="checkout-heading">Order Confirmation</h1>

        <div className="checkout-layout">

          {/* Left */}
          <div className="checkout-left">

            {/* Delivery Method */}
            <div className="checkout-card">
              <div className="checkout-card-title-row">
                <div className="checkout-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h2 className="checkout-card-title">Delivery Method</h2>
                {deliveryMethod === 'delivery' && selectedAddress && (
                  <button
                    className="checkout-change-btn"
                    onClick={() => setShowAddressBook(true)}
                  >
                    Change Address
                  </button>
                )}
              </div>

              <div className="checkout-tabs">
                <button
                  className={`checkout-tab ${deliveryMethod === 'delivery' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('delivery')}
                >
                  🚚 Delivery
                </button>
                <button
                  className={`checkout-tab ${deliveryMethod === 'pickup' ? 'active' : ''}`}
                  onClick={() => setDeliveryMethod('pickup')}
                >
                  📦 Pickup
                </button>
              </div>

              {deliveryMethod === 'delivery' && (
                <div className="checkout-delivery-body">
                  {!selectedAddress ? (
                    <>
                      <p className="checkout-no-address">No delivery address selected</p>
                      <button
                        className="checkout-add-address-btn"
                        onClick={() => setShowAddressBook(true)}
                      >
                        + Add Delivery Address
                      </button>
                    </>
                  ) : (
                    <div className="checkout-selected-address">
                      <p className="checkout-address-name">
                        {selectedAddress.first_name} {selectedAddress.last_name}
                      </p>
                      <p className="checkout-address-details">
                        {[selectedAddress.address, selectedAddress.area, selectedAddress.city, selectedAddress.state]
                          .filter(Boolean).join(', ')}
                      </p>
                      <p className="checkout-address-phone">{selectedAddress.phone}</p>
                    </div>
                  )}
                </div>
              )}

              {deliveryMethod === 'pickup' && (
                <div className="checkout-pickup-body">
                  <p><strong>Pickup Point:</strong> Kaiglo Warehouse</p>
                  <p><strong>Address:</strong> Shop 20 Peekmee Plaza, 95 Atekong drive opp. Kings Winery, Calabar, Cross River.</p>
                  <p><strong>Pickup fee:</strong> {formatPrice(PICKUP_FEE)}</p>
                </div>
              )}
            </div>

            {/* Selected Items */}
            <div className="checkout-card">
              <div className="checkout-card-title-row">
                <div className="checkout-card-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                  </svg>
                </div>
                <h2 className="checkout-card-title">Selected Items</h2>
              </div>

              {items.map(item => {
                const price = getItemPrice(item)
                return (
                  <div key={item.id} className="checkout-item">
                    <div className="checkout-item-image">
                      {item.product.images?.[0]
                        ? <img src={item.product.images[0]} alt={item.product.name} />
                        : <div className="checkout-img-placeholder" />
                      }
                    </div>
                    <div className="checkout-item-info">
                      <p className="checkout-item-name">{item.product.name}</p>
                      {item.selectedVariant && (
                        <p className="checkout-item-variant">{item.selectedVariant.size}</p>
                      )}
                      <p className="checkout-item-price">{formatPrice(price)}</p>
                    </div>
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                )
              })}
            </div>

          </div>

          {/* Right — Order Summary */}
          <div className="checkout-right">
            <div className="checkout-summary-card">
              <h3 className="checkout-summary-title">Order Summary</h3>

              <div className="checkout-summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div className="checkout-summary-row">
                <span>{deliveryMethod === 'pickup' ? 'Pickup Fee:' : 'Shipping:'}</span>
                {canPlaceOrder
                  ? <span>{formatPrice(deliveryFee)}</span>
                  : <span className="checkout-warning">Select a delivery address</span>
                }
              </div>

              <div className="checkout-summary-row total">
                <span>Total Amount:</span>
                <span>{formatPrice(total)}</span>
              </div>

              <button
                className={`checkout-place-btn ${!canPlaceOrder ? 'disabled' : ''}`}
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder || loading}
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>

              {!canPlaceOrder && (
                <p className="checkout-addr-warn">
                  Please add a delivery address to continue
                </p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Address Book Modal */}
      {showAddressBook && (
        <AddressBookModal
          onClose={() => setShowAddressBook(false)}
          onConfirm={(addr) => setSelectedAddress(addr)}
        />
      )}

    </div>
  )
}

export default Checkout