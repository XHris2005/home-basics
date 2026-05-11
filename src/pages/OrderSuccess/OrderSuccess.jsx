import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './OrderSuccess.css';

function formatPrice(n) {
  return `₦${Number(n).toLocaleString()}`;
}

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { ref, total } = location.state || {};

  // If someone navigates here directly with no state, send them home
  useEffect(() => {
    if (!ref) navigate('/');
  }, []);

  if (!ref) return null;

  return (
    <div className="os-page">
      <div className="os-card">

        {/* Success Icon */}
        <div className="os-icon-wrap">
          <div className="os-icon-circle">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path
                d="M8 20l8 8 16-16"
                stroke="#fff"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* Text */}
        <h1 className="os-heading">Order Placed Successfully!</h1>
        <p className="os-subtext">
          Thank you for your order. We've received your payment and will
          begin processing your order shortly.
        </p>

        {/* Order Details */}
        <div className="os-details">
          <div className="os-detail-row">
            <span className="os-detail-label">Order Reference</span>
            <span className="os-detail-value os-ref">{ref}</span>
          </div>
          <div className="os-detail-row">
            <span className="os-detail-label">Amount Paid</span>
            <span className="os-detail-value os-amount">{formatPrice(total)}</span>
          </div>
          <div className="os-detail-row">
            <span className="os-detail-label">Payment Status</span>
            <span className="os-detail-value os-paid">
              <span className="os-paid-dot" />
              Paid
            </span>
          </div>
          <div className="os-detail-row">
            <span className="os-detail-label">Estimated Delivery</span>
            <span className="os-detail-value">2 – 5 business days</span>
          </div>
        </div>

        {/* Info banner */}
        <div className="os-info-banner">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="8" stroke="#01A451" strokeWidth="1.4"/>
            <path d="M9 8v5M9 6h.01" stroke="#01A451" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p>A confirmation will be sent to your email. You can also track your order from your account page.</p>
        </div>

        {/* CTAs */}
        <div className="os-actions">
          <Link to="/shop" className="os-btn-shop">
            Continue Shopping
          </Link>
          <Link to="/account/orders" className="os-btn-orders">
            View My Orders
          </Link>
        </div>

      </div>
    </div>
  );
}