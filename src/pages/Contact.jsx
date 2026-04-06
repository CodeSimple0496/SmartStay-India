import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendInquiryEmail } from '../services/email';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const inquiryData = {
        ...formData,
        status: 'New',
        createdAt: serverTimestamp()
      };

      // 1. Save to Firestore
      await addDoc(collection(db, 'inquiries'), inquiryData);

      // 2. Trigger Email Notification (Simulated/Real via EmailJS)
      await sendInquiryEmail(inquiryData);

      setSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Inquiry error:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page" style={{ paddingTop: '100px', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      <div className="container" style={{ paddingBottom: '5rem', display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '4rem' }}>
        
        {/* Contact Information */}
        <div className="contact-info animate-fade-in">
          <h1 style={{ fontFamily: 'Playfair Display', fontSize: '3.5rem', color: 'var(--text-header)', marginBottom: '1.5rem' }}>
            Get in <span>Touch</span>
          </h1>
          <p style={{ color: 'var(--text-sub)', fontSize: '1.2rem', marginBottom: '3rem', lineHeight: '1.8' }}>
            Have a question about a regal stay or looking to partner with SmartStay India? Our dedicated team is here to assist you 24/7.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-inset)', padding: '1.2rem', borderRadius: '16px', color: 'var(--text-accent)', border: '1px solid var(--border-sub)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.4rem', fontWeight: '700' }}>Head Office</h4>
                <p style={{ color: 'var(--text-sub)' }}>Level 4, Corporate Park, Andheri East<br/>Mumbai, Maharashtra 400069, India</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-inset)', padding: '1.2rem', borderRadius: '16px', color: 'var(--text-accent)', border: '1px solid var(--border-sub)' }}>
                <Phone size={24} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.4rem', fontWeight: '700' }}>Call Us</h4>
                <p style={{ color: 'var(--text-sub)' }}>+91 98765 43210</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-inset)', padding: '1.2rem', borderRadius: '16px', color: 'var(--text-accent)', border: '1px solid var(--border-sub)' }}>
                <Mail size={24} />
              </div>
              <div>
                <h4 style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '0.4rem', fontWeight: '700' }}>Email Us</h4>
                <p style={{ color: 'var(--text-sub)' }}>support@smartstay.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="contact-form glass animate-fade-in" style={{ padding: '3.5rem', borderRadius: '24px', border: '1px solid var(--border-sub)', boxShadow: 'var(--shadow-lg)' }}>
          {success ? (
            <div className="text-center py-5">
              <CheckCircle size={64} style={{ margin: '0 auto 1.5rem auto', color: 'var(--success)' }} />
              <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--text-header)', fontSize: '2rem', marginBottom: '1rem' }}>Message Sent!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Thank you for reaching out. Our concierge team will get back to you within 4 business hours.</p>
              <button 
                onClick={() => setSuccess(false)} 
                className="btn btn-outline mt-4" 
                style={{ padding: '0.8rem 2rem' }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Playfair Display', color: 'var(--text-header)', marginBottom: '2rem', fontSize: '1.8rem', fontWeight: '700' }}>Send a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', display: 'block', marginBottom: '0.6rem' }}>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Arjun Kapoor" 
                    style={{ width: '100%', padding: '1rem', border: '1.5px solid var(--border-sub)', borderRadius: '12px', transition: 'border-color 0.3s', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)' }} 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required 
                  />
                </div>
                
                <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', display: 'block', marginBottom: '0.6rem' }}>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="you@luxury.com" 
                    style={{ width: '100%', padding: '1rem', border: '1.5px solid var(--border-sub)', borderRadius: '12px', transition: 'border-color 0.3s', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)' }} 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required 
                  />
                </div>

                <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: '600', display: 'block', marginBottom: '0.6rem' }}>Your Message</label>
                  <textarea 
                    placeholder="How can we assist your stay?" 
                    rows="5" 
                    style={{ width: '100%', padding: '1rem', border: '1.5px solid var(--border-sub)', borderRadius: '12px', resize: 'vertical', minHeight: '120px', backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)' }} 
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-100" 
                  style={{ padding: '1.2rem', fontSize: '1.1rem', width: '100%', fontWeight: '700', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}
                  disabled={loading}
                >
                  {loading ? <><Loader className="animate-spin" size={20} /> Sending...</> : <><Send size={20} /> Send Inquiry</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .contact-info span { color: var(--secondary); }
        @media (max-width: 992px) {
          .contact-page .container {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          .contact-info h1 { font-size: 2.8rem !important; }
        }
      `}} />
    </div>
  );
};

export default Contact;
