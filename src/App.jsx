import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { Loader } from 'lucide-react';

// Lazy Loaded Pages
const Home = lazy(() => import('./pages/Home'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const HotelDetails = lazy(() => import('./pages/HotelDetails'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const PhoneVerify = lazy(() => import('./pages/PhoneVerify'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const AddProperty = lazy(() => import('./pages/AddProperty'));
const EditProperty = lazy(() => import('./pages/EditProperty'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// A wrapper to hide Navbar on specific pages (like Login and Partner Dashboard)
const Layout = ({ children }) => {
  const location = useLocation();
  const hideNavbar = ['/login', '/register', '/verify-email', '/verify-phone'].includes(location.pathname) || location.pathname.startsWith('/partner');
  
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideNavbar && <Footer />}
    </>
  );
};

const LoadingFallback = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
    <Loader className="animate-spin text-primary" size={48} />
    <p className="mt-4 text-muted" style={{ fontFamily: 'Playfair Display, serif' }}>SmartStay India</p>
  </div>
);

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/hotel/:id" element={<HotelDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/verify-phone" element={<PhoneVerify />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/partner/hotel/new" element={<AddProperty />} />
            <Route path="/partner/hotel/edit/:id" element={<EditProperty />} />
            <Route path="/partner/dashboard" element={<PartnerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
);
}

export default App;
