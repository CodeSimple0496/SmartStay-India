import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  orderBy, 
  limit, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { 
  Users, 
  Building, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  Loader, 
  ArrowLeft,
  Search,
  MessageSquare,
  LayoutDashboard,
  ShieldAlert,
  Database,
  CreditCard,
  Wallet,
  HandCoins
} from 'lucide-react';
import MobileDashboardNav from '../components/MobileDashboardNav';
import './PartnerDashboard.css'; // Reusing established premium styles
import '../components/MobileDashboardNav.css';

const AdminDashboard = () => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    activeHotels: 0
  });
  const [searchTerm, setSearchTerm] = useState('');

  // ── Protection ──
  useEffect(() => {
    // If not loading and no admin role, redirect
    // We check userData !== null to ensure we've at least tried to fetch the profile
    if (!loading && userData && userData.role !== 'admin') {
      console.log("Access Denied: Not an admin");
      navigate('/');
    } else if (!loading && !userData && currentUser) {
      // If we have a user but no data yet, it might still be loading or failed
      // Usually AuthContext handles this, but we stay safe
    }
  }, [userData, loading, navigate, currentUser]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch Users
      const usersSnap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);

      // 2. Fetch Bookings (All)
      const bookingsSnap = await getDocs(collection(db, 'bookings'));
      const bookingsData = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      bookingsData.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setBookings(bookingsData);

      // 3. Fetch Properties (All)
      const propsSnap = await getDocs(collection(db, 'properties'));
      const propsData = propsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProperties(propsData);

      // 4. Calculate Stats
      const revenue = bookingsData.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
      setStats({
        totalUsers: usersData.length,
        totalBookings: bookingsData.length,
        totalRevenue: revenue,
        activeHotels: propsData.length
      });

    } catch (err) {
      console.error("Admin Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData?.role === 'admin') {
      fetchData();
    }
  }, [userData]);

  const handleUpdateRole = async (userId, newRole) => {
    if (!window.confirm(`Change user role to ${newRole}?`)) return;
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) { alert("Failed to update role."); }
  };

  const handleApproveBooking = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { status: 'Approved', bookingStatus: 'Approved' });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'Approved', bookingStatus: 'Approved' } : b));
    } catch (err) { alert("Failed to approve booking."); }
  };

  const handleVerifyPayment = async (bookingId) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        paymentStatus: 'Paid',
        status: 'Approved',
        bookingStatus: 'Approved'
      });
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, paymentStatus: 'Paid', status: 'Approved', bookingStatus: 'Approved' } : b));
      alert("Payment verified and booking approved!");
    } catch (err) { alert("Failed to verify payment."); }
  };

  const handleApproveAll = async () => {
    if (!window.confirm("Approve all pending reservations? This is perfect for project demonstrations.")) return;
    try {
      setLoading(true);
      const pending = bookings.filter(b => b.status === 'Pending');
      for (const b of pending) {
        await updateDoc(doc(db, 'bookings', b.id), { status: 'Approved', bookingStatus: 'Approved' });
      }
      alert(`SUCCESS: ${pending.length} bookings approved!`);
      fetchData();
    } catch (err) { alert("Failed to approve all."); }
    finally { setLoading(false); }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Permanently delete this user? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) { alert("Failed to delete user."); }
  };

  if (loading) {
    return (
      <div className="dashboard-page flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-secondary mb-4 mx-auto" size={48} />
          <p className="text-sub font-bold">Initializing Admin Command Center...</p>
        </div>
      </div>
    );
  }

  const adminLinks = [
    { id: 'overview', label: 'Monitor', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'Users', icon: <Users size={20} /> },
    { id: 'bookings', label: 'Ledger', icon: <Calendar size={20} /> },
    { id: 'payments', label: 'Finances', icon: <Wallet size={20} /> },
    { id: 'inventory', label: 'Assets', icon: <Building size={20} /> }
  ];

  return (
    <div className="dashboard-page overflow-hidden">
      <aside className="dashboard-sidebar">
        <div className="sidebar-logo">
          <h2>Smart<span>Admin</span></h2>
        </div>
        <nav className="sidebar-nav">
          <button onClick={() => setActiveTab('overview')} className={`nav-item-btn ${activeTab === 'overview' ? 'active' : ''}`}><LayoutDashboard size={18}/> Overview</button>
          <button onClick={() => setActiveTab('users')} className={`nav-item-btn ${activeTab === 'users' ? 'active' : ''}`}><Users size={18}/> User Manager</button>
          <button onClick={() => setActiveTab('bookings')} className={`nav-item-btn ${activeTab === 'bookings' ? 'active' : ''}`}><Calendar size={18}/> Master Ledger</button>
          <button onClick={() => setActiveTab('payments')} className={`nav-item-btn ${activeTab === 'payments' ? 'active' : ''}`}><CreditCard size={18}/> Financial Hub</button>
          <button onClick={() => setActiveTab('inventory')} className={`nav-item-btn ${activeTab === 'inventory' ? 'active' : ''}`}><Building size={18}/> Properties</button>
          <div className="nav-divider" />
          <Link to="/partner/dashboard" className="nav-item-btn"><ShieldCheck size={18}/> Partner Portal</Link>
          <Link to="/" className="nav-item-btn"><ArrowLeft size={18}/> Back to Site</Link>
        </nav>
      </aside>

      <main className="dashboard-content">
        <header className="dashboard-header glass shadow-lg">
          <div>
            <h1 className="text-2xl font-black text-accent tracking-tighter uppercase">Admin Database System</h1>
            <p className="text-sub text-sm">System-wide control & Data integrity</p>
          </div>
          <div className="header-actions">
             <button onClick={handleApproveAll} className="btn btn-primary px-4 py-2 text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
                <CheckCircle size={14} /> Quick Approve All
             </button>
             <div className="flex items-center gap-2 bg-secondary/20 px-4 py-2 rounded-full">
                <ShieldCheck size={16} className="text-secondary" />
                <span className="text-xs font-bold uppercase tracking-widest">{userData?.firstName} (Root Admin)</span>
             </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <section className="dashboard-stats grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
               <div className="stat-card glass hover:scale-105 transition-transform cursor-default">
                  <p className="text-muted text-xs uppercase font-bold mb-1">Total System Revenue</p>
                  <h3 className="text-2xl">₹{stats.totalRevenue.toLocaleString()}</h3>
                  <div className="w-full h-1 bg-secondary/20 mt-4 rounded-full overflow-hidden"><div className="h-full bg-secondary" style={{width: '65%'}} /></div>
               </div>
               <div className="stat-card glass hover:scale-105 transition-transform cursor-default">
                  <p className="text-muted text-xs uppercase font-bold mb-1">Platform Users</p>
                  <h3 className="text-2xl">{stats.totalUsers}</h3>
                  <Users size={16} className="absolute right-4 top-4 opacity-10" />
               </div>
               <div className="stat-card glass hover:scale-105 transition-transform cursor-default">
                  <p className="text-muted text-xs uppercase font-bold mb-1">Site Bookings</p>
                  <h3 className="text-2xl">{stats.totalBookings}</h3>
                  <Calendar size={16} className="absolute right-4 top-4 opacity-10" />
               </div>
               <div className="stat-card glass hover:scale-105 transition-transform cursor-default">
                  <p className="text-muted text-xs uppercase font-bold mb-1">Listed Hotels</p>
                  <h3 className="text-2xl">{stats.activeHotels}</h3>
                  <Building size={16} className="absolute right-4 top-4 opacity-10" />
               </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="glass p-6 rounded-[32px] shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-accent)' }}><Database size={20} /> Recent System Activity</h3>
                  <div className="activity-list space-y-4">
                     {bookings.slice(0, 5).map(b => (
                        <div key={b.id} className="flex justify-between items-center p-3 hover:bg-secondary/10 rounded-xl transition-colors">
                           <div>
                              <p className="text-sm font-bold">{b.customerName}</p>
                              <p className="text-[10px] text-muted">{b.hotelName}</p>
                           </div>
                           <span className={`text-[9px] font-bold px-2 py-1 rounded-full ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {b.status || 'Pending'}
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="glass p-6 rounded-[32px] shadow-xl">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-accent)' }}><Users size={20} /> New Registrations</h3>
                  <div className="user-stack flex -space-x-3 mb-6">
                     {users.slice(0, 8).map(u => (
                        <div key={u.id} className="w-10 h-10 rounded-full border-4 border-surface bg-secondary flex items-center justify-center text-xs font-bold text-secondary shadow-lg" title={u.email}>
                           {u.firstName?.[0] || 'U'}
                        </div>
                     ))}
                  </div>
                  <button onClick={() => setActiveTab('users')} className="btn btn-outline w-100 py-3 rounded-xl font-bold text-xs">Manage All {users.length} Users</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <section className="glass rounded-[32px] overflow-hidden shadow-2xl animate-fade-in">
             <div className="p-6 border-b border-color flex justify-between items-center">
                <h2 className="text-xl font-black">User Directory</h2>
                <div className="search-bar relative">
                   <Search size={16} className="absolute left-3 top-2.5 opacity-30" />
                   <input 
                    type="text" 
                    placeholder="Search by email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-full text-xs focus:ring-2 ring-secondary outline-none bg-surface color-main"
                    style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-main)', borderColor: 'var(--border-sub)' }}
                   />
                </div>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-secondary/30 text-[10px] uppercase font-black tracking-widest text-muted">
                      <tr>
                         <th className="p-6">User Profile</th>
                         <th>Current Role</th>
                         <th>System Actions</th>
                      </tr>
                   </thead>
                   <tbody>
                      {users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                        <tr key={user.id} className="border-b border-secondary/10 hover:bg-secondary/5 transition-colors">
                           <td className="p-6">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center font-bold text-secondary">
                                    {user.firstName?.[0] || user.email[0]}
                                 </div>
                                 <div>
                                    <p className="font-bold text-sm">{user.firstName} {user.lastName}</p>
                                    <p className="text-[10px] text-muted">{user.email}</p>
                                 </div>
                              </div>
                           </td>
                           <td>
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : user.role === 'partner' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                 {user.role}
                              </span>
                           </td>
                           <td className="p-6">
                              <div className="flex gap-2">
                                 <button onClick={() => handleUpdateRole(user.id, 'admin')} className="p-2 hover:bg-purple-50 rounded-lg text-purple-600 transition-all" title="Promote to Admin"><ShieldCheck size={18}/></button>
                                 <button onClick={() => handleUpdateRole(user.id, 'partner')} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-all" title="Set as Partner"><UserPlus size={18}/></button>
                                 <button onClick={() => handleDeleteUser(user.id)} className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-all" title="Delete User"><ShieldAlert size={18}/></button>
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
          <section className="glass rounded-[32px] overflow-hidden shadow-2xl animate-fade-in">
             <div className="p-6 border-b border-color flex justify-between items-center">
                <h2 className="text-xl font-black">Master Booking Ledger</h2>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-bookings">
                    <thead className="bg-secondary/30 text-[10px] uppercase font-black tracking-widest text-muted">
                       <tr>
                          <th className="p-6">Ref ID</th>
                          <th>Guest</th>
                          <th>Property</th>
                          <th>Stay Info</th>
                          <th>Value</th>
                          <th>Action</th>
                       </tr>
                    </thead>
                    <tbody>
                       {bookings.map(book => {
                         const nights = Math.max(1, Math.ceil((new Date(book.checkOut) - new Date(book.checkIn)) / (1000 * 60 * 60 * 24)));
                         return (
                           <tr key={book.id} className="border-b border-secondary/10 hover:bg-secondary/5 transition-colors">
                              <td className="p-6">
                                 <span className="text-[10px] font-black bg-secondary/10 px-2 py-1 rounded text-secondary">
                                   #{book.id.substring(0, 8).toUpperCase()}
                                 </span>
                              </td>
                              <td>
                                 <div className="flex flex-col">
                                    <p className="font-bold text-sm">{book.customerName}</p>
                                    <p className="text-[9px] text-muted">{book.customerEmail || 'No Email'}</p>
                                    <p className="text-[9px] font-bold text-secondary">{book.customerPhone || ''}</p>
                                 </div>
                              </td>
                              <td>
                                 <div className="flex flex-col">
                                    <p className="text-xs font-semibold">{book.hotelName}</p>
                                    <div className="flex gap-1">
                                       <span className="text-[8px] bg-secondary/20 px-1 rounded">{book.roomType}</span>
                                       <span className="text-[8px] bg-secondary/20 px-1 rounded">{book.rooms} Rooms</span>
                                    </div>
                                 </div>
                              </td>
                              <td>
                                 <div className="flex flex-col">
                                    <p className="text-[10px] font-bold">{book.checkIn} ➔ {book.checkOut}</p>
                                    <p className="text-[9px] text-muted">{nights} Nights / {book.guests} Guests</p>
                                    <div className={`mt-1 inline-block text-center px-2 py-0.5 rounded text-[8px] font-black uppercase ${book.status === 'Checked Out' ? 'bg-blue-100 text-blue-700' : book.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                       {book.status === 'Checked Out' ? 'Stay Completed' : (book.status || 'Pending')}
                                    </div>
                                 </div>
                              </td>
                              <td><p className="text-sm font-black">₹{Number(book.totalPrice).toLocaleString()}</p></td>
                              <td className="p-6">
                                 {book.status !== 'Approved' && (
                                    <button 
                                      onClick={() => handleApproveBooking(book.id)} 
                                      className="btn btn-primary btn-sm px-4 py-2 flex items-center gap-2 shadow-md hover:shadow-primary/20"
                                      style={{ fontSize: '10px' }}
                                    >
                                       <CheckCircle size={14} /> Approve 
                                    </button>
                                 )}
                              </td>
                           </tr>
                         );
                       })}
                    </tbody>
                 </table>
             </div>
          </section>
        )}

        {activeTab === 'inventory' && (
          <section className="glass rounded-[32px] overflow-hidden shadow-2xl animate-fade-in">
             <div className="p-6 border-b border-color">
                <h2 className="text-xl font-black">Global Property Moderation</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {properties.map(hotel => (
                  <div key={hotel.id} className="glass p-4 rounded-2xl hover:scale-[1.02] transition-transform">
                     <div className="w-full h-32 rounded-xl bg-secondary/20 mb-4 overflow-hidden relative">
                        {hotel.images?.[0] && <img src={hotel.images[0]} alt="" className="w-full h-full object-cover" />}
                        <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-md px-2 py-1 rounded-full text-[9px] font-bold">
                           ⭐ {hotel.rating}
                        </div>
                     </div>
                     <h4 className="font-bold text-sm mb-1">{hotel.name}</h4>
                     <p className="text-[10px] text-muted mb-4">{hotel.location}</p>
                     <div className="flex justify-between items-center">
                        <span className="text-xs font-black">₹{hotel.price}</span>
                        <div className="flex gap-2">
                           <button className="p-2 bg-secondary/20 rounded-lg text-secondary hover:bg-secondary/40"><Search size={14} /></button>
                           <button onClick={() => { if(window.confirm("Delete property?")) deleteDoc(doc(db, 'properties', hotel.id)).then(() => fetchData()) }} className="p-2 bg-red-50 rounded-lg text-red-600 hover:bg-red-100"><XCircle size={14} /></button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}
        {activeTab === 'payments' && (
          <div className="animate-fade-in space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="stat-card glass border-l-4 border-green-500">
                  <p className="text-muted text-[10px] uppercase font-black mb-1">Cleared Revenue</p>
                  <h3 className="text-2xl font-black text-green-600">₹{bookings.filter(b => b.paymentStatus === 'Paid').reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0).toLocaleString()}</h3>
                  <p className="text-[10px] text-muted mt-1 italic">Successfully processed & verified</p>
               </div>
               <div className="stat-card glass border-l-4 border-yellow-500">
                  <p className="text-muted text-[10px] uppercase font-black mb-1">Awaiting Clearance</p>
                  <h3 className="text-2xl font-black text-yellow-600">₹{bookings.filter(b => b.paymentStatus === 'Pending').reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0).toLocaleString()}</h3>
                  <p className="text-[10px] text-muted mt-1 italic">Pending verification or cash collection</p>
               </div>
               <div className="stat-card glass bg-primary text-white">
                  <p className="text-white/50 text-[10px] uppercase font-black mb-1">Gross Pipeline</p>
                  <h3 className="text-2xl font-black text-secondary">₹{stats.totalRevenue.toLocaleString()}</h3>
                  <TrendingUp size={16} className="absolute right-4 top-4 text-secondary/30" />
               </div>
            </section>

            <section className="glass rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-color flex justify-between items-center bg-white/50">
                 <h2 className="text-xl font-black uppercase tracking-tighter">Global Payment Ledger</h2>
                 <div className="flex gap-2">
                    <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                       <CreditCard size={10} /> Card
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 px-3 py-1 rounded-full border border-purple-100">
                       <Wallet size={10} /> UPI
                    </div>
                    <div className="flex items-center gap-1 text-[10px] bg-orange-50 text-orange-700 px-3 py-1 rounded-full border border-orange-100">
                       <HandCoins size={10} /> Cash
                    </div>
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse table-bookings">
                    <thead className="bg-secondary/30 text-[10px] uppercase font-black tracking-widest text-muted">
                       <tr>
                          <th className="p-6">Ref ID</th>
                          <th>Customer</th>
                          <th>Method</th>
                          <th>Amount</th>
                          <th>System Status</th>
                          <th>Action</th>
                       </tr>
                    </thead>
                    <tbody>
                       {bookings.map(book => (
                         <tr key={book.id} className="border-b border-secondary/10 hover:bg-secondary/5 transition-colors">
                            <td className="p-6">
                               <span className="text-[10px] font-black bg-secondary/10 px-2 py-1 rounded text-secondary">
                                 #{book.id.substring(0, 8).toUpperCase()}
                               </span>
                            </td>
                            <td>
                               <div className="flex flex-col">
                                  <p className="font-bold text-sm">{book.customerName}</p>
                                  <p className="text-[9px] text-muted italic">via {book.hotelName}</p>
                               </div>
                            </td>
                            <td>
                               <div className="flex items-center gap-2">
                                  {book.paymentMethod === 'UPI' ? (
                                     <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-purple-50 text-purple-700 text-[9px] font-black uppercase border border-purple-100 shadow-sm">
                                        <Wallet size={12}/> UPI
                                     </span>
                                  ) : book.paymentMethod === 'Cash' ? (
                                     <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-orange-50 text-orange-700 text-[9px] font-black uppercase border border-orange-100 shadow-sm">
                                        <HandCoins size={12}/> Cash
                                     </span>
                                  ) : (
                                     <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-blue-700 text-[9px] font-black uppercase border border-blue-100 shadow-sm">
                                        <CreditCard size={12}/> {book.paymentMethod || 'Card'}
                                     </span>
                                  )}
                               </div>
                            </td>
                            <td><p className="text-sm font-black">₹{Number(book.totalPrice).toLocaleString()}</p></td>
                            <td>
                               <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border ${book.paymentStatus === 'Paid' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-yellow-50 text-yellow-700 border-yellow-100'}`}>
                                  {book.paymentStatus || 'Pending'}
                               </span>
                            </td>
                            <td className="p-6">
                               {book.paymentStatus !== 'Paid' && (
                                  <button 
                                    onClick={() => handleVerifyPayment(book.id)} 
                                    className="btn btn-primary btn-sm px-4 py-2 flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                                    style={{ fontSize: '10px' }}
                                  >
                                     <Database size={14} /> Verify & Approve
                                  </button>
                                )}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            </section>
          </div>
        )}
      </main>

      <MobileDashboardNav 
        links={adminLinks} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />
    </div>
  );
};

export default AdminDashboard;
