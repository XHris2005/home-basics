import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { getUserOrders } from '../../services/orders'
import { formatCurrency, formatDate } from '../../utils/formatters'
import './AccountDashboard.css'

function AccountDashboard() {
  const { user, profile, isMember, isPendingMember } = useAuth()
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchOrders() {
      try {
        const orders = await getUserOrders(user.id)
        setRecentOrders(orders.slice(0, 3))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchOrders()
  }, [user])

  function getMembershipLabel() {
    if (isMember) return 'Active'
    if (isPendingMember) return 'Pending'
    return 'Guest'
  }

  function getMembershipStatusClass() {
    if (isMember) return 'dashboard-membership__status--active'
    if (isPendingMember) return 'dashboard-membership__status--pending'
    return 'dashboard-membership__status--guest'
  }

  return (
    <div className="account-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-header__title">
          Welcome, {profile?.full_name?.split(' ')[0] || 'User'}
        </h1>
        <p className="dashboard-header__sub">
          Here's what's happening with your account.
        </p>
      </div>

      {/* Cards Row */}
      <div className="dashboard-cards">
        {/* Membership Card */}
        <div className="dashboard-membership">
          <div className="dashboard-membership__top">
            <p className="dashboard-membership__label">Membership</p>
            <span className={`dashboard-membership__status ${getMembershipStatusClass()}`}>
              {getMembershipLabel()}
            </span>
          </div>
          {isMember ? (
            <p className="dashboard-membership__active-text">
              You have access to exclusive member pricing.
            </p>
          ) : isPendingMember ? (
            <p className="dashboard-membership__active-text">
              Your membership is being reviewed.
            </p>
          ) : (
            <Link to="/account/membership" className="dashboard-membership__cta">
              Become a Member Now →
            </Link>
          )}
        </div>

        {/* Total Savings Card */}
        <div className="dashboard-savings">
          <p className="dashboard-savings__label">Total Savings</p>
          <p className="dashboard-savings__amount">₦0</p>
          <div className="dashboard-savings__breakdown">
            <span className="dashboard-savings__row">
              <span className="dashboard-savings__dot dashboard-savings__dot--green" />
              Orekelewa wholesale
              <span className="dashboard-savings__value">₦0</span>
            </span>
            <span className="dashboard-savings__row">
              <span className="dashboard-savings__dot dashboard-savings__dot--orange" />
              Member pricing
              <span className="dashboard-savings__value">₦0</span>
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <button
          className="dashboard-actions__btn"
          onClick={() => navigate('/account/orders')}
        >
          Reorder
        </button>
        <button
          className="dashboard-actions__btn"
          onClick={() => navigate('/account/orders')}
        >
          Track Order
        </button>
        <button
          className="dashboard-actions__btn dashboard-actions__btn--primary"
          onClick={() => navigate('/shop')}
        >
          Shop Deals
        </button>
      </div>

      {/* Recent Orders */}
      <div className="dashboard-orders">
        <div className="dashboard-orders__header">
          <h2 className="dashboard-orders__title">Recent Orders</h2>
          <Link to="/account/orders" className="dashboard-orders__view-all">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-orders__empty">
            <p>Loading orders...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="dashboard-orders__empty">
            <div className="dashboard-orders__empty-icon">📦</div>
            <p>
              No orders yet.{' '}
              <Link to="/shop" className="dashboard-orders__shop-link">
                Start shopping
              </Link>
            </p>
          </div>
        ) : (
          <div className="dashboard-orders__list">
            {recentOrders.map(order => (
              <div key={order.id} className="dashboard-order-item">
                <div className="dashboard-order-item__left">
                  <p className="dashboard-order-item__ref">#{order.payment_ref}</p>
                  <p className="dashboard-order-item__date">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="dashboard-order-item__right">
                  <p className="dashboard-order-item__total">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <span className={`dashboard-order-item__status dashboard-order-item__status--${order.status}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountDashboard