import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Register = () => {
  const [isPartner, setIsPartner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const navigate = useNavigate();
  const { register, signInWithGoogle } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneInput = (val) => {
    // Only allow numbers and common phone symbols
    const clean = val.replace(/[^\d+-\s()]/g, '');
    if (val !== clean) {
      setPhoneError('⚠️ Please enter numeric digits only');
      setTimeout(() => setPhoneError(''), 3000);
    }
    setPhone(clean);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Execute Real Firebase Registration
      await register(email, password, firstName, lastName, phone, isPartner);
      
      // Navigate to email verification page after successful signup
      if (isPartner) {
        navigate('/verify-email?role=partner');
      } else {
        navigate('/verify-email');
      }
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background"></div>
      
      <div className="auth-container animate-fade-in glass">
        <div className="auth-header text-center">
          <Link to="/" className="auth-logo">
            SmartStay<span>.</span>
          </Link>
          <h2>Create an Account</h2>
          <p className="text-muted">
            Join us to start booking luxury stays or listing your property.
          </p>
        </div>

        <div className="auth-toggle">
          <button 
            className={`toggle-btn ${!isPartner ? 'active' : ''}`}
            onClick={() => setIsPartner(false)}
            type="button"
          >
            Customer
          </button>
          <button 
            className={`toggle-btn ${isPartner ? 'active' : ''}`}
            onClick={() => setIsPartner(true)}
            type="button"
          >
            Partner
          </button>
        </div>

        {error && (
          <div className="auth-error mt-3 glass-dark animate-scale-in" style={{ borderColor: 'var(--danger)', color: 'white', padding: '12px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="auth-form mt-4">
          <div className="input-row" style={{ display: 'flex', gap: '1rem' }}>
            <div className="input-group half" style={{ flex: 1 }}>
              <label>First Name</label>
              <input 
                type="text" 
                placeholder="Rahul" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required 
              />
            </div>
            <div className="input-group half" style={{ flex: 1 }}>
              <label>Last Name</label>
              <input 
                type="text" 
                placeholder="Sharma" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required 
              />
            </div>
          </div>

          <div className="input-group mt-3">
            <label>Email Address</label>
            <input 
              type="email" 
              placeholder="rahul@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group mt-3" style={{ position: 'relative' }}>
            <label>Phone Number (Optional)</label>
            <input 
              type="tel" 
              placeholder="+91 98765 43210" 
              value={phone}
              onChange={(e) => handlePhoneInput(e.target.value)}
              style={phoneError ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)' } : {}}
            />
            {phoneError && (
              <div className="validation-bubble glass-dark animate-scale-in">
                {phoneError}
              </div>
            )}
          </div>
          
          <div className="input-group mt-3">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="Create a strong password (min 6 chars)" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required 
            />
          </div>

          <button disabled={loading} type="submit" className="btn btn-primary w-100 mt-4">
            {loading ? 'Creating Account...' : 'Sign Up Securely'}
          </button>
        </form>

        <p className="auth-footer mt-4 text-center">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '2rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-sub)' }} />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-sub)' }} />
        </div>

        {/* Google Sign-Up Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="google-btn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Register;

