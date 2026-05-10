import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import crown from '../../assets/crown.png'
import './BecomeMember.css'

function BecomeMember() {
  const { user, isMember } = useAuth()

  return (
    <div className="become-member">

      {/* Hero */}
      <section className="bm-hero">
        <div className="bm-hero__inner">
          <div className="bm-hero__badge">
            <img src={crown} alt="crown" width={24} height={20} />
            Membership
          </div>
          <h1 className="bm-hero__title">
            Shop Smarter with <span className="bm-hero__highlight">Member Pricing</span>
          </h1>
          <p className="bm-hero__sub">
            Join the Home Basics membership and unlock exclusive prices on hundreds of products. 
            Reserved for verified members of the Orekelewa organisation.
          </p>
          <div className="bm-hero__actions">
            {isMember ? (
              <Link to="/shop" className="bm-btn bm-btn--primary">
                Shop Member Deals
              </Link>
            ) : user ? (
              <Link to="/account/membership" className="bm-btn bm-btn--primary">
                Activate Membership
              </Link>
            ) : (
              <>
                <Link to="/register" className="bm-btn bm-btn--primary">
                  Create an Account
                </Link>
                <Link to="/login" className="bm-btn bm-btn--outline">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="bm-benefits">
        <div className="bm-section__inner">
          <h2 className="bm-section__title">Why Become a Member?</h2>
          <p className="bm-section__sub">
            Members get access to prices that aren't available anywhere else.
          </p>
          <div className="bm-benefits__grid">
            <div className="bm-benefit-card">
              <div className="bm-benefit-card__icon">💰</div>
              <h3 className="bm-benefit-card__title">Exclusive Member Pricing</h3>
              <p className="bm-benefit-card__text">
                Access special member prices on all eligible products — prices 
                that retail and wholesale customers never see.
              </p>
            </div>
            <div className="bm-benefit-card">
              <div className="bm-benefit-card__icon">🛍️</div>
              <h3 className="bm-benefit-card__title">Members-Only Products</h3>
              <p className="bm-benefit-card__text">
                Some products are exclusively available to members. 
                Expand your catalogue with items the general public can't access.
              </p>
            </div>
            <div className="bm-benefit-card">
              <div className="bm-benefit-card__icon">⚡</div>
              <h3 className="bm-benefit-card__title">Instant Activation</h3>
              <p className="bm-benefit-card__text">
                Enter your membership code and get instant access. 
                No waiting, no manual approval — valid codes work immediately.
              </p>
            </div>
            <div className="bm-benefit-card">
              <div className="bm-benefit-card__icon">📦</div>
              <h3 className="bm-benefit-card__title">Wholesale + Member Combined</h3>
              <p className="bm-benefit-card__text">
                Already buying in bulk? As a member you get member pricing 
                on top of your existing wholesale advantages.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bm-how">
        <div className="bm-section__inner">
          <h2 className="bm-section__title">How It Works</h2>
          <p className="bm-section__sub">Three simple steps to unlock member pricing.</p>
          <div className="bm-how__steps">
            <div className="bm-how__step">
              <div className="bm-how__step-number">1</div>
              <div className="bm-how__step-content">
                <h3 className="bm-how__step-title">Create an Account</h3>
                <p className="bm-how__step-text">
                  Sign up for a free Home Basics account with your email or Google.
                </p>
              </div>
            </div>
            <div className="bm-how__divider" />
            <div className="bm-how__step">
              <div className="bm-how__step-number">2</div>
              <div className="bm-how__step-content">
                <h3 className="bm-how__step-title">Enter Your Membership Code</h3>
                <p className="bm-how__step-text">
                  Go to your account dashboard and enter the membership code 
                  issued to you by the Orekelewa organisation.
                </p>
              </div>
            </div>
            <div className="bm-how__divider" />
            <div className="bm-how__step">
              <div className="bm-how__step-number">3</div>
              <div className="bm-how__step-content">
                <h3 className="bm-how__step-title">Start Saving</h3>
                <p className="bm-how__step-text">
                  Your membership activates instantly. Member prices are 
                  automatically applied at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bm-cta">
        <div className="bm-cta__inner">
          <h2 className="bm-cta__title">Ready to Start Saving?</h2>
          <p className="bm-cta__sub">
            Create your account today and activate your membership code.
          </p>
          <div className="bm-hero__actions">
            {isMember ? (
              <Link to="/shop" className="bm-btn bm-btn--white">
                Shop Member Deals
              </Link>
            ) : user ? (
              <Link to="/account/membership" className="bm-btn bm-btn--white">
                Activate Membership
              </Link>
            ) : (
              <>
                <Link to="/register" className="bm-btn bm-btn--white">
                  Create an Account
                </Link>
                <Link to="/login" className="bm-btn bm-btn--outline-white">
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

    </div>
  )
}

export default BecomeMember