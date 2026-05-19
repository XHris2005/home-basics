import './Privacy.css'

function Privacy() {
  return (
    <div className="privacy-page">
      <div className="privacy-inner">
        <h1 className="privacy-title">Privacy Policy</h1>
        <p className="privacy-updated">Last updated: May 2026</p>

        <section className="privacy-section">
          <h2>1. Information We Collect</h2>
          <p>When you use Home Basics, we collect information you provide directly, including your name, email address, phone number, and delivery address when you register or place an order. We also collect payment information processed securely through Paystack.</p>
        </section>

        <section className="privacy-section">
          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to process your orders, send order confirmations and updates, manage your account, verify membership status, and improve our services. We do not sell your personal data to third parties.</p>
        </section>

        <section className="privacy-section">
          <h2>3. Data Sharing</h2>
          <p>We share your information only with service providers necessary to operate our platform — including Supabase (database), Cloudinary (images), and Paystack (payments). These providers are bound by their own privacy policies and only process data as needed to provide their services.</p>
        </section>

        <section className="privacy-section">
          <h2>4. Google Sign-In</h2>
          <p>If you choose to sign in with Google, we receive your name and email address from Google. We do not receive or store your Google password. Your use of Google Sign-In is also governed by Google's Privacy Policy.</p>
        </section>

        <section className="privacy-section">
          <h2>5. Data Security</h2>
          <p>We take reasonable measures to protect your personal information. Your data is stored securely and access is restricted to authorised personnel only.</p>
        </section>

        <section className="privacy-section">
          <h2>6. Your Rights</h2>
          <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us. You can also update your profile information directly from your account page.</p>
        </section>

        <section className="privacy-section">
          <h2>7. Cookies</h2>
          <p>We use essential cookies and local storage to keep you signed in and maintain your cart. We do not use advertising or tracking cookies.</p>
        </section>

        <section className="privacy-section">
          <h2>8. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:support@home-basics.netlify.app">support@home-basics.netlify.app</a>.</p>
        </section>
      </div>
    </div>
  )
}

export default Privacy