import React, { useEffect } from 'react';
import { FileText, Gavel, Calendar, CreditCard } from 'lucide-react';

const TermsOfService = () => {
  useEffect(() => {
    document.title = "Terms of Service | SmartStay India";
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
          <p className="text-muted">Effective Date: April 2, 2026</p>
        </header>

        <div className="glass p-5 animate-slide-up" style={{ borderRadius: '24px', lineHeight: '1.8', color: 'var(--text-dark)' }}>
          <section className="mb-5">
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Gavel size={22} /> 1. Acceptance of Terms
            </h2>
            <p>By accessing or using SmartStay India, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section className="mb-5">
            <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <Calendar size={22} /> 2. Booking Policies
            </h2>
            <p>All bookings made through our platform are subject to the specific policies of the partner hotel. This includes check-in/check-out times, cancellation windows, and guest requirements.</p>
            <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
              <li><strong>Verification:</strong> We reserve the right to verify your identity and payment method prior to confirmation.</li>
              <li><strong>Cancellations:</strong> Refunds for cancellations are governed by the specific policy stated on the booking page.</li>
            </ul>
          </section>

          <section className="mb-5">
             <h2 style={{ fontFamily: 'Playfair Display', fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--text-header)', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
              <CreditCard size={22} /> 3. Payment & Pricing
            </h2>
            <p>SmartStay India displays prices in Indian Rupees (INR) including applicable taxes (GST). We strive for pricing accuracy but reserve the right to correct any errors in displayed rates.</p>
          </section>

          <section>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.2rem', color: 'var(--primary)' }}>4. Limitation of Liability</h2>
            <p>While we work exclusively with curated luxury partners, SmartStay India acts as an intermediary booking platform and is not liable for service deficiencies or incidents occurring at the partner property.</p>
          </section>

          <section className="mt-5 pt-4 border-top">
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              These terms are governed by the laws of the Republic of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
