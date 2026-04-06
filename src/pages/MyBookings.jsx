import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Calendar, MapPin, CreditCard, ChevronRight, Loader, LayoutGrid } from 'lucide-react';
import './MyBookings.css';

const MyBookings = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const bookingsRef = collection(db, 'bookings');
        // Fetch by userId only (no composite index needed)
        const q = query(
          bookingsRef, 
          where('userId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Sort client-side for maximum reliability
        data.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        
        setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="my-bookings-page loading-view">
        <Loader className="animate-spin text-primary" size={40} />
        <p>Fetching your luxury stays...</p>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <header className="page-header">
          <h1>My <span>Reservations</span></h1>
          <p className="text-muted">Manage your upcoming and past luxury getaways.</p>
        </header>

        {bookings.length === 0 ? (
          <div className="empty-state glass">
            <LayoutGrid size={64} className="empty-icon" />
            <h2>No Bookings Found</h2>
            <p>You haven't reserved any stays yet. Ready to explore India's finest hotels?</p>
            <Link to="/search" className="btn btn-primary mt-4">Start Exploring</Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => {
              const nights = Math.max(1, Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)));
              return (
                <div key={booking.id} className="booking-card glass animate-fade-in shadow-lg hover:shadow-xl transition-all">
                  <div className="booking-img">
                    <img src={booking.hotelImage} alt={booking.hotelName} />
                    <div className="booking-badges">
                      <span className={`status-badge ${(booking.status || 'approved').toLowerCase().replace(' ', '-')}`}>
                        {booking.status === 'Checked Out' ? 'Stay Completed' : (booking.status || 'Approved')}
                      </span>
                      <span className="id-badge">#{booking.id.substring(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <div className="booking-details">
                    <div className="booking-main flex justify-between items-start">
                      <div>
                        <h3>{booking.hotelName}</h3>
                        <p className="location"><MapPin size={14} /> {booking.location}</p>
                      </div>
                      <div className="stay-tag bg-secondary/10 px-2 py-1 rounded text-[10px] font-bold text-primary">
                        {nights} Night{nights > 1 ? 's' : ''} Stay
                      </div>
                    </div>

                    <div className="booking-specs-grid mt-4 grid grid-cols-2 gap-3 p-3 bg-secondary/5 rounded-2xl">
                       <div className="spec-item">
                          <span className="label block text-[8px] uppercase font-black text-muted mb-1">Guests & Rooms</span>
                          <span className="value text-xs font-bold">{booking.guests} Guest{booking.guests > 1 ? 's' : ''} / {booking.rooms} {booking.roomType}</span>
                       </div>
                       <div className="spec-item text-right">
                          <span className="label block text-[8px] uppercase font-black text-muted mb-1">Payment Method</span>
                          <span className="value text-xs font-bold">via {booking.paymentMethod || 'Card'}</span>
                       </div>
                    </div>

                    <div className="booking-info-row mt-4">
                      <div className="info-item">
                        <Calendar size={16} className="text-secondary" />
                        <div>
                          <span className="label">Check-in</span>
                          <span className="value font-medium text-xs">{new Date(booking.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                      <div className="info-item">
                        <Calendar size={16} className="text-secondary" />
                        <div>
                          <span className="label">Checkout</span>
                          <span className="value font-medium text-xs">{new Date(booking.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="booking-footer mt-5 pt-4 border-t border-secondary/10">
                      <div className="price-info flex items-center gap-2">
                        <CreditCard size={16} className="text-primary" />
                        <span className="text-lg font-black tracking-tighter">₹{Number(booking.totalPrice).toLocaleString()}</span>
                      </div>
                      <Link to={`/hotel/${booking.hotelId}`} className="view-btn flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-secondary hover:text-primary transition-colors">
                        Property <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
