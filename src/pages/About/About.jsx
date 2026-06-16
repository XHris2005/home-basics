import { Link } from 'react-router-dom'
import './About.css'

function About() {
  return (
    <div className="about-page">

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero__inner">
          <div className="about-hero__badge">
            Our Story
          </div>
          <h1 className="about-hero__title">
            About <span className="about-hero__highlight">Home Basics</span>
          </h1>
          <p className="about-hero__sub">
            Your one-stop convenience store for wellness, households, comfort, gifts and everyday essentials.
          </p>
        </div>
      </section>

      {/* Body */}
      <section className="about-body">
        <div className="about-body__inner">

          <p className="about-text">
            Home Basics is a one-stop wellness and lifestyle store dedicated to providing quality products that support healthy living, comfort, and convenience in everyday life.
          </p>

          <p className="about-text">
            We offer a carefully curated selection of home essentials, bedding, newborn and baby care products, skincare items, wellness products such as supplements, personal care essentials including toothpaste and body care products, as well as snacks, beverages, and other household necessities. Our aim is to make it easy for our customers to find trusted products for themselves, their families, and their homes — all in one place.
          </p>

          <p className="about-text">
            At Home Basics, we understand that the little things make a big difference. From creating a comfortable home and caring for a newborn to maintaining personal wellness and enjoying your favourite treats, we are committed to offering products that enhance your daily lifestyle.
          </p>

          <p className="about-text">
            Customer satisfaction is at the heart of everything we do. We strive to provide quality products, excellent service, and a seamless shopping experience that keeps our customers coming back.
          </p>

          <p className="about-text">
            Whether you are shopping for your home, your health, your family, or everyday essentials, Home Basics is here to serve you with products you can trust.
          </p>

        </div>
      </section>

      {/* Highlights */}
      <section className="about-highlights">
        <div className="about-highlights__inner">
          <div className="about-highlight-card">
            <div className="about-highlight-card__icon">🏠</div>
            <h3 className="about-highlight-card__title">Home Essentials</h3>
            <p className="about-highlight-card__text">
              Bedding, household items and everyday necessities for a comfortable home.
            </p>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-card__icon">👶</div>
            <h3 className="about-highlight-card__title">Baby & Newborn Care</h3>
            <p className="about-highlight-card__text">
              Trusted products to support new parents and care for little ones.
            </p>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-card__icon">🧴</div>
            <h3 className="about-highlight-card__title">Skincare & Wellness</h3>
            <p className="about-highlight-card__text">
              Skincare essentials and supplements to support your health and wellness goals.
            </p>
          </div>
          <div className="about-highlight-card">
            <div className="about-highlight-card__icon">🍪</div>
            <h3 className="about-highlight-card__title">Snacks & Beverages</h3>
            <p className="about-highlight-card__text">
              Enjoy your favourite treats and drinks, all in one convenient place.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="about-cta">
        <div className="about-cta__inner">
          <h2 className="about-cta__title">Shop With Trust</h2>
          <p className="about-cta__sub">
            Discover quality products curated for your home, family, and everyday lifestyle.
          </p>
          <Link to="/shop" className="about-cta__btn">
            Start Shopping →
          </Link>
        </div>
      </section>

    </div>
  )
}

export default About