import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { getUserAddresses } from '../../services/addresses';
import { createOrder } from '../../services/orders';
import AddressBookModal from '../../components/AddressBookModal/AddressBookModal';
import './OrderConfirmation.css';

const SHIPPING_FEE = 6000;

function formatPrice(n) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { checkedItems, clearCheckedItems } = useCart();

  const [method,          setMethod]          = useState('delivery');
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [loadingAddr,     setLoadingAddr]     = useState(true);
  const [placing,         setPlacing]         = useState(false);

  // Redirect to cart if no items
  useEffect(() => {
    if (!checkedItems || checkedItems.length === 0) navigate('/cart');
  }, []);

  // Auto-load default address
  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoadingAddr(true);
      try {
        const list = await getUserAddresses();
        const def  = list.find(a => a.is_default) || list[0];
        if (def) setSelectedAddress(def);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAddr(false);
      }
    })();
  }, [user]);

  const items    = checkedItems || [];
  const subtotal = items.reduce((s, i) => s + i.effectivePrice * i.quantity, 0);
  const shipping = method === 'delivery' ? SHIPPING_FEE : 0;
  const total    = subtotal + shipping;

  function handlePlaceOrder() {
    if (method === 'delivery' && !selectedAddress) {
      setShowAddressBook(true);
      return;
    }
    if (typeof window.PaystackPop === 'undefined') {
      alert('Payment system not loaded. Please refresh and try again.');
      return;
    }
    setPlacing(true);
    const handler = window.PaystackPop.setup({
      key:      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email:    user.email,
      amount:   total * 100,
      currency: 'NGN',
      ref:      `HB-${Date.now()}`,
      onClose:  () => setPlacing(false),
      callback: async (res) => {
        try {
          await createOrder({
            user_id:          user.id,
            items,
            subtotal,
            shipping_fee:     shipping,
            total_amount:     total,
            payment_ref:      res.reference,
            payment_status:   'paid',
            delivery_method:  method,
            delivery_address: method === 'delivery' ? selectedAddress : null,
            status:           'pending',
          });
          clearCheckedItems();
        } catch (err) {
          console.error('Order save failed:', err);
        }
        navigate('/order-success', { state: { ref: res.reference, total } });
      },
    });
    handler.openIframe();
  }

  return (
    <div className="oc-page">

      {/* Breadcrumb */}
      <nav className="oc-breadcrumb">
        <Link to="/">Home</Link>
        <span>›</span>
        <Link to="/cart">Cart</Link>
        <span>›</span>
        <span className="oc-bc-active">Order Confirmation</span>
      </nav>

      <h1 className="oc-heading">Order Confirmation</h1>

      <div className="oc-layout">

        {/* ── Left column ── */}
        <div className="oc-left">

          {/* Delivery Method card */}
          <div className="oc-card">
            <div className="oc-card-head">
              <div className="oc-card-title">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2C6.24 2 4 4.24 4 7c0 4.375 5 9 5 9s5-4.625 5-9c0-2.76-2.24-5-5-5z" fill="#01A451"/>
                  <circle cx="9" cy="7" r="1.75" fill="#fff"/>
                </svg>
                Delivery Method
              </div>
              {method === 'delivery' && (
                <button className="oc-change-addr-btn" onClick={() => setShowAddressBook(true)}>
                  Change Address
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="oc-tabs">
              <button
                className={`oc-tab${method === 'delivery' ? ' oc-tab--active' : ''}`}
                onClick={() => setMethod('delivery')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="1" y="5" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M11 7h2l2 2v3h-4V7z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                  <circle cx="4.5" cy="13" r="1.2" fill="currentColor"/>
                  <circle cx="12.5" cy="13" r="1.2" fill="currentColor"/>
                </svg>
                Delivery
              </button>
              <button
                className={`oc-tab${method === 'pickup' ? ' oc-tab--active' : ''}`}
                onClick={() => setMethod('pickup')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5S12.5 9.5 12.5 6C12.5 3.515 10.485 1.5 8 1.5z" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="8" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                Pickup
              </button>
            </div>

            {/* Address / Pickup info */}
            <div className="oc-delivery-body">
              {method === 'delivery' ? (
                loadingAddr ? (
                  <p className="oc-loading-text">Loading address...</p>
                ) : selectedAddress ? (
                  <>
                    <p><strong>Name:</strong> {selectedAddress.first_name} {selectedAddress.last_name}</p>
                    <p><strong>Phone:</strong> {selectedAddress.phone}</p>
                    <p><strong>Address:</strong> {selectedAddress.address}</p>
                    <p><strong>Location:</strong> {[selectedAddress.area, selectedAddress.city, selectedAddress.state].filter(Boolean).join(', ')}</p>
                  </>
                ) : (
                  <div className="oc-no-addr">
                    <p>No delivery address selected</p>
                    <button className="oc-add-addr-link" onClick={() => setShowAddressBook(true)}>
                      + Add a delivery address
                    </button>
                  </div>
                )
              ) : (
                <div className="oc-pickup-info">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2C6.686 2 4 4.686 4 8c0 4.5 6 10 6 10s6-5.5 6-10c0-3.314-2.686-6-6-6z" fill="#e6f7ef" stroke="#01A451" strokeWidth="1.3"/>
                    <circle cx="10" cy="8" r="2" fill="#01A451"/>
                  </svg>
                  <div>
                    <p className="oc-pickup-name">Home Basics Store</p>
                    <p className="oc-pickup-addr">Marian Road, Calabar Municipal, Cross River</p>
                    <p className="oc-pickup-hours">Open: Mon–Sat, 8am–6pm</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Items card */}
          <div className="oc-card">
            <div className="oc-card-head">
              <div className="oc-card-title">
                <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
                  <rect x="2" y="4" width="13" height="10" rx="1.5" stroke="#01A451" strokeWidth="1.35"/>
                  <path d="M5.5 4V3a3 3 0 016 0v1" stroke="#01A451" strokeWidth="1.35"/>
                </svg>
                Selected Items
              </div>
            </div>
            <div className="oc-items">
              {items.map((item, idx) => (
                <div key={idx} className="oc-item">
                  <div className="oc-item-img">
                    {item.image
                      ? <img src={item.image} alt={item.name}/>
                      : <div className="oc-item-img-ph"/>
                    }
                  </div>
                  <div className="oc-item-info">
                    <p className="oc-item-name">{item.name}</p>
                    {item.variant && <p className="oc-item-variant">{item.variant}</p>}
                    <p className="oc-item-price">{formatPrice(item.effectivePrice)}</p>
                  </div>
                  <span className="oc-item-qty">Qty: {item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="oc-right">
          <div className="oc-summary">
            <h3>Order Summary</h3>
            <div className="oc-summary-rows">
              <div className="oc-summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="oc-summary-row">
                <span>Shipping:</span>
                <span className={shipping === 0 ? 'oc-free' : ''}>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
            </div>
            <div className="oc-summary-total">
              <span>Total Amount:</span>
              <span>{formatPrice(total)}</span>
            </div>
            <button
              className="oc-place-btn"
              onClick={handlePlaceOrder}
              disabled={placing || (method === 'delivery' && !selectedAddress && !loadingAddr)}
            >
              {placing
                ? <span className="oc-btn-loading"><span className="oc-btn-spinner"/>Processing...</span>
                : 'Place Order'
              }
            </button>
            {method === 'delivery' && !selectedAddress && !loadingAddr && (
              <p className="oc-addr-warn">Please add a delivery address to continue</p>
            )}
          </div>
        </div>

      </div>

      {showAddressBook && (
        <AddressBookModal
          onClose={() => setShowAddressBook(false)}
          onConfirm={addr => setSelectedAddress(addr)}
        />
      )}

    </div>
  );
}