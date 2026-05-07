import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import './Checkout.css'

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi',
  'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo',
  'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
]

function formatPrice(price) {
  return `₦${Number(price).toLocaleString()}`
}

function Checkout() {
  const { items, getItemPrice, subtotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [deliveryMethod, setDeliveryMethod] = useState('delivery')
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [loading, setLoading] = useState(false)

  const [addressForm, setAddressForm] = useState({
    firstName: '', lastName: '', state: '', city: '',
    area: '', address: '', phone: ''
  })

  const PICKUP_FEE = 500
  const deliveryFee = deliveryMethod === 'pickup'
    ? PICKUP_FEE
    : selectedAddress ? 1000 : 0

  const total = subtotal + deliveryFee

  function handleAddressChange(e) {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value })
  }

  function handleAddAddress(e) {
    e.preventDefault()
    setSelectedAddress(addressForm)
    setShowAddressModal(false)
  }

  async function handlePlaceOrder() {
    if (deliveryMethod === 'delivery' && !selectedAddress) return
    setLoading(true)

    // Paystack integration will go here
    // For now just navigate to success
    setTimeout(() => {
      clearCart()
      navigate('/order-confirmation')
      setLoading(false)
    }, 1000)
  }

  const canPlaceOrder = deliveryMethod === 'pickup' || selectedAddress

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
                      <p className="checkout-no-address">You have not selected a shipping address</p>
                      <button
                        className="checkout-add-address-btn"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Add New Address
                      </button>
                    </>
                  ) : (
                    <div className="checkout-selected-address">
                      <p className="checkout-address-name">
                        {selectedAddress.firstName} {selectedAddress.lastName}
                      </p>
                      <p className="checkout-address-details">
                        {selectedAddress.address}, {selectedAddress.area}, {selectedAddress.city}, {selectedAddress.state}
                      </p>
                      <p className="checkout-address-phone">{selectedAddress.phone}</p>
                      <button
                        className="checkout-change-btn"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Change Address
                      </button>
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
                  : <span className="checkout-warning">Please select a delivery address</span>
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
            </div>
          </div>

        </div>
      </div>

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="modal-overlay" onClick={() => setShowAddressModal(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add New Address</h2>
              <button className="modal-close" onClick={() => setShowAddressModal(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="modal-form">
              <div className="modal-row">
                <input
                  name="firstName"
                  value={addressForm.firstName}
                  onChange={handleAddressChange}
                  placeholder="First name"
                  required
                />
                <input
                  name="lastName"
                  value={addressForm.lastName}
                  onChange={handleAddressChange}
                  placeholder="Last name"
                  required
                />
              </div>

              <select name="state" value={addressForm.state} onChange={handleAddressChange} required>
                <option value="">Select State</option>
                {NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <input
                name="city"
                value={addressForm.city}
                onChange={handleAddressChange}
                placeholder="Select City"
                required
              />

              <input
                name="area"
                value={addressForm.area}
                onChange={handleAddressChange}
                placeholder="Select Area"
                required
              />

              <input
                name="address"
                value={addressForm.address}
                onChange={handleAddressChange}
                placeholder="Enter Address"
                required
              />

              <input
                name="phone"
                value={addressForm.phone}
                onChange={handleAddressChange}
                placeholder="Phone e.g 090123456789"
                required
              />

              <button type="submit" className="modal-submit-btn">Add Address</button>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default Checkout