import { BrowserRouter, useLocation } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import './styles/global.css'

const noFooterRoutes = ['/login', '/register', '/forgot-password']

function Layout() {
  const location = useLocation()
  const hideFooter = noFooterRoutes.includes(location.pathname)

  return (
    <>
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