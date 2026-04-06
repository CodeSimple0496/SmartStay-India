import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, CreditCard, Lock, Calendar, Loader, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { sendBookingEmail } from '../services/email';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';
import './Checkout.css';

const Checkout = () => {
  const { state } = useLocation();
  const { hotel, booking } = state || {};
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pointsEarned, setPointsEarned] = useState(0);
  const [phoneError, setPhoneError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const receiptRef = useRef(null);
  const { updateLoyaltyPoints } = useAuth();

  // Helper to parse guest count (handles "2 guests" string or number)
  const parseGuestCount = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const match = val.match(/\d+/);
      return match ? parseInt(match[0]) : 1;
    }
    return 1;
  };

  const initialGuestCount = parseGuestCount(booking?.guests);

  // Form states (Pre-filled from Auth if available)
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: currentUser?.email || '',
    phone: userData?.phone || '',
    age: '',
    gender: 'Male',
    idProofName: '',
    roomType: booking?.roomType || 'Standard',
    rooms: booking?.rooms || 1,
    guests: initialGuestCount,
    checkIn: booking?.checkIn || '',
    checkOut: booking?.checkOut || '',
    guestsList: [],
    paymentMethod: 'Card', // Default
    upiVpa: '',
    upiScreenshotName: ''
  });

  // Initialize guests list based on guest count
  useEffect(() => {
    const count = parseInt(formData.guests);
    if (count > 1) {
      const list = [];
      for (let i = 1; i < count; i++) {
        list.push({ name: '', age: '', gender: 'Male', idProofName: '' });
      }
      setFormData(prev => ({ ...prev, guestsList: list }));
    } else {
      setFormData(prev => ({ ...prev, guestsList: [] }));
    }
  }, [formData.guests]);

  // Redirect if no hotel data (manual navigation to /checkout)
  useEffect(() => {
    if (!hotel) {
      navigate('/search');
    }
  }, [hotel, navigate]);

  const calculateNights = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights(formData.checkIn, formData.checkOut);
  const roomCount = Number(formData.rooms);
  const multiplier = formData.roomType === 'Suite' || formData.roomType === 'AC' ? 1.5 : 1.0;
  const basePrice = Number(hotel.price) * multiplier;
  
  const subtotal = basePrice * nights * roomCount;
  const taxes = Math.floor(subtotal * 0.12); // 12% GST/Taxes
  const total = subtotal + taxes + 2500; // Including cleaning fee

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      setError('Please log in to complete your booking.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const status = formData.paymentMethod === 'Card' ? 'Confirmed' : 'Pending';

      const bookingData = {
        userId: currentUser.uid,
        hotelId: hotel.id,
        hotelName: hotel.name,
        hotelImage: hotel.images[0],
        location: hotel.location,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: formData.guests,
        rooms: formData.rooms,
        roomType: formData.roomType,
        totalPrice: total,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAge: formData.age,
        customerGender: formData.gender,
        idProofName: formData.idProofName,
        upiScreenshotName: formData.upiScreenshotName,
        additionalGuests: formData.guestsList,
        paymentMethod: formData.paymentMethod,
        bookingStatus: formData.paymentMethod === 'Card' ? 'Approved' : 'Pending',
        paymentStatus: formData.paymentMethod === 'Card' ? 'Paid' : 'Pending',
        status: formData.paymentMethod === 'Card' ? 'Approved' : 'Pending', // Backward compatibility
        createdAt: serverTimestamp()
      };

      // 1. Save booking to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      setBookingId(docRef.id);

      // 2. Update Loyalty Points (1 point per ₹100)
      const earned = Math.floor(total / 100);
      setPointsEarned(earned);
      if (currentUser) {
        await updateLoyaltyPoints(earned);
      }

      // 3. Trigger Email Notification (Simulated/Real via EmailJS)
      await sendBookingEmail({ ...bookingData, id: docRef.id });

      setStep(2);
      // Wait longer to allow receipt to be viewed
      // setTimeout(() => navigate('/'), 8000); 
    } catch (err) {
      console.error("Booking failed:", err);
      setError('Transaction could not be completed at this time.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    try {
      setLoading(true);
      
      // Capture the receipt element, excluding all elements with the 'no-print' class.
      const dataUrl = await toPng(receiptRef.current, { 
        quality: 1, 
        pixelRatio: 4, // 4x scaling for high-resolution print quality
        backgroundColor: '#ffffff',
        style: {
          transform: 'none',
          boxShadow: 'none',
          borderRadius: '0',
          margin: '0',
          padding: '2.5rem' // Ensure consistent padding inside the capture
        },
        filter: (node) => {
          // Explicitly exclude any nodes having 'no-print' or being children of 'no-print'
          if (node.classList && node.classList.contains('no-print')) return false;
          return true;
        }
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(dataUrl);
      
      // Target a safe width with 15mm margins on each side
      const targetWidth = pdfWidth - 30; 
      const targetHeight = (imgProps.height * targetWidth) / imgProps.width;
      
      // Final scaling check to ensure it doesn't overflow vertically
      let finalWidth = targetWidth;
      let finalHeight = targetHeight;
      if (finalHeight > (pdfHeight - 40)) { // Ensuring 20mm margin top/bottom
        finalHeight = pdfHeight - 40;
        finalWidth = (imgProps.width * finalHeight) / imgProps.height;
      }

      // Calculate centering offsets
      const xOffset = (pdfWidth - finalWidth) / 2;
      const yOffset = 20;

      pdf.addImage(dataUrl, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
      pdf.save(`SmartStay-Booking-Receipt-${bookingId.substring(0, 8).toUpperCase()}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Professional PDF generation failed. Opening standard print window.");
      window.print();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const clean = value.replace(/[^\d+-\s()]/g, '');
      if (value !== clean) {
        setPhoneError('⚠️ Please enter numeric digits only');
        setTimeout(() => setPhoneError(''), 3000);
      }
      setFormData({ ...formData, [name]: clean });
    } else if (name === 'idProof' || name === 'upiScreenshot') {
      const file = e.target.files[0];
      if (file) {
        const fieldName = name === 'idProof' ? 'idProofName' : 'upiScreenshotName';
        setFormData({ ...formData, [fieldName]: file.name });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleGuestChange = (index, field, value) => {
    const updatedList = [...formData.guestsList];
    updatedList[index][field] = value;
    setFormData({ ...formData, guestsList: updatedList });
  };

  const handleGuestFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const updatedList = [...formData.guestsList];
      updatedList[index].idProofName = file.name;
      setFormData({ ...formData, guestsList: updatedList });
    }
  };
   
  if (!hotel) return null;

  if (step === 2) {
    return (
      <div className="checkout-page success-view">
        <div className="container animate-fade-in no-print">
           <div className="receipt-container glass" ref={receiptRef}>
              <div className="receipt-header">
                <div className="receipt-logo">
                  <h2>Smart<span>Stay</span></h2>
                  <p>Incredible India / Official Receipt</p>
                </div>
                <div className={`receipt-status-stamp ${formData.paymentMethod === 'Card' ? 'confirmed' : 'pending'}`}>
                   {formData.paymentMethod === 'Card' ? 'BOOKING CONFIRMED' : 'BOOKING PENDING'}
                </div>
              </div>

              <div className="receipt-body mt-5">
                <div className="receipt-row-main">
                  <div className="receipt-col">
                    <span className="label">Booking Reference</span>
                    <strong className="value">#{bookingId.substring(0, 8).toUpperCase()}</strong>
                  </div>
                  <div className="receipt-col text-right">
                    <span className="label">Date of Issue</span>
                    <strong className="value">{new Date().toLocaleDateString('en-IN')}</strong>
                  </div>
                </div>

                <div className="receipt-divider mt-4"></div>

                <div className="receipt-section mt-4">
                  <h3>Guest Information</h3>
                  <div className="receipt-grid-luxe mt-2">
                    <div className="receipt-item">
                      <span className="label">Lead Guest</span>
                      <strong className="value">{formData.firstName} {formData.lastName}</strong>
                    </div>
                    <div className="receipt-item">
                      <span className="label">Contact</span>
                      <strong className="value">{formData.email}</strong>
                    </div>
                    <div className="receipt-item">
                      <span className="label">Travel Party</span>
                      <strong className="value">{formData.guests} Guest{formData.guests > 1 ? 's' : ''}, {formData.rooms} Room{formData.rooms > 1 ? 's' : ''}</strong>
                    </div>
                    <div className="receipt-item">
                      <span className="label">Method</span>
                      <strong className="value">Paid via {formData.paymentMethod}</strong>
                    </div>
                  </div>
                </div>

                <div className="receipt-section mt-4">
                  <h3>Stay Details</h3>
                  <div className="stay-info-box glass">
                    <h4>{hotel.name}</h4>
                    <p className="text-muted text-sm">{hotel.location}</p>
                    <div className="dates-row mt-3">
                      <div>
                        <span>Check-in</span>
                        <strong>{new Date(formData.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                      <div className="arrow">➔</div>
                      <div>
                        <span>Check-out</span>
                        <strong>{new Date(formData.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="receipt-divider mt-5"></div>

                <div className="receipt-section mt-4">
                  <div className="pricing-table">
                     <div className="p-row">
                       <span>Room Charges ({nights} Night{nights > 1 ? 's' : ''})</span>
                       <span>₹{subtotal.toLocaleString()}</span>
                     </div>
                     <div className="p-row">
                       <span>Service & Cleaning</span>
                       <span>₹2,500</span>
                     </div>
                     <div className="p-row">
                       <span>Taxes (GST 12%)</span>
                       <span>₹{taxes.toLocaleString()}</span>
                     </div>
                     <div className="p-row total-row mt-3 pt-3">
                       <strong>Total Paid via {formData.paymentMethod}</strong>
                       <strong>₹{total.toLocaleString()}</strong>
                     </div>
                  </div>
                </div>
              </div>

              <div className="receipt-footer mt-5 no-print">
                <p className="text-muted text-xs italic">Thank you for choosing SmartStay India. A high-resolution copy of this receipt has been emailed to you.</p>
                <div className="receipt-actions mt-4">
                  <button onClick={handleDownloadPDF} className="btn btn-outline mr-3" disabled={loading}>
                    {loading ? 'Generating...' : 'Download PDF'}
                  </button>
                  <button onClick={() => navigate('/')} className="btn btn-primary" disabled={loading}>
                    Return to Home
                  </button>
                </div>
              </div>
           </div>

           <div className="loyalty-toast glass mt-4 animate-scale-in">
              🏆 Earned <strong>{pointsEarned} SmartStay Points</strong> on this trip!
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-header">
          <Link to={`/hotel/${hotel.id}`} className="back-link">← Back to {hotel.name}</Link>
          <h1>Complete Your Reservation</h1>
        </div>

        {error && (
          <div className="auth-error mt-4 glass" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', borderRadius: '12px', border: '1px solid var(--danger)' }}>
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <div className="checkout-layout mt-5">
          {/* Form Section */}
          <div className="checkout-form-container">
            <form onSubmit={handlePayment}>
              {/* Primary Guest Details */}
              <section className="checkout-section glass">
                <h2>Guest Information</h2>
                {!currentUser && (
                   <p style={{ fontSize: '0.85rem', color: 'var(--danger)', marginBottom: '1.5rem' }}>
                     Tip: Sign in to automatically sync this booking to your account.
                   </p>
                )}
                
                <div className="input-group">
                  <label>Full Name</label>
                  <div className="input-row">
                    <input 
                      type="text" 
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First name" 
                      required 
                      className="half"
                    />
                    <input 
                      type="text" 
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last name" 
                      required 
                      className="half"
                    />
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group half">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com" 
                      required 
                    />
                  </div>
                  <div className="input-group half" style={{ position: 'relative' }}>
                    <label>Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9348296013" 
                      required 
                      style={phoneError ? { borderColor: 'var(--danger)', boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)' } : {}}
                    />
                    {phoneError && (
                      <div className="validation-bubble glass-dark animate-scale-in">
                        {phoneError}
                      </div>
                    )}
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group half">
                    <label>Age</label>
                    <input 
                      type="number" 
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Enter age" 
                      min="18"
                      required 
                    />
                  </div>
                  <div className="input-group half">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="input-group mt-3">
                  <label>ID Proof</label>
                  <div className="file-upload-wrapper glass">
                    <input 
                      type="file" 
                      name="idProof" 
                      onChange={handleChange}
                      id="idProofInput"
                    />
                    <div className="file-display">
                      {formData.idProofName || "No file chosen"}
                    </div>
                  </div>
                </div>
              </section>

              {/* Additional Member Details */}
              {formData.guestsList.length > 0 && (
                <section className="checkout-section glass mt-5 animate-fade-in">
                  <h2>Member Details</h2>
                  {formData.guestsList.map((guest, idx) => (
                    <div key={idx} className="guest-member-row mt-4 pt-4 border-t border-color">
                      <h3>Member {idx + 2}</h3>
                      <div className="input-row">
                        <div className="input-group flex-2">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            placeholder="Enter member name"
                            value={guest.name}
                            onChange={(e) => handleGuestChange(idx, 'name', e.target.value)}
                            required
                          />
                        </div>
                        <div className="input-group half">
                          <label>Age</label>
                          <input 
                            type="number" 
                            placeholder="Age"
                            value={guest.age}
                            onChange={(e) => handleGuestChange(idx, 'age', e.target.value)}
                            required
                          />
                        </div>
                        <div className="input-group half">
                          <label>Gender</label>
                          <select 
                            value={guest.gender}
                            onChange={(e) => handleGuestChange(idx, 'gender', e.target.value)}
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="input-group mt-3">
                        <label>ID Proof (Member {idx + 2})</label>
                        <div className="file-upload-wrapper glass">
                          <input 
                            type="file" 
                            onChange={(e) => handleGuestFileChange(idx, e)}
                            id={`guestIdInput-${idx}`}
                          />
                          <div className="file-display">
                            {guest.idProofName || "No file chosen"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Booking Adjustments */}
              <section className="checkout-section glass mt-5">
                <h2>Booking Adjustments</h2>
                <div className="input-row">
                   <div className="input-group half">
                    <label>Check-in Date</label>
                    <input 
                      type="date" 
                      name="checkIn"
                      value={formData.checkIn}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                  <div className="input-group half">
                    <label>Check-out Date</label>
                    <input 
                      type="date" 
                      name="checkOut"
                      value={formData.checkOut}
                      onChange={handleChange}
                      required 
                    />
                  </div>
                </div>
                <div className="input-row">
                  <div className="input-group half">
                    <label>Room Type</label>
                    <select name="roomType" value={formData.roomType} onChange={handleChange}>
                      <option value="Standard">Standard - Base Price</option>
                      <option value="AC">AC - ₹1500/day extra</option>
                      <option value="Suite">Suite - 1.5x Premium</option>
                    </select>
                  </div>
                  <div className="input-group half">
                    <label>No. of Rooms</label>
                    <input 
                      type="number" 
                      name="rooms"
                      value={formData.rooms}
                      onChange={handleChange}
                      min="1"
                      max="10"
                      required 
                    />
                  </div>
                </div>
              </section>

              {/* Payment Details */}
              <section className="checkout-section glass mt-5">
                <div className="section-title">
                  <h2>Payment Method</h2>
                  <div className="secure-badge">
                    <Lock size={14} /> Secure Selection
                  </div>
                </div>

                <div className="payment-options-grid mt-4">
                  <div 
                    className={`payment-option-card ${formData.paymentMethod === 'Card' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, paymentMethod: 'Card'})}
                  >
                    <div className="option-icon"><CreditCard size={20} /></div>
                    <div className="option-info">
                      <strong>Credit/Debit Card</strong>
                      <p>Instant confirmation</p>
                    </div>
                  </div>

                  <div 
                    className={`payment-option-card ${formData.paymentMethod === 'UPI' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, paymentMethod: 'UPI'})}
                  >
                    <div className="option-icon" style={{ padding: '2px', background: 'var(--text-main)', color: 'var(--bg-main)', borderRadius: '4px', fontSize: '8px', fontWeight: 900 }}>UPI</div>
                    <div className="option-info">
                      <strong>UPI Payment</strong>
                      <p>VPA / PhonePe / GPay</p>
                    </div>
                  </div>

                  <div 
                    className={`payment-option-card ${formData.paymentMethod === 'Cash' ? 'active' : ''}`}
                    onClick={() => setFormData({...formData, paymentMethod: 'Cash'})}
                  >
                    <div className="option-icon"><span>₹</span></div>
                    <div className="option-info">
                      <strong>Cash at Property</strong>
                      <p>Pay during check-in</p>
                    </div>
                  </div>
                </div>
                
                <div className="payment-method-fields mt-5 animate-fade-in">
                  {formData.paymentMethod === 'Card' && (
                    <div className="payment-card-inputs">
                      <div className="input-group">
                        <label>Card Number</label>
                        <input type="text" placeholder="0000 0000 0000 0000" />
                      </div>
                      <div className="input-row mt-3">
                        <div className="input-group half">
                          <label>Expiration</label>
                          <input type="text" placeholder="MM/YY" />
                        </div>
                        <div className="input-group half">
                          <label>CVC</label>
                          <input type="text" placeholder="123" />
                        </div>
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'UPI' && (
                    <div className="payment-upi-inputs text-center">
                       <div className="upi-id-display mb-4 p-3 glass-dark border border-color rounded-xl">
                          <span className="text-xs text-muted block uppercase tracking-widest mb-1">Official Receiver VPA</span>
                          <strong className="text-lg text-accent">aloneboy0084@okhdfcbank</strong>
                       </div>

                       <div className="qr-sim-wrapper glass p-5 inline-block mt-2 relative">
                          <div style={{ padding: '12px', background: 'white', display: 'inline-block', borderRadius: '16px', border: '1px solid var(--border-sub)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=aloneboy0084@okhdfcbank&pn=SmartStay India&am=${total}&cu=INR&tn=Booking at ${hotel.name}`)}`} 
                              alt="UPI QR" 
                              style={{ width: '160px', display: 'block' }} 
                            />
                          </div>
                          <p className="text-xs mt-4 text-muted font-medium">Scan with GPay, PhonePe, or Paytm</p>
                          
                          <a 
                            href={`upi://pay?pa=aloneboy0084@okhdfcbank&pn=SmartStay India&am=${total}&cu=INR&tn=Booking at ${hotel.name}`}
                            className="btn btn-outline w-100 mt-4 no-print sm:hidden"
                            style={{ fontSize: '0.85rem', padding: '0.6rem' }}
                          >
                            Open UPI App to Pay
                          </a>
                       </div>

                       <div className="input-group mt-5 text-left">
                          <label>Upload Transaction Screenshot</label>
                          <div className="file-upload-wrapper glass">
                            <input 
                              type="file" 
                              name="upiScreenshot" 
                              onChange={handleChange}
                              id="upiScreenshotInput"
                            />
                            <div className="file-display">
                              {formData.upiScreenshotName || "No screenshot chosen"}
                            </div>
                          </div>
                          <p className="text-[10px] text-muted mt-2">⚠️ Mandatory for UPI verification</p>
                       </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'Cash' && (
                    <div className="payment-cash-info glass p-4 text-center">
                       <p className="text-muted">You have selected to pay at the property. Please note:</p>
                       <ul className="text-xs text-left mt-3" style={{ listStyle: 'disc', paddingLeft: '20px' }}>
                         <li>A confirmation will be pending until the property owner approves your request.</li>
                         <li>You will pay <strong>₹{total.toLocaleString()}</strong> during check-in.</li>
                         <li>Identity verification is mandatory for pay-at-hotel bookings.</li>
                       </ul>
                    </div>
                  )}
                </div>
              </section>

              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary w-100 mt-5 pay-btn"
                style={{ height: '56px', fontSize: '1.1rem' }}
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <Loader className="animate-spin" size={20} /> Processing...
                  </div>
                ) : (
                  `Confirm & Pay ₹${total.toLocaleString()}`
                )}
              </button>
            </form>
          </div>

          {/* Checkout Summary */}
          <aside className="checkout-summary-container">
            <div className="checkout-summary sticky glass">
              <div className="summary-hotel">
                <div className="summary-img-wrap">
                  <img src={hotel.images[0]} alt={hotel.name} />
                </div>
                <div>
                  <h4>{hotel.name}</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>{hotel.location}</p>
                </div>
              </div>
              
              <div className="summary-details mt-4">
                <div className="detail-item">
                  <Calendar size={18} />
                  <div>
                    <span className="label">Check-in</span>
                    <span className="value">{new Date(formData.checkIn).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="detail-item mt-3">
                  <Calendar size={18} />
                  <div>
                    <span className="label">Checkout</span>
                    <span className="value">{new Date(formData.checkOut).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
                <div className="detail-item mt-3">
                   <div style={{ width: '18px', height: '18px', border: '1.5px solid var(--text-sub)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-sub)' }}>G</div>
                   <div style={{ marginLeft: '12px' }}>
                    <span className="label">Guests</span>
                    <span className="value">{formData.guests}</span>
                  </div>
                </div>
                <div className="detail-item mt-3">
                   <div style={{ width: '18px', height: '18px', border: '1.5px solid var(--text-sub)', borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-sub)' }}>R</div>
                   <div style={{ marginLeft: '12px' }}>
                    <span className="label">Rooms</span>
                    <span className="value">{formData.rooms} × {formData.roomType}</span>
                  </div>
                </div>
              </div>

              <div className="price-breakdown mt-5">
                <h2>Price Details</h2>
                <div className="breakdown-row mt-3">
                  <span>₹{basePrice.toLocaleString()} x {nights} night{nights > 1 ? 's' : ''} x {roomCount} room{roomCount > 1 ? 's' : ''}</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="breakdown-row">
                  <span>Cleaning & Service fee</span>
                  <span>₹2,500</span>
                </div>
                <div className="breakdown-row">
                  <span>Taxes (12% GST)</span>
                  <span>₹{taxes.toLocaleString()}</span>
                </div>
                <div className="breakdown-row total mt-4 pt-4">
                  <span>Total (INR)</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="guarantee-tag mt-4">
                 <Shield size={16} /> Best Price Guarantee
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
