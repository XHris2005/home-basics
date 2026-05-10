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
import OrderConfirmation from '../pages/OrderConfirmation/OrderConfirmation'
import BecomeMember from '../pages/BecomeMember/BecomeMember'
import Dashboard from '../pages/admin/Dashboard/Dashboard'
import Products from '../pages/admin/Products/Products'
import Orders from '../pages/admin/Orders/Orders'
import Members from '../pages/admin/Members/Members'
import Users from '../pages/admin/Users/Users'
import ProtectedRoute from '../components/ProtectedRoute/ProtectedRoute'
import ForgotPassword from '../pages/ForgotPassword/ForgotPassword'

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

      {/* Protected - logged in users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-confirmation" element={<OrderConfirmation />} />
        <Route path="/account" element={<Account />}>
          <Route index element={<AccountDashboard />} />
          <Route path="profile" element={<AccountProfile />} />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="addresses" element={<AccountAddresses />} />
          <Route path="membership" element={<AccountMembership />} />
          <Route path="settings" element={<AccountSettings />} />
        </Route>
      </Route>

      {/* Protected - admin only */}
      <Route element={<ProtectedRoute adminOnly />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/orders" element={<Orders />} />
        <Route path="/admin/members" element={<Members />} />
        <Route path="/admin/users" element={<Users />} />
      </Route>
    </Routes>
  )
}

export default AppRoutes