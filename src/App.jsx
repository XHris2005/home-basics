import { BrowserRouter, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import './styles/global.css'

function ScrollToTop() {
  const { pathname, search } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname, search])
  return null
}

const noFooterRoutes = ['/login', '/register', '/forgot-password']

function Layout() {
  const location = useLocation()
  const hideFooter = noFooterRoutes.includes(location.pathname)
  const isAdmin = location.pathname.startsWith('/admin')

  if (isAdmin) {
    return (
      <>
        <ScrollToTop />
        <AppRoutes />
      </>
    )
  }
  return (
    <>
    <ScrollToTop />
      <Navbar />
      <main>
        <AppRoutes />
      </main>
      {!hideFooter && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App