import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home/Home'
import Shop from '../pages/Shop/Shop'
import Login from '../pages/Login/Login'
import Register from '../pages/Register/Register'
import Account from '../pages/Account/Account'
import AccountDashboard from '../pages/Account/AccountDashboard'
import AccountProfile from '../pages/Account/AccountProfile'
import AccountOrders from '../pages/Account/AccountOrders'
import AccountAddresses from '../pages/Account/AccountAddresses'
import AccountMembership from '../pages/Account/AccountMembership'
import AccountSettings from '../pages/Account/AccountSettings'
import Cart from '../pages/Cart/Cart'
import Checkout from '../pages/Checkout/Checkout'
import ProductDetail from '../pages/ProductDetail/ProductDetail'
import BecomeMember from '../pages/BecomeMember/BecomeMember'
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Products from '../pages/admin/Products/Products'
import Orders from '../pages/admin/Orders/Orders'
import Membership from '../pages/admin/Membership/Membership'
import Users from '../pages/admin/Users/Users'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'
import OrderSuccess from '../pages/OrderSuccess/OrderSuccess'
import Customers from '../pages/admin/Customers/Customers'
import Delivery from '../pages/admin/Delivery/Delivery'
import Analytics from '../pages/admin/Analytics/Analytics'
import Settings from '../pages/admin/Settings/Settings'
import AuthCallback from '../pages/AuthCallback/AuthCallback'

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/shop/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/become-member" element={<BecomeMember />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Protected - logged in users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/account" element={<Account />}>
          <Route index element={<AccountDashboard />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="membership" element={<AccountMembership />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>
        <Route path="/order-success" element={<OrderSuccess />} />
      </Route>

      {/* Protected - admin only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/membership" element={<Membership />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/customers" element={<Customers />} />
        <Route path="/admin/delivery" element={<Delivery />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/settings" element={<Settings />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes