import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../firebase';
import './Auth.css';
import './VerifyEmail.css';

const VerifyEmail = () => {
  const { currentUser, resendVerificationEmail } = useAuth();
  const [resent, setResent] = useState(false);
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');

  // Poll Firebase every 3 seconds to check if user verified their email
  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload(); // Refresh user data from Firebase
        if (auth.currentUser.emailVerified) {
          setVerified(true);
          clearInterval(interval);
          // Redirect after 2 seconds
          setTimeout(() => {
            navigate(role === 'partner' ? '/partner/dashboard' : '/');
          }, 2000);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [navigate, role]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResend = async () => {
    try {
      setChecking(true);
      await resendVerificationEmail();
      setResent(true);
      setCooldown(60); // 60 second cooldown before they can resend again
    } catch (err) {
      console.error('Failed to resend:', err);
    } finally {
      setChecking(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-page">
        <div className="auth-background"></div>
        <div className="auth-container animate-fade-in glass text-center">
          <p>You must be logged in to view this page.</p>
          <Link to="/login" className="btn btn-primary mt-4">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-background"></div>

      <div className="auth-container animate-fade-in glass text-center verify-container">
        <Link to="/" className="auth-logo">
          SmartStay<span>.</span>
        </Link>

        {verified ? (
          // ✅ Verified State
          <div className="verify-success">
            <div className="verify-icon success-icon">
              <CheckCircle size={48} color="#2e7d32" />
            </div>
            <h2>Email Verified! 🎉</h2>
            <p className="text-muted">Your account is fully active. Redirecting you now...</p>
            <div className="verify-loader"></div>
          </div>
        ) : (
          // 📧 Waiting State
          <>
            <div className="verify-icon">
              <Mail size={48} />
            </div>

            <h2>Check Your Gmail</h2>
            <p className="text-muted">
              We've sent a verification link to:
            </p>
            <div className="verify-email-badge">
              {currentUser.email}
            </div>
            <p className="text-muted verify-instructions">
              Open the email from <strong>noreply@smartstayindia-7ea3e.firebaseapp.com</strong> and click the link inside. This page will automatically update once you've verified!
            </p>

            <div className="verify-pulse">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <p className="verify-waiting-text">Waiting for verification...</p>

            <div className="verify-actions">
              {resent && (
                <div className="verify-sent-notice">
                  ✅ A new verification email has been sent!
                </div>
              )}

              <button
                className="btn btn-outline w-100"
                onClick={handleResend}
                disabled={checking || cooldown > 0}
              >
                <RefreshCw size={16} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Verification Email'}
              </button>

              <Link to="/" className="verify-skip-link">
                Skip for now <ArrowRight size={14} />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
