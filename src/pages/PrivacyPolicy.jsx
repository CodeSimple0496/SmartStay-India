import React, { useEffect } from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy | SmartStay India";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page" style={{ paddingTop: '120px', paddingBottom: '80px', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        <header className="text-center mb-5 animate-fade-in">
          <div style={{ backgroundColor: 'var(--bg-inset)', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid var(--border-sub)' }}>
            <FileText size={36} color="var(--text-accent)" />
          </div>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3rem', color: 'var(--text-header)' }}>Terms of Service</h1>
          <p className="text-muted">Last Updated: April 2, 2026</p>
        </header>

        <div className="glass p-5 animate-slide-up" style={{ borderRadius: '24px', lineHeight: '1.8', color: 'var(--text-dark)' }}>
          <section className="mb-5">
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Eye size={22} /> 1. Information We Collect
            </h2>
            <p>At SmartStay India, we collect information that is necessary to provide you with a seamless luxury booking experience. This includes:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <li><strong>Personal Identifiers:</strong> Name, email address, phone number, and physical address.</li>
              <li><strong>Booking Details:</strong> Travel dates, guest preferences, and stay history.</li>
              <li><strong>Financial Information:</strong> Payment details are processed securely through our PCI-compliant partners and are not stored on our servers.</li>
            </ul>
          </section>

          <section className="mb-5">
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Lock size={22} /> 2. How We Use Your Data
            </h2>
            <p>Your data is used exclusively to facilitate your travel arrangements and improve our services:</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <li>To confirm and manage your reservations with our partner hotels.</li>
              <li>To send you transactional updates (booking confirmations, stay reminders).</li>
              <li>To prevent fraudulent activities and ensure the security of our platform.</li>
            </ul>
          </section>

          <section className="mb-5">
             <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <FileText size={22} /> 3. Data Protection
            </h2>
            <p>We employ enterprise-grade security measures, including 256-bit SSL encryption, to protect your personal information against unauthorized access, alteration, or destruction. Access to user data is restricted to authorized personnel who require the information to perform their duties.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>4. Contact Us</h2>
            <p>If you have any questions regarding this Privacy Policy or wish to exercise your data rights, please contact our Data Protection Officer at <strong>privacy@smartstay.in</strong>.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
