import React from 'react';
import { Shield, Sparkles, Map } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page" style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ paddingBottom: '5rem' }}>
        <div className="text-center" style={{ maxWidth: '800px', margin: '0 auto 4rem auto' }}>
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', color: 'var(--text-header)', marginBottom: '1rem' }}>
            Elevating Indian <span>Hospitality</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: '1.8' }}>
            SmartStay India was founded with a single mission: to provide travelers with seamless, luxurious, and authentic experiences across the Indian subcontinent. From royal palaces in Rajasthan to tranquil backwaters in Kerala, we connect you with the very best stays.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ background: 'var(--secondary)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 4px 12px rgba(var(--secondary-rgb), 0.2)' }}>
              <Map size={30} />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--text-header)', marginBottom: '1rem' }}>Curated Locations</h3>
            <p style={{ color: 'var(--text-muted)' }}>We handpick every property to ensure it meets our rigorous standards for quality, location, and authentic Indian experience.</p>
          </div>

          <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ background: 'var(--secondary)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 4px 12px rgba(var(--secondary-rgb), 0.2)' }}>
              <Shield size={30} />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--text-header)', marginBottom: '1rem' }}>Secure & Trusted</h3>
            <p style={{ color: 'var(--text-muted)' }}>Book with confidence. Our trusted platform ensures secure payments and verified reviews from real travelers.</p>
          </div>

          <div className="glass" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
            <div style={{ background: 'var(--secondary)', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', boxShadow: '0 4px 12px rgba(var(--secondary-rgb), 0.2)' }}>
              <Sparkles size={30} />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display', fontSize: '1.4rem', color: 'var(--text-header)', marginBottom: '1rem' }}>Exceptional Comfort</h3>
            <p style={{ color: 'var(--text-muted)' }}>Whether for business or leisure, our partner properties prioritize your comfort above all else.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
