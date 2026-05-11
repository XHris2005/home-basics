import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getUserOrders } from '../../services/orders'
import { formatCurrency, formatDate } from '../../utils/formatters'
import './AccountOrders.css'

function AccountOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getUserOrders(user.id)
        setOrders(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchOrders()
  }, [user])

  function toggleExpand(orderId) {
    setExpanded(prev => prev === orderId ? null : orderId)
  }

  if (loading) {
    return (
      <div className="account-orders">
        <div className="account-orders__header">
          <h1 className="account-orders__title">Orders</h1>
          <p className="account-orders__sub">Loading your orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="account-orders">
      <div className="account-orders__header">
        <h1 className="account-orders__title">Orders</h1>
        <p className="account-orders__sub">
          {orders.length > 0
            ? `You have ${orders.length} order${orders.length > 1 ? 's' : ''}`
            : 'No orders yet'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="account-orders__empty">
          <div className="account-orders__empty-icon">📦</div>
          <p>You haven't placed any orders yet.</p>
          <a href="/shop" className="account-orders__shop-link">
            Start Shopping
          </a>
        </div>
      ) : (
        <div className="account-orders__list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              {/* Order Header */}
              <div
                className="order-card__header"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="order-card__left">
                  <p className="order-card__ref">#{order.payment_ref}</p>
                  <p className="order-card__date">{formatDate(order.created_at)}</p>
                </div>
                <div className="order-card__right">
                  <p className="order-card__total">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <span className={`order-card__status order-card__status--${order.status}`}>
                    {order.status}
                  </span>
                  <span className="order-card__chevron">
                    {expanded === order.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {/* Order Details */}
              {expanded === order.id && (
                <div className="order-card__body">
                  {/* Items */}
                  <div className="order-card__items">
                    {order.items?.map((item, index) => (
                      <div key={index} className="order-card__item">
                        <img
                          src={item.image || item.product?.images?.[0]}
                          alt={item.name || item.product?.name}
                          className="order-card__item-img"
                        />
                        <div className="order-card__item-info">
                          <p className="order-card__item-name">
                            {item.name || item.product?.name}
                          </p>
                          {item.selectedVariant && (
                            <p className="order-card__item-variant">
                              {item.selectedVariant}
                            </p>
                          )}
                          <p className="order-card__item-qty">
                            Qty: {item.quantity}
                          </p>
                        </div>
                        <p className="order-card__item-price">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="order-card__summary">
                    <div className="order-card__summary-row">
                      <span>Subtotal</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="order-card__summary-row">
                      <span>Delivery</span>
                      <span>{formatCurrency(order.shipping_fee)}</span>
                    </div>
                    <div className="order-card__summary-row order-card__summary-row--total">
                      <span>Total</span>
                      <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="order-card__delivery">
                    <p className="order-card__delivery-label">Delivery Method</p>
                    <p className="order-card__delivery-value">
                      {order.delivery_method === 'pickup' ? 'Pickup' : 'Home Delivery'}
                    </p>
                    {order.delivery_address && (
                      <>
                        <p className="order-card__delivery-label">Delivery Address</p>
                        <p className="order-card__delivery-value">
                          {order.delivery_address.address}, {order.delivery_address.city}, {order.delivery_address.state}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AccountOrders