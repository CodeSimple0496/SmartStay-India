import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  limit, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc,
  getDoc
} from 'firebase/firestore';
import { 
  Building, 
  TrendingUp, 
  Users, 
  Calendar, 
  Plus, 
  MoreHorizontal, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  MapPin,
  Trash2,
  Edit,
  ShieldAlert,
  ShieldCheck,
  MessageCircle,
  Bell,
  ArrowUpRight,
  ArrowDownLeft,
  UserPlus,
  HelpCircle,
  DoorOpen,
  Globe,
  Search,
  Award
} from 'lucide-react';
import { sendConfirmationStatusEmail } from '../services/email';
import MobileDashboardNav from '../components/MobileDashboardNav';
import './PartnerDashboard.css';
import '../components/MobileDashboardNav.css';

const FREE_TIER_LIMIT = 3;

// ── SVG Revenue Chart Component ──
const RevenueChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-muted italic p-4">Gathering revenue insights...</div>;
  
  const width = 400;
  const height = 150;
  const padding = 20;
  const maxVal = Math.max(...data.map(d => d.value), 10000);
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - (d.value / maxVal) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="chart-container animate-fade-in relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--secondary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--secondary)" stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <path 
          d={`M ${padding},${height-padding} L ${points} L ${width-padding},${height-padding} Z`} 
          fill="url(#chartGradient)" 
        />
        <polyline
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="3.5"
          strokeLinejoin="round"
          strokeLinecap="round"
          points={points}
          filter="url(#glow)"
        />
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
          const y = height - (d.value / maxVal) * (height - padding * 2) - padding;
          return (
            <g key={i} className="chart-node">
              <circle cx={x} cy={y} r="2.5" fill="var(--secondary)" />
              <circle cx={x} cy={y} r="6" fill="var(--secondary)" opacity="0.2" className="animate-pulse" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ── Booking Heatmap Component ──
const BookingHeatmap = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  return (
    <div className="heatmap-container mt-4">
      <div className="heatmap-grid">
        {days.map((day, dIdx) => (
          <div key={`${day}-${dIdx}`} className="heatmap-row">
            <span className="day-label">{day}</span>
            {hours.map(h => {
              const intensity = Math.random(); 
              return (
                <div 
                  key={h} 
                  className="heat-cell" 
                  style={{ 
                    background: `rgba(232, 200, 114, ${intensity})`,
                    opacity: intensity > 0.2 ? 1 : 0.3
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="heatmap-hours">
        <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>24h</span>
      </div>
    </div>
  );
};

// ── Donut Chart for Demographics ──
const DemographicsChart = () => {
  return (
    <div className="donut-container">
      <svg width="120" height="120" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="var(--primary)" strokeWidth="4" strokeDasharray="65 35" />
        <circle cx="20" cy="20" r="15.915" fill="transparent" stroke="var(--secondary)" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="-65" />
      </svg>
      <div className="donut-labels">
        <p><span className="dot new"></span> New 65%</p>
        <p><span className="dot repeat"></span> Return 35%</p>
      </div>
    </div>
  );
};

const PartnerDashboard = () => {
  const { currentUser, userData, updateUserRole } = useAuth();
  const navigate = useNavigate();
  
  // ── 1. Hooks (Must be at top level) ── 
  const [loading, setLoading] = useState(true);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); 
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [activity, setActivity] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bookingFilter, setBookingFilter] = useState('active'); // 'active' or 'history'
  const [stats, setStats] = useState({ revenue: 0, totalBookings: 0, propertyCount: 0 });
  const [chartData, setChartData] = useState([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showGlobalProperties, setShowGlobalProperties] = useState(false); // Global toggle for database access

  const handleUpgrade = async () => {
    try {
      setIsUpgrading(true);
      await updateUserRole('partner');
    } catch (err) {
      console.error("Upgrade failed:", err);
      alert("Failed to upgrade account.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const fetchData = async () => {
    if (!currentUser || (userData?.role !== 'partner' && userData?.role !== 'admin')) return;
    try {
      setLoading(true);
      
      // 1. Properties (Optionally Filtered)
      let propsQuery;
      if (showGlobalProperties) {
        propsQuery = query(collection(db, 'properties'), orderBy('createdAt', 'desc'));
      } else {
        propsQuery = query(
          collection(db, 'properties'), 
          where('ownerId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      }
      const propsSnap = await getDocs(propsQuery);
      const propsData = propsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProperties(propsData);

      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      let bookingsData = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      bookingsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBookings(bookingsData);

      const reviewSnap = await getDocs(query(collection(db, 'reviews'), orderBy('createdAt', 'desc')));
      const reviewData = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllReviews(reviewData);

      const inquirySnap = await getDocs(query(collection(db, 'inquiries'), orderBy('createdAt', 'desc'), limit(10)));
      const inquiryData = inquirySnap.docs.map(doc => ({ id: doc.id, type: 'inquiry', ...doc.data() }));

      setActivity([
        ...bookingsData.slice(0, 5).map(b => ({ ...b, type: 'booking' })),
        ...reviewData.slice(0, 5).map(r => ({ ...r, type: 'review' })),
        ...inquiryData
      ].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)).slice(0, 8));

      const totalRevenue = bookingsData.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
      setStats({ revenue: totalRevenue, totalBookings: bookingsData.length, propertyCount: propsData.length });
      setChartData(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ name: day, value: (totalRevenue / 7) * (0.8 + Math.random() * 0.4) })));
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser, userData, showGlobalProperties]);

  // ── 2. Guard Clause (Role Check) ── 
  if (userData?.role !== 'partner' && userData?.role !== 'admin') {
     return (
       <div className="partner-dashboard-page access-denied flex items-center justify-center min-h-screen bg-bg-secondary p-4">
          <div className="text-center p-10 glass animate-scale-in max-w-lg shadow-2xl">
            <div className="flex justify-center mb-6"><div className="bg-red-50 p-6 rounded-full"><ShieldAlert size={64} className="text-red-500" /></div></div>
            <h1 className="text-3xl font-black text-accent mb-4 uppercase tracking-tighter">Partner Dashboard Restricted</h1>
            <p className="text-muted italic mb-8 leading-relaxed">This central operations hub is exclusive to **certified SmartPartners**. Explore professional tools for property management and guest relations.</p>
            <div className="flex flex-col gap-4">
               <button onClick={handleUpgrade} disabled={isUpgrading} className="btn btn-primary w-100 py-4 text-lg shadow-lg hover:shadow-primary/20 transition-all font-bold">
                 {isUpgrading ? 'Provisioning Portal...' : 'Verify & Upgrade as Partner'}
               </button>
               <Link to="/" className="text-sm font-bold text-accent hover:underline">Return to Marketplace</Link>
            </div>
          </div>
       </div>
     );
  }

  const handleSeed = async () => {
    if (!window.confirm("ARE YOU READY? This will clear existing hotels and fetch 200 NEW luxury properties from Booking.com all over India. This takes ~2-3 minutes.")) return;
    
    setIsSeeding(true);
    try {
      await seedDatabase(currentUser.uid, (msg) => {
        setSeedStatus(msg);
      });
      await fetchData(); // Refresh local list
    } catch (err) {
      setSeedStatus(`Error: ${err.message}`);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleDeleteProperty = async (id, name) => {
    if (!window.confirm(`Permanently delete ${name}?`)) return;
    try {
      await deleteDoc(doc(db, 'properties', id));
      setProperties(properties.filter(p => p.id !== id));
      alert('Property deleted.');
    } catch (err) { console.error(err); }
  };

  const handleClaimProperty = async (id) => {
    try {
      const propRef = doc(db, 'properties', id);
      await updateDoc(propRef, { ownerId: currentUser.uid });
      alert("Property assigned to your account successfully!");
      fetchData(); // Refresh list
    } catch (err) {
      console.error("Claim failed:", err);
      alert("Failed to claim property. You might need higher permissions.");
    }
  };

  const handleClaimAll = async () => {
    if (!window.confirm("DEBUG: Claim all orphan or misassigned properties to YOUR current account?")) return;
    try {
      setLoading(true);
      const allProps = await getDocs(collection(db, 'properties'));
      let claimCount = 0;
      for (const d of allProps.docs) {
        // Assign if orphan or if we really want to bulk claim for dev purposes
        await updateDoc(doc(db, 'properties', d.id), { ownerId: currentUser.uid });
        claimCount++;
      }
      alert(`Successfully claimed ${claimCount} properties!`);
      setShowGlobalProperties(false);
      fetchData();
    } catch (err) {
      console.error("Bulk claim failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm('Delete this Guest Review?')) return;
    try {
      await deleteDoc(doc(db, 'reviews', review.id));
      const hotelRef = doc(db, 'properties', review.hotelId);
      const hotelSnap = await getDoc(hotelRef);
      if (hotelSnap.exists()) {
        const hData = hotelSnap.data();
        const oldCount = hData.reviews || 0;
        const oldAvg = hData.rating || 0;
        let newCount = Math.max(0, oldCount - 1);
        let newAvg = newCount > 0 ? ((oldAvg * oldCount) - Number(review.rating)) / newCount : 0;
        await updateDoc(hotelRef, { reviews: newCount, rating: Number(newAvg.toFixed(1)) });
      }
      setAllReviews(allReviews.filter(r => r.id !== review.id));
      alert('Review deleted.');
    } catch (err) { console.error(err); }
  };
 
  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status: newStatus,
        bookingStatus: newStatus // Ensure both are synced
      });

      // Notify guest on approval
      if (newStatus === 'Approved') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          await sendConfirmationStatusEmail(booking, 'status');
        }
      }

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus, bookingStatus: newStatus } : b));
      setActivity(prev => prev.map(a => a.id === bookingId ? { ...a, status: newStatus, bookingStatus: newStatus } : a));
    } catch (err) {
      console.error("Status update failed:", err);
      alert("Failed to update status.");
    }
  };

  const handlePaymentStatusUpdate = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { paymentStatus: newStatus });
      
      // Notify guest on payment received
      if (newStatus === 'Paid') {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          await sendConfirmationStatusEmail(booking, 'payment');
        }
      }

      setBookings(bookings.map(b => b.id === bookingId ? { ...b, paymentStatus: newStatus } : b));
    } catch (err) {
      console.error("Payment status update failed:", err);
      alert("Failed to update payment status.");
    }
  };

  const handleCheckOut = async (bookingId) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    if (booking.paymentStatus !== 'Paid' && booking.paymentMethod === 'Cash') {
       if (!window.confirm("GUEST PAYMENT PENDING: This guest chose 'Cash at Property'. Has the payment been collected? Selecting OK will mark as PAID and CHECKED OUT.")) {
          return;
       }
       // Auto-mark as paid on checkout if cash
       await handlePaymentStatusUpdate(bookingId, 'Paid');
    }

    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status: 'Checked Out',
        bookingStatus: 'Checked Out'
      });
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Checked Out', bookingStatus: 'Checked Out' } : b));
      alert("Guest Checked Out successfully! Review the Financial Hub for updated revenue.");
    } catch (err) {
      console.error("Check-out failed:", err);
      alert("Failed to process check-out.");
    }
  };

  const handleProjectMigration = async () => {
    const targetEmail = 'useless4484@gamil.com';
    if (!window.confirm(`CRITICAL: Transfer ALL site properties and grant ADMIN status to ${targetEmail}? This action is permanent.`)) return;
    
    try {
      setLoading(true);
      // 1. Find the target user
      const usersSnap = await getDocs(query(collection(db, 'users'), where('email', '==', targetEmail)));
      
      if (usersSnap.empty) {
        alert(`Error: User with email ${targetEmail} not found. Please ensure they have registered first.`);
        return;
      }
      
      const adminUser = usersSnap.docs[0];
      const adminUid = adminUser.id;

      // 2. Set as Admin
      await updateDoc(doc(db, 'users', adminUid), { role: 'admin' });

      // 3. Batch Update all properties
      const propsSnap = await getDocs(collection(db, 'properties'));
      let transferCount = 0;
      for (const d of propsSnap.docs) {
        await updateDoc(doc(db, 'properties', d.id), { ownerId: adminUid });
        transferCount++;
      }

      alert(`SUCCESS: ${targetEmail} is now the PROJECT ADMIN. ${transferCount} properties transferred.`);
      fetchData();
    } catch (err) {
      console.error("Migration failed:", err);
      alert("Migration encountered an error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
       <div className="dashboard-page flex items-center justify-center h-screen w-full">
         <Loader className="animate-spin text-accent" size={48} />
         <p className="mt-4 text-muted">Authenticating Business Suite...</p>
       </div>
     );
  }

  const mobileLinks = [
    { id: 'overview', label: 'Status', icon: <TrendingUp size={20} /> },
    { id: 'properties', label: 'Fleet', icon: <Building size={20} /> },
    { id: 'bookings', label: 'Stays', icon: <Calendar size={20} /> },
    { id: 'reviews', label: 'Feed', icon: <MessageCircle size={20} /> }
  ];

  return (
    <div className="dashboard-page overflow-hidden">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <h2>Smart<span>Partner</span></h2>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab('overview')} className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}><TrendingUp size={18}/> Overview</button>
          <button onClick={() => setActiveTab('properties')} className={`nav-item-btn ${activeTab === 'properties' ? 'active' : ''}`}><Building size={18}/> My Properties</button>
          <button onClick={() => setActiveTab('bookings')} className={`nav-item-btn ${activeTab === 'bookings' ? 'active' : ''}`}><Calendar size={18}/> Reservations</button>
          <button onClick={() => setActiveTab('reviews')} className={`nav-item-btn ${activeTab === 'reviews' ? 'active' : ''}`}><MessageCircle size={18}/> Moderation</button>
          
          {userData?.role === 'admin' && (
            <Link to="/admin/dashboard" className="nav-item-btn text-purple-600 hover:bg-purple-50">
              <ShieldCheck size={18}/> Admin Console
            </Link>
          )}

          <div className="nav-divider" />
          <Link to="/" className="nav-item-btn"><Users size={18}/> View Site</Link>
          
          {currentUser?.email === 'useless4484@gmail.com' && (
            <>
              <div className="nav-divider mt-6" />
              <div className="px-4 py-2 opacity-50 text-[10px] font-black uppercase tracking-widest text-accent">System Migration</div>
              <button 
                onClick={handleProjectMigration} 
                className="nav-item-btn text-orange-600 hover:bg-orange-50"
                title="Transfers everything to Project Admin"
              >
                <UserPlus size={18}/> Migrate to Admin
              </button>
              
              <div className="nav-divider mt-2" />
              <div className="px-4 py-2 opacity-50 text-[10px] font-black uppercase tracking-widest text-accent">Developer Toolkit</div>
              <button 
                onClick={handleClaimAll} 
                className="nav-item-btn text-red-600 hover:bg-red-50"
                title="Saves all site properties to your account"
              >
                <ShieldAlert size={18}/> Bulk Claim Assets
              </button>
            </>
          )}
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header glass">
          <div>
            <h1>{activeTab === 'overview' ? 'Business Suite' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <p className="text-muted">Welcome back, <strong>{userData?.firstName || 'Admin'}</strong></p>
          </div>
          <div className="header-actions">
            <div className="notification-bell">
               <Bell size={22} className="text-primary cursor-pointer" />
               <span className="badge-red">{activity.length}</span>
            </div>
            {userData?.isPremium || properties.length < FREE_TIER_LIMIT ? (
              <Link to="/partner/hotel/new" className="btn btn-primary btn-sm"><Plus size={16}/> Manual Hotel Entry</Link>
            ) : (
              <button onClick={() => setShowUpgradeModal(true)} className="btn btn-primary btn-sm" style={{ background: 'linear-gradient(135deg, #FFD700, #E8C872)', color: 'var(--primary)' }}>
                👑 Upgrade to List More
              </button>
            )}
          </div>
        </header>

        {showUpgradeModal && (
          <div className="upgrade-modal-overlay glass animate-fade-in" style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 44, 89, 0.8)' }}>
             <div className="upgrade-modal-content glass animate-scale-in" style={{ padding: '3rem', borderRadius: '32px', maxWidth: '500px', textAlign: 'center', background: 'var(--card-bg)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🏆</div>
                <h2 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Unlock Elite Partner Status</h2>
                <p className="text-muted" style={{ marginBottom: '2rem' }}>
                  You've reached the free limit of <strong>{FREE_TIER_LIMIT} properties</strong>. 
                  Upgrade to our Elite Tier to unlock unlimited listings, priority search placement, and advanced analytics.
                </p>
                <div className="price-tag mb-4" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                   ₹4,999<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/year</span>
                </div>
                <div className="flex flex-col gap-3">
                   <button className="btn btn-primary w-100" style={{ height: '56px', background: 'var(--secondary)', color: 'var(--primary)' }}>Secure Elite Access</button>
                   <button onClick={() => setShowUpgradeModal(false)} className="btn btn-outline w-100">Maybe Later</button>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="overview-layout mt-5">
            <div className="overview-main">
              {/* Stats Grid */}
              <section className="dashboard-stats">
                <div className="stat-card glass">
                  <div className="stat-info">
                    <p className="text-muted">Weekly Revenue</p>
                    <h3>₹{stats.revenue.toLocaleString()}</h3>
                    <span className="text-success text-xs font-bold"><ArrowUpRight size={12} className="inline" /> +12.5%</span>
                  </div>
                  <RevenueChart data={chartData} />
                </div>
                
                <div className="mini-stats-grid">
                   <div className="mini-stat glass">
                      <Calendar size={18} className="text-success" />
                      <div><h4>{stats.totalBookings}</h4><p>Stays</p></div>
                   </div>
                   <div className="mini-stat glass">
                      <Building size={18} className="text-primary" />
                      <div><h4>{stats.propertyCount}</h4><p>Hotels</p></div>
                   </div>
                </div>
              </section>

              {/* BI Insights Section */}
              <section className="dashboard-insights mt-5">
                <div className="insight-card glass">
                  <div className="section-header">
                    <h3>Booking Heatmap</h3>
                    <p className="text-xs text-muted">Peak reservation hours (Mock Data)</p>
                  </div>
                  <BookingHeatmap />
                </div>
                <div className="insight-card glass">
                  <div className="section-header">
                    <h3>Guest Loyalty</h3>
                    <p className="text-xs text-muted">New vs Returning Users</p>
                  </div>
                  <DemographicsChart />
                </div>
              </section>

            </div> {/* Close overview-main */}
            
            <aside className="overview-sidebar">
               {/* Professional Authentication Panel */}
               <div className="activity-feed glass mb-4 border-l-4 border-primary">
                 <div className="flex items-center gap-3 mb-4">
                   <div className="p-2 bg-secondary/20 rounded-lg text-secondary">
                     <Award size={18} />
                   </div>
                   <h3 className="m-0" style={{fontSize: '0.95rem', fontWeight: 800}}>Market Authentication</h3>
                 </div>
                 
                 <div className="p-4 bg-secondary/20 rounded-2xl mb-4">
                    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Authenticated Assets</p>
                    <h2 className="text-2xl font-black">{properties.length} <span className="text-xs font-normal opacity-50">Verified Hotels</span></h2>
                    <div className="w-full h-1.5 bg-secondary/50 mt-3 rounded-full overflow-hidden">
                       <div className="h-full bg-primary" style={{width: `${Math.min(100, (properties.length / 10) * 100)}%`}} />
                    </div>
                 </div>

                 <p className="text-[10px] text-muted italic leading-relaxed">
                    Ensure your digital presence is verified. Claimed assets receive priority search placement and advanced luxury analytics.
                 </p>
               </div>

              <div className="activity-feed glass">
                <h3>Recent Activity</h3>
                <div className="activity-list mt-4">
                  {activity.map((act, i) => (
                    <div key={i} className="activity-item">
                      <div className={`activity-icon ${act.type}`}>
                        {act.type === 'booking' && <CheckCircle size={14} />}
                        {act.type === 'review' && <TrendingUp size={14} />}
                        {act.type === 'inquiry' && <HelpCircle size={14} />}
                      </div>
                      <div className="activity-details">
                        <p>{act.type === 'booking' ? `New stay by ${act.customerName}` : act.type === 'review' ? `Review from ${act.userName}` : `Inquiry from ${act.name}`}</p>
                        <span>{act.createdAt?.seconds ? new Date(act.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-outline btn-sm w-100 mt-4">View All Logs</button>
              </div>
            </aside>
          </div>
        )}

        {activeTab === 'properties' && (
           <section className="dashboard-properties mt-5 glass animate-fade-in shadow-xl">
             <div className="section-header flex justify-between items-center px-6 py-4 border-b border-color bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-4">
                   <h2 className="text-lg font-bold">Inventory Manager ({properties.length})</h2>
                   <div className="filter-pills flex gap-1 bg-secondary/20 p-1 rounded-lg">
                      <button 
                        onClick={() => setShowGlobalProperties(false)}
                        className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${!showGlobalProperties ? 'bg-primary text-secondary' : 'hover:bg-secondary/30'}`}
                      >
                         My Fleet
                      </button>
                      <button 
                        onClick={() => setShowGlobalProperties(true)}
                        className={`px-2 py-1 text-[10px] font-black uppercase rounded-md transition-all flex items-center gap-1.5 ${showGlobalProperties ? 'bg-primary text-secondary' : 'hover:bg-secondary/30'}`}
                      >
                         <Globe size={10} /> Global Registry
                      </button>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="search-box relative" style={{width: '250px'}}>
                      <input 
                        type="text" 
                        placeholder={showGlobalProperties ? "Find hotel in Global Registry..." : "Filter your inventory..."} 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs p-2 pl-8 border border-color rounded-lg bg-white/80"
                      />
                      <Search size={14} className="absolute left-2 top-2.5 opacity-50 font-black" />
                   </div>
                   <Link to="/partner/hotel/new" className="text-[10px] px-4 py-2 bg-primary text-white rounded-lg font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Manual Asset Entry</Link>
                </div>
             </div>
             <div className="table-responsive">
                <table className="properties-table">
                  <thead className="bg-secondary opacity-80 text-[10px] uppercase font-black tracking-widest text-muted">
                    <tr>
                      <th className="p-4">Digital Asset</th>
                      <th>Location Registry</th>
                      <th>Market Value</th>
                      <th className="text-right p-6">Authentication</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties
                      .filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.location?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map(hotel => (
                        <tr key={hotel.id} className="border-b border-secondary/10 hover:bg-secondary/5 transition-all">
                          <td className="p-4">
                             <div className="flex flex-col">
                                <span className="font-bold text-sm text-primary">{hotel.name}</span>
                                <span className="text-[9px] opacity-60">ID: #{hotel.id.substring(0, 8).toUpperCase()}</span>
                             </div>
                          </td>
                          <td className="text-xs text-muted flex items-center gap-1.5"><MapPin size={10} /> {hotel.location}</td>
                          <td className="font-black text-sm text-dark">₹{Number(hotel.price).toLocaleString()}</td>
                          <td className="p-4">
                            <div className="flex justify-end gap-3">
                               {hotel.ownerId === currentUser.uid ? (
                                 <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-[9px] font-black uppercase text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100 italic">
                                       <ShieldCheck size={12} /> Verified
                                    </span>
                                    <Link to={`/partner/hotel/edit/${hotel.id}`} className="btn-action-outline px-3 py-1 bg-white border border-secondary/20 rounded text-[10px] font-bold hover:bg-secondary transition-colors">Digital Edit</Link>
                                    <button onClick={() => handleDeleteProperty(hotel.id, hotel.name)} className="p-1 px-2 text-red-500 hover:bg-red-50 rounded transition-colors" title="De-list Asset"><Trash2 size={14} /></button>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => handleClaimProperty(hotel.id)} 
                                   className="btn btn-primary btn-sm px-4 py-2 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                                   style={{ fontSize: '10px' }}
                                 >
                                   <Award size={14} /> Authenticate & Claim
                                 </button>
                               )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
           </section>
        )}

        {activeTab === 'bookings' && (
          <section className="dashboard-properties mt-5 glass animate-fade-in shadow-xl">
            <div className="section-header px-6 py-4 border-b border-color flex justify-between items-center bg-white bg-opacity-50">
              <div className="flex items-center gap-4">
                 <h2 className="text-lg font-bold">Reservations ({bookings.length})</h2>
                 <div className="filter-pills flex gap-1 bg-secondary/10 p-1 rounded-lg shadow-inner">
                    <button 
                      onClick={() => setBookingFilter('active')}
                      className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${bookingFilter === 'active' ? 'bg-secondary text-primary' : 'hover:bg-secondary/20'}`}
                    >
                      Active
                    </button>
                    <button 
                      onClick={() => setBookingFilter('history')}
                      className={`px-3 py-1 text-[10px] font-black uppercase rounded-md transition-all ${bookingFilter === 'history' ? 'bg-secondary text-primary' : 'hover:bg-secondary/20'}`}
                    >
                      History
                    </button>
                 </div>
              </div>
              <div className="search-box relative" style={{width: '250px'}}>
                <input 
                  type="text" 
                  placeholder="Search guest name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs p-2 pl-8 border border-color rounded-lg bg-white"
                />
                <TrendingUp size={14} className="absolute left-2 top-2.5 opacity-50" />
              </div>
                          <table className="properties-table table-bookings">
                <thead className="bg-secondary opacity-80">
                  <tr>
                    <th className="p-4">Ref ID</th>
                    <th>Guest</th>
                    <th>Property</th>
                    <th>Nights / Party</th>
                    <th>Total</th>
                    <th>System Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings
                    .filter(b => {
                      const matchesSearch = b.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
                      const isCompleted = (b.status || b.bookingStatus) === 'Checked Out';
                      return bookingFilter === 'active' ? (matchesSearch && !isCompleted) : (matchesSearch && isCompleted);
                    })
                    .map(b => {
                      const nights = Math.max(1, Math.ceil((new Date(b.checkOut) - new Date(b.checkIn)) / (1000 * 60 * 60 * 24)));
                      return (
                        <tr key={b.id} className="border-b border-color hover:bg-secondary">
                          <td className="p-4">
                            <span className="text-[10px] font-black bg-secondary/20 px-2 py-1 rounded text-secondary">
                              #{b.id.substring(0, 8).toUpperCase()}
                            </span>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <div className="user-avatar-sm" style={{width: '28px', height: '28px', fontSize: '0.7rem'}}>
                                {b.customerName?.charAt(0) || 'G'}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm">{b.customerName}</span>
                                <span className="text-[10px] text-muted">{b.customerPhone || 'No Phone'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold">{b.hotelName}</span>
                              <span className="text-[10px] text-muted">{b.roomType} Room</span>
                            </div>
                          </td>
                          <td>
                            <div className="flex flex-col">
                               <span className="text-xs font-bold">{nights} Night{nights > 1 ? 's' : ''}</span>
                               <span className="text-[10px] opacity-70">{b.guests} Guests / {b.rooms} Rooms</span>
                            </div>
                          </td>
                          <td><span className="font-black text-sm">₹{Number(b.totalPrice).toLocaleString()}</span></td>
                          <td>
                            <div className="flex flex-col gap-1.5">
                               {/* Booking Status Row */}
                               <div className="flex items-center gap-2">
                                 <span className={`badge-status ${b.bookingStatus?.toLowerCase() || b.status?.toLowerCase() || 'approved'} px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider flex-1 text-center shadow-sm`}>
                                   Stay: {b.bookingStatus || b.status || 'Approved'}
                                 </span>
                                 {(b.bookingStatus === 'Pending' || b.status === 'Pending') && (
                                   <button 
                                     onClick={() => handleStatusUpdate(b.id, 'Approved')}
                                     className="p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                                     title="Approve Reservation"
                                   >
                                     <CheckCircle size={10} />
                                   </button>
                                 )}
                               </div>
    
                               {/* Payment Status Row */}
                               <div className="flex items-center gap-2">
                                 <span className={`badge-payment ${b.paymentStatus?.toLowerCase() || 'pending'} px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider flex-1 text-center shadow-sm`}>
                                   Pay: {b.paymentStatus || 'Pending'}
                                 </span>
                                 {b.paymentStatus === 'Pending' && (
                                   <button 
                                     onClick={() => handlePaymentStatusUpdate(b.id, 'Paid')}
                                     className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                                     title="Mark as Paid"
                                   >
                                     <Database size={10} />
                                   </button>
                                 )}
                               </div>

                               {/* Checkout Action */}
                               {(b.bookingStatus === 'Approved' || b.status === 'Approved') && (
                                  <button
                                     onClick={() => handleCheckOut(b.id)}
                                     className="mt-2 w-full flex items-center justify-center gap-2 p-1.5 bg-secondary text-primary rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-secondary transition-all shadow-md"
                                  >
                                     <DoorOpen size={12} /> Check-out
                                  </button>
                               )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {(bookings.length === 0 || bookings.filter(b => {
                      const matchesSearch = b.customerName?.toLowerCase().includes(searchTerm.toLowerCase());
                      const isCompleted = (b.status || b.bookingStatus) === 'Checked Out';
                      return bookingFilter === 'active' ? (matchesSearch && !isCompleted) : (matchesSearch && isCompleted);
                    }).length === 0) && (
                     <tr><td colSpan="6" className="p-10 text-center text-muted italic">No {bookingFilter} reservations found in your fleet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === 'reviews' && (
          <section className="dashboard-properties mt-5 glass animate-fade-in shadow-xl">
            <div className="section-header px-6 py-4 border-b border-color">
              <h2 className="text-lg font-bold">Guest Feedback Moderation ({allReviews.length})</h2>
            </div>
            <div className="table-responsive">
              <table className="properties-table">
                <thead className="bg-secondary opacity-80"><tr><th className="p-4">Guest</th><th>Rating</th><th>Review</th><th>Action</th></tr></thead>
                <tbody>
                  {allReviews.map(r => (
                    <tr key={r.id} className="border-b border-color hover:bg-secondary">
                      <td className="p-4 font-bold">{r.userName || 'Anonymous'}</td>
                      <td><span className="star-badge">{r.rating} ⭐</span></td>
                      <td className="text-muted text-xs italic" style={{maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                        "{r.comment}"
                      </td>
                      <td>
                        <button onClick={() => handleDeleteReview(r)} className="text-red-500 hover:text-red-700">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {allReviews.length === 0 && (
                     <tr><td colSpan="4" className="p-10 text-center text-muted italic">No guest reviews currently pending moderation.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      <MobileDashboardNav 
        links={mobileLinks} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </div>
  );
};

export default PartnerDashboard;
