import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Check, Shield, Loader, AlertCircle, ArrowLeft, Send, MessageSquare, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp, 
  orderBy,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { getHotelById } from '../services/api';
import { generateSmartSummary } from '../services/gemini';
import './HotelDetails.css';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, userData, updateWishlist } = useAuth();
  const { convertPrice } = useMarket();
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  // Reviews State
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // AI Concierge State
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Booking states
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests] = useState('2 guests');
  const [rooms, setRooms] = useState(1);
  const [roomType, setRoomType] = useState('Standard');
  
  useEffect(() => {
    const fetchHotelAndReviews = async () => {
      // 1. Fetch Hotel Details (Critical)
      try {
        setLoading(true);
        const data = await getHotelById(id);
        setHotel(data);
        setActiveImage(data.images[0]);

        // SEO Update
        if (data) {
          document.title = `${data.name} | ${data.location} - SmartStay India`;
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute("content", `Experience the ultimate luxury at ${data.name} in ${data.location}. ${data.description?.substring(0, 150)}... Book your stay now with SmartStay India.`);
          }
        }
      } catch (err) {
        setError("We couldn't find details for this property. It might have been moved or archived.");
        console.error("Hotel fetch failed:", err);
      } finally {
        setLoading(false);
      }

      // 1.5. Fetch AI Smart Summary
      try {
        setAiLoading(true);
        // Only run if we actually have a hotel object
        const hotelDoc = await getHotelById(id);
        if (hotelDoc) {
          const summary = await generateSmartSummary(hotelDoc);
          setAiSummary(summary);
        }
      } catch (err) {
        console.error("AI Summary generation failed:", err);
      } finally {
        setAiLoading(false);
      }

      // 2. Fetch Reviews (Non-Critical)
      try {
        setReviewsLoading(true);
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('hotelId', '==', id), orderBy('createdAt', 'desc'));
        const reviewSnap = await getDocs(q);
        const reviewList = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReviews(reviewList);
      } catch (err) {
        console.error("Reviews fetch failed (Check Firebase Indices):", err);
        // We don't set global error here because we still want to show the hotel!
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchHotelAndReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return alert('Please sign in to leave a review.');
    if (!newReview.comment.trim()) return;

    try {
      setSubmitting(true);
      const reviewData = {
        hotelId: id,
        userId: currentUser.uid,
        userName: userData?.firstName ? `${userData.firstName} ${userData.lastName}` : currentUser.email.split('@')[0],
        rating: Number(newReview.rating),
        comment: newReview.comment,
        createdAt: serverTimestamp()
      };

      // 1. Add review to Firestore
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);

      // 2. Update stats on the property
      const hotelRef = doc(db, 'properties', id);
      const newReviewCount = (hotel.reviews || 0) + 1;
      const newRating = ((Number(hotel.rating || 0) * (hotel.reviews || 0)) + Number(newReview.rating)) / newReviewCount;
      
      await updateDoc(hotelRef, {
        reviews: newReviewCount,
        rating: Number(newRating.toFixed(1))
      });

      // 3. Update local state
      setReviews([{ id: docRef.id, ...reviewData, createdAt: new Date() }, ...reviews]);
      setHotel({ ...hotel, reviews: newReviewCount, rating: Number(newRating.toFixed(1)) });
      setNewReview({ rating: 5, comment: '' });
      
      alert('Thank you for your feedback!');
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReserve = () => {
    navigate('/checkout', { 
      state: { 
        hotel, 
        booking: { checkIn, checkOut, guests, rooms, roomType } 
      } 
    });
  };

  const isWishlisted = userData?.wishlist?.includes(id);

  const handleWishlistToggle = async () => {
    if (!currentUser) return alert("Sign in to save properties!");
    
    const newWishlist = isWishlisted
      ? userData.wishlist.filter(item => item !== id)
      : [...(userData.wishlist || []), id];
    
    await updateWishlist(newWishlist);
  };

  if (loading) {
    return (
      <div className="hotel-details-page py-5 flex items-center justify-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader className="animate-spin text-primary" size={48} />
        <p className="mt-4 text-muted">Opening your luxury stay...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="hotel-details-page container py-5 text-center">
        <div className="glass p-5" style={{ maxWidth: '500px', margin: '4rem auto', borderRadius: '20px' }}>
          <AlertCircle size={48} color="#c62828" style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ color: 'var(--primary)' }}>Property Not Found</h2>
          <p className="text-muted mt-3">{error}</p>
          <Link to="/search" className="btn btn-primary mt-4 inline-flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const hotelSchema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": hotel.name,
    "description": hotel.description,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": hotel.location,
      "addressCountry": "IN"
    },
    "image": hotel.images,
    "starRating": {
      "@type": "Rating",
      "ratingValue": hotel.rating
    },
    "priceRange": `INR ${hotel.price} - ${hotel.price * 1.5}`
  };

  return (
    <div className="hotel-details-page">
      <script type="application/ld+json">
        {JSON.stringify(hotelSchema)}
      </script>
      <div className="container">
        {/* Header Breadcrumbs / Meta */}
        <div className="details-header pt-6 animate-fade-in">
          <div className="header-meta">
            <div className="title-row flex items-center justify-between w-full">
              <h1>{hotel.name}</h1>
              <button 
                className={`details-wishlist-btn ${isWishlisted ? 'active' : ''}`}
                onClick={handleWishlistToggle}
                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
              >
                <Heart size={24} fill={isWishlisted ? "var(--secondary)" : "none"} />
              </button>
            </div>
            <div className="meta-stats">
              <span className="rating-badge">
                <Star size={16} fill="white" /> {hotel.rating}
              </span>
              <span className="reviews">({hotel.reviews} reviews)</span>
              <span className="location"><MapPin size={16}/> {hotel.location}</span>
            </div>
          </div>
        </div>

        {/* Gallery Section */}
        <div className="gallery-section animate-fade-in">
          <div className="main-image">
            <img 
              src={activeImage} 
              alt="Hotel View" 
              onError={(e) => {
                // If main image fails, fallback to first available or brand placeholder
                e.target.src = hotel.images[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop';
              }} 
            />
          </div>
          <div className="thumbnail-track">
            {hotel.images.map((img, i) => (
              <div 
                key={i} 
                className={`thumbnail ${activeImage === img ? 'active' : ''}`}
                onClick={() => setActiveImage(img)}
              >
                <img 
                  src={img} 
                  alt={`Thumbnail ${i}`} 
                  onError={(e) => {
                    // Hide broken thumbnails to maintain visual perfection
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="content-layout mt-5">
          <div className="main-content">
            <section className="about-section">
              <h2>About this extraordinary stay</h2>
              <p>{hotel.description || "Experience unparalleled luxury in the heart of the city."}</p>
            </section>

            {/* AI CONCIERGE HIGHLIGHT */}
            <div className="ai-concierge-card mt-5 animate-fade-in">
              <div className="ai-badge">
                <Shield size={14} fill="currentColor" />
                <span>Gemini AI Concierge</span>
              </div>
              <div className="ai-content">
                {aiLoading ? (
                  <div className="ai-skeleton">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line w-3/4"></div>
                  </div>
                ) : (
                  <p className="ai-summary">
                    “{aiSummary || "Analysing your luxury stay for personalized highlights..."}”
                  </p>
                )}
              </div>
              <div className="ai-footer">
                <span>Personalized Stay Highlight • Verified Market Data</span>
              </div>
            </div>

            <section className="amenities-section mt-5">
              <h2>What this place offers</h2>
              <div className="amenities-grid">
                {hotel.amenities?.map(amenity => (
                  <div key={amenity} className="amenity-item">
                    <Check size={20} className="text-secondary" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Reviews Section */}
            <section className="reviews-section mt-5 pt-5 border-top">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare size={24} className="text-primary" />
                <h2>Guest Reviews</h2>
              </div>

              {/* Review Input */}
              {currentUser ? (
                <div className="write-review-card glass p-4 mb-5">
                  <h3>Share your experience</h3>
                  <form onSubmit={handleReviewSubmit}>
                    <div className="rating-input mt-3">
                      <span>Rating:</span>
                      <div className="star-selector">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star} 
                            size={20} 
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className={`cursor-pointer ${newReview.rating >= star ? 'text-secondary' : 'text-gray-300'}`}
                            fill={newReview.rating >= star ? 'var(--secondary)' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                    <textarea 
                      className="form-control mt-3" 
                      placeholder="Tell other travelers what you loved about this stay..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      required
                    />
                    <button type="submit" className="btn btn-secondary mt-3" disabled={submitting}>
                      {submitting ? 'Posting...' : <><Send size={16} /> Post Review</>}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="login-to-review glass p-4 mb-5 text-center">
                   <p>Want to share your stay experience? <Link to="/login" className="text-secondary font-bold">Sign in</Link> to post a review.</p>
                </div>
              )}

              {/* Review List */}
              <div className="review-list">
                {reviewsLoading ? (
                  <p>Loading feedback...</p>
                ) : reviews.length === 0 ? (
                  <p className="text-muted italic">No reviews yet. Be the first to share your experience!</p>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="review-card mb-4 pb-4 border-bottom">
                      <div className="review-header">
                        <div className="user-info">
                          <div className="user-avatar-sm">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="user-details">
                            <span className="user-name">{review.userName}</span>
                            <span className="review-date">
                              {review.createdAt?.seconds 
                                ? new Date(review.createdAt.seconds * 1000).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
                                : 'Just now'}
                            </span>
                          </div>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} size={14} fill={i < review.rating ? 'var(--secondary)' : 'none'} className={i < review.rating ? 'text-secondary' : 'text-gray-300'} />
                          ))}
                        </div>
                      </div>
                      <p className="review-text mt-3">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Booking Widget */}
          <aside className="booking-widget-container">
            <div className="booking-widget glass">
              <div className="widget-header">
                <div className="price-display">
                  <h3>{convertPrice(hotel.price)}</h3>
                  <span>/ night</span>
                </div>
              </div>
              
              <div className="booking-form mt-4">
                <div className="date-picker-group">
                  <div className="input-half">
                    <label>Check-in</label>
                    <input 
                      type="date" 
                      value={checkIn} 
                      onChange={(e) => setCheckIn(e.target.value)} 
                      min={today}
                    />
                  </div>
                  <div className="input-half">
                    <label>Checkout</label>
                    <input 
                      type="date" 
                      value={checkOut} 
                      onChange={(e) => setCheckOut(e.target.value)} 
                      min={checkIn || today}
                    />
                  </div>
                </div>
                
                <div className="guests-select mt-3">
                  <label>Guests</label>
                  <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                    <option>1 guest</option>
                    <option>2 guests</option>
                    <option>3 guests</option>
                    <option>4 guests</option>
                  </select>
                </div>

                <div className="rooms-select mt-3 flex gap-2">
                  <div className="w-1/2">
                    <label>Rooms</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={rooms} 
                      onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                      className="form-control"
                    />
                  </div>
                  <div className="w-1/2">
                    <label>Type</label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                      <option value="Standard">Standard</option>
                      <option value="Suite">Luxury Suite (+50%)</option>
                    </select>
                  </div>
                </div>

                <button onClick={handleReserve} className="btn btn-primary w-100 mt-4 book-btn">
                  Reserve stay
                </button>
                
                <p className="no-charge-text text-center mt-3 text-sm text-muted">
                  <Shield size={14} className="inline mr-1" />
                  Best Price Guarantee
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default HotelDetails;
