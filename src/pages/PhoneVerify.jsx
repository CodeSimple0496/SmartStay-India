import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ShieldCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';
import './PhoneVerify.css';

const PhoneVerify = () => {
  const [step, setStep] = useState(1); // 1 = Enter Phone, 2 = Enter OTP
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { sendPhoneOTP, verifyPhoneOTP } = useAuth();
  const navigate = useNavigate();

  // Format phone number to E.164 format (+91XXXXXXXXXX)
  const formatPhone = (raw) => {
    const digits = raw.replace(/\D/g, '');
    if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    return `+${digits}`;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    const formatted = formatPhone(phone);

    if (formatted.length < 12) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setLoading(true);
      await sendPhoneOTP(formatted, 'send-otp-btn');
      setStep(2);
    } catch (err) {
      setError('Failed to send OTP: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle 6-box OTP input
  const handleOtpChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next box
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of your OTP.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await verifyPhoneOTP(otpCode);
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError('Incorrect OTP. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-background" />
        <div className="auth-container animate-fade-in glass text-center">
          <Link to="/" className="auth-logo">SmartStay<span>.</span></Link>
          <div className="phone-success-icon">
            <ShieldCheck size={52} color="#2e7d32" />
          </div>
          <h2 style={{ color: '#2e7d32' }}>Phone Verified! 🎉</h2>
          <p className="text-muted">Your mobile number has been successfully verified.</p>
          <div className="verify-loader" style={{ marginTop: '1.5rem' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-background" />

      <div className="auth-container animate-fade-in glass text-center">
        <Link to="/" className="auth-logo">SmartStay<span>.</span></Link>

        {step === 1 ? (
          <>
            <div className="phone-icon-wrap">
              <Phone size={40} />
            </div>
            <h2>Verify Phone Number</h2>
            <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
              Enter your mobile number to receive a 6-digit OTP via SMS.
            </p>

            {error && (
              <div className="auth-error" style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem', textAlign: 'left' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.88rem' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSendOTP} className="auth-form">
              <div className="phone-input-wrapper">
                <span className="phone-prefix">🇮🇳 +91</span>
                <input
                  type="tel"
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={10}
                  className="phone-input"
                  required
                />
              </div>

              <button
                id="send-otp-btn"
                type="submit"
                disabled={loading}
                className="btn btn-primary w-100 mt-4"
              >
                {loading ? 'Sending OTP...' : 'Send OTP via SMS'}
              </button>
            </form>

            <Link to="/" className="verify-skip-link" style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'center', fontSize: '0.85rem', color: '#aaa' }}>
              Skip for now
            </Link>
          </>
        ) : (
          <>
            <div className="phone-icon-wrap otp-icon">
              <ShieldCheck size={40} />
            </div>
            <h2>Enter OTP</h2>
            <p className="text-muted">
              A 6-digit code was sent to{' '}
              <strong style={{ color: 'var(--primary)' }}>
                +91 {phone}
              </strong>
            </p>

            {error && (
              <div className="auth-error" style={{ background: '#ffebee', color: '#c62828', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', margin: '1rem 0', textAlign: 'left' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: '0.88rem' }}>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOTP} className="auth-form">
              {/* 6-box OTP Input */}
              <div className="otp-boxes">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    className="otp-box"
                    autoFocus={i === 0}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="btn btn-primary w-100 mt-4"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <button
                className="btn-text"
                onClick={() => { setStep(1); setOtp(['','','','','','']); setError(''); }}
              >
                <ArrowLeft size={14} /> Change Number
              </button>
              <button
                className="btn-text"
                onClick={handleSendOTP}
              >
                Resend OTP
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PhoneVerify;
