import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, ChevronDown, Sun, Moon, Calendar, Globe, Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import './Navbar.css';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, userData, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { currency, toggleCurrency, language, toggleLanguage } = useMarket();

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setDropdownOpen(false);
      navigate('/');
    } catch (err) {
      console.error('Failed to log out:', err);
    }
  };

  const displayName = userData
    ? `${userData.firstName} ${userData.lastName}`
    : currentUser?.email?.split('@')[0] || 'My Account';

  return (
    <nav className={`navbar ${(!isHomePage || isScrolled) ? 'scrolled glass' : ''}`}>
      <div className="container nav-container">
        <Link to="/" className="nav-logo">
          SmartStay<span>.</span>
        </Link>
        
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/partner/dashboard" className="nav-link partner-link">List your property</Link>
        </div>

        <div className="nav-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="market-controls hide-mobile">
            <select 
              value={currency} 
              onChange={(e) => toggleCurrency(e.target.value)}
              className="currency-select"
            >
              <option value="INR">₹ INR</option>
              <option value="USD">$ USD</option>
              <option value="EUR">€ EUR</option>
            </select>
            
            <button 
              className="lang-toggle"
              onClick={() => toggleLanguage(language === 'EN' ? 'HI' : 'EN')}
            >
              <Globe size={18} />
              <span>{language}</span>
            </button>
          </div>

          {currentUser ? (
            // Logged-in user dropdown
            <div className="user-dropdown" ref={dropdownRef}>
              <button
                className="user-dropdown-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="user-avatar">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <span className="user-name">{displayName}</span>
                <ChevronDown size={16} className={dropdownOpen ? 'rotated' : ''} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <span className="dropdown-email">{currentUser.email}</span>
                    {userData?.role && (
                      <span className={`dropdown-role ${userData.role}`}>
                        {userData.role === 'admin' ? '🛡️ System Admin' : userData.role === 'partner' ? '🏨 Partner' : '👤 Customer'}
                      </span>
                    )}
                  </div>
                  <div className="dropdown-divider" />
                  <Link 
                    to="/my-bookings" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Calendar size={16} />
                    My Bookings
                  </Link>
                  <Link 
                    to="/wishlist" 
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Heart size={16} />
                    My Wishlist
                  </Link>
                  {userData?.role === 'partner' && (
                    <Link 
                      to="/partner/dashboard" 
                      className="dropdown-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Partner Dashboard
                    </Link>
                  )}
                  {userData?.role === 'admin' && (
                    <Link 
                      to="/admin/dashboard" 
                      className="dropdown-item admin-highlight"
                      onClick={() => setDropdownOpen(false)}
                    >
                      🛡️ Admin Console
                    </Link>
                  )}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Not logged in - show Sign In button
            <Link to="/login" className="btn btn-primary login-btn">
              <User size={18} />
              Sign In
            </Link>
          )}
          
          <button 
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
