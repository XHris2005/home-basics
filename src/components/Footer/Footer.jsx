import { Link } from 'react-router-dom'
import logo from "../../assets/logo.png";
import './Footer.css'

function Footer() {
  return (
    <>
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 5v3h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Fast Delivery</p>
              <p className="trust-desc">Quick & reliable shipping</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Secure Payments</p>
              <p className="trust-desc">100% protected transactions</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Member Pricing</p>
              <p className="trust-desc">Exclusive member prices</p>
            </div>
          </div>
          <div className="trust-item">
            <div className="trust-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div>
              <p className="trust-label">Wholesale Deals</p>
              <p className="trust-desc">Buy 24+ & save more (Orekelewa)</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={logo} alt="Homebasics" className="footer-logo-img" />
              <span className="footer-logo-text">Homebasics</span>
            </div>
            <p className="footer-brand-desc">
              Your #1 go-to destination for everyday essentials. Shop quality products at better prices with fast, reliable delivery.
            </p>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Categories</p>
            <Link to="/shop?category=Body+Care+%26+Beauty" className="footer-link">Body Care & Beauty</Link>
            <Link to="/shop?category=Personal+Care+%26+Hygiene" className="footer-link">Personal Care & Hygiene</Link>
            <Link to="/shop?category=Hair+Care" className="footer-link">Hair Care</Link>
            <Link to="/shop?category=Home+Care+%26+Cleaning" className="footer-link">Home Care & Cleaning</Link>
            <Link to="/shop?category=Fragrance+%26+Sprays" className="footer-link">Fragrance & Sprays</Link>
            <Link to="/shop?category=Beverages+%26+Edibles" className="footer-link">Beverages & Edibles</Link>
            <Link to="/shop?category=Home+Essentials" className="footer-link">Home Essentials</Link>
            <Link to="/shop?category=Orekelewa+Products" className="footer-link">Orekelewa Products</Link>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Contact</p>
            <span className="footer-link">Call Us</span>
            <span className="footer-link">Customer Support</span>
            <span className="footer-link">Email Support</span>
            <span className="footer-link">090123456789</span>
            <span className="footer-link">Orekelewa Products</span>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Account</p>
            <Link to="/login" className="footer-link">Sign In</Link>
            <Link to="/register" className="footer-link">Create Account</Link>
            <Link to="/account" className="footer-link">My Account</Link>
            <Link to="/cart" className="footer-link">Cart</Link>
            <Link to="/account?tab=orders" className="footer-link">My Order</Link>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Company</p>
            <span className="footer-link">About Homebasics</span>
            <Link to="/become-member" className="footer-link">Membership</Link>
            <span className="footer-link">Privacy Policy</span>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 Homebasics. All rights reserved</p>
        </div>
      </footer>
    </>
  )
}

export default Footer