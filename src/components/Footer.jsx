import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <>
      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <h2 className="newsletter-title">Stay <em>Inspired</em></h2>
          <p className="newsletter-subtitle">
            Receive exclusive travel stories, curated offers, and invitation-only events<br/>
            delivered to your inbox.
          </p>
          {subscribed ? (
            <p className="subscribe-success">✦ Thank you for subscribing. Welcome to SmartStay India.</p>
          ) : (
            <form className="newsletter-form" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          )}
        </div>
      </section>

      {/* Main Footer */}
      <footer className="main-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <Link to="/" className="footer-logo">SmartStay<span>.</span>India</Link>
            <p>Where heritage meets hospitality. Defining the gold standard of luxury Indian travel since 2024.</p>
            <div className="social-links">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Facebook">FB</a>
              <a href="#" aria-label="LinkedIn">LN</a>
              <a href="#" aria-label="Twitter">TW</a>
            </div>
          </div>

          <div className="footer-links-grid">
            <div className="footer-col">
              <h4>Destinations</h4>
              <ul>
                <li><Link to="/search">Goa, India</Link></li>
                <li><Link to="/search">Jaipur, Rajasthan</Link></li>
                <li><Link to="/search">Kerala Backwaters</Link></li>
                <li><Link to="/search">Udaipur, Rajasthan</Link></li>
                <li><Link to="/search">Mumbai, Maharashtra</Link></li>
                <li><Link to="/search">Shimla, Himachal</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Experience</h4>
              <ul>
                <li><a href="#">Fine Dining</a></li>
                <li><a href="#">Wellness & Spa</a></li>
                <li><a href="#">Cultural Tours</a></li>
                <li><a href="#">Weddings</a></li>
                <li><a href="#">Corporate Events</a></li>
                <li><a href="#">Adventure Stays</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <ul>
                <li><Link to="/about">Our Story</Link></li>
                <li><a href="#">Sustainability</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press Room</a></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/partner/dashboard">For Partners</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 SmartStay India Hotels & Resorts. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
