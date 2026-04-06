import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Calendar, Users, Search, Star, Quote, Plus, Minus, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, limit, getDocs, orderBy } from 'firebase/firestore';
import { ELITE_CITIES } from '../utils/cities';
import './Home.css';

const HERO_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=2070&auto=format&fit=crop',
    landmark: 'Amber Fort',
    area: 'Devisinghpura, Amer',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302 001',
    country: 'India',
    tagline: 'Royal Forts & Desert Sunsets'
  },
  {
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=2074&auto=format&fit=crop',
    landmark: 'Calangute Beach',
    area: 'Baga-Calangute Road',
    city: 'North Goa',
    state: 'Goa',
    pincode: '403 516',
    country: 'India',
    tagline: 'Tropical Palms & Ocean Views'
  },
  {
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=2070&auto=format&fit=crop',
    landmark: 'Vembanad Lake',
    area: 'Punnamada, Alappuzha',
    city: 'Alleppey',
    state: 'Kerala',
    pincode: '688 013',
    country: 'India',
    tagline: 'Tranquil Backwaters & Lush Greenery'
  },
  {
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=2070&auto=format&fit=crop',
    landmark: 'Lake Pichola',
    area: 'Old City, Gangaur Ghat Marg',
    city: 'Udaipur',
    state: 'Rajasthan',
    pincode: '313 001',
    country: 'India',
    tagline: 'City of Lakes & Marble Palaces'
  },
  {
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=2071&auto=format&fit=crop',
    landmark: 'Taj Mahal',
    area: 'Dharmapuri, Forest Colony, Tajganj',
    city: 'Agra',
    state: 'Uttar Pradesh',
    pincode: '282 001',
    country: 'India',
    tagline: 'Iconic Monuments & Mughal Heritage'
  },
  {
    image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=2070&auto=format&fit=crop',
    landmark: 'Dashashwamedh Ghat',
    area: 'Ghats of Ganga, Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    pincode: '221 001',
    country: 'India',
    tagline: 'Sacred Ghats & Ancient Spirituality'
  },
  {
    image: 'https://images.unsplash.com/photo-1567157577867-05ccb1388e66?q=80&w=2069&auto=format&fit=crop',
    landmark: 'Gateway of India',
    area: 'Apollo Bandar, Colaba',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400 001',
    country: 'India',
    tagline: 'City of Dreams & Gateway to India'
  },
  {
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=2070&auto=format&fit=crop',
    landmark: 'Solang Valley',
    area: 'Kullu-Manali Highway, NH-3',
    city: 'Manali',
    state: 'Himachal Pradesh',
    pincode: '175 131',
    country: 'India',
    tagline: 'Snow-Capped Peaks & Alpine Meadows'
  },
  {
    image: '/Gemini_Generated_Image_kcihexkcihexkcih.png',
    landmark: 'Golden Temple',
    area: 'Golden Temple Rd, Atta Mandi',
    city: 'Amritsar',
    state: 'Punjab',
    pincode: '143 006',
    country: 'India',
    tagline: 'Spiritual Serenity & Heritage'
  },
  {
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=2070&auto=format&fit=crop',
    landmark: 'Tea Estates',
    area: 'Kannan Devan Hills, Idukki',
    city: 'Munnar',
    state: 'Kerala',
    pincode: '685 612',
    country: 'India',
    tagline: 'Misty Mountains & Emerald Plantations'
  }
];

const FAQS = [
  {
    q: 'How do I book a hotel on SmartStay India?',
    a: 'Simply search your destination and dates on the Home page, browse the results, click "View Details" on any property, and click "Reserve". Fill in your guest details and confirm payment — your booking confirmation is sent instantly to your email and phone.'
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept all major Credit and Debit cards (Visa, Mastercard, RuPay), UPI payments (GPay, PhonePe, Paytm), Net Banking, and EMI options through popular Indian banks. All transactions are fully encrypted and secure.'
  },
  {
    q: 'Can I cancel or change my booking after confirmation?',
    a: 'Yes. Most bookings can be cancelled free of charge up to 48 hours before the check-in date for a full refund. For modifications (extending stay, changing dates), visit the "My Bookings" section in your account. Cancellation policies differ slightly per property and are shown clearly on every booking page before you pay.'
  },
  {
    q: 'How long does it take to get a refund?',
    a: 'Refunds for eligible cancellations are processed within 5–7 working days and credited back to your original payment method. For UPI and wallet payments, refunds typically arrive within 1–2 business days. You will receive an email notification as soon as the refund is initiated.'
  },
  {
    q: 'Is my personal and payment information safe?',
    a: 'Absolutely. SmartStay India is secured with 256-bit SSL encryption. We do not store your card details on our servers — all payments are processed through PCI-DSS compliant payment gateways. We also use OTP-based verification for every account to prevent unauthorized access.'
  },
  {
    q: 'Why do I need to enter an OTP during registration or booking?',
    a: 'OTP (One-Time Password) verification is used to confirm your identity and protect your account from fraud. A 6-digit code is sent to your registered mobile number and email. This ensures that only you can access your account or complete a booking.'
  },
  {
    q: 'Can I book for someone else or as a group?',
    a: 'Yes! You can book on behalf of another guest — just enter their name in the "Guest Name" field during checkout. For group bookings (10+ rooms or large events), please use the Contact page to speak with our Group Reservations team who will create a customised package for you.'
  },
  {
    q: 'What should I do if I face a problem at the hotel?',
    a: 'Contact our 24/7 customer support immediately at support@smartstay.in or call +91 98765 43210. We work directly with all our partner hotels and will resolve your issue promptly — whether it is a room change, billing dispute, or service complaint.'
  },
];

const Home = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [openFaq, setOpenFaq] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [trendingHotels, setTrendingHotels] = useState([]);
  const [hotelsLoading, setHotelsLoading] = useState(true);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  // SEO & Slideshow Logic
  useEffect(() => {
    document.title = "SmartStay India | Curated Luxury Hotel Stays & Heritage Palaces";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "Explore the finest luxury hotels, royal heritage palaces, and tropical retreats across India. Book your authentic Indian experience with SmartStay India today.");
    }
    
    // Auto-advance slideshow every 8 seconds
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 8000);

    // Set default dates (Tomorrow and the day after)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    setCheckIn(tomorrow.toISOString().split('T')[0]);
    setCheckOut(dayAfter.toISOString().split('T')[0]);

    // Fetch trending hotels from Firestore
    const fetchTrending = async () => {
      try {
        setHotelsLoading(true);
        const q = query(collection(db, 'properties'), orderBy('rating', 'desc'), limit(3));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrendingHotels(list);
      } catch (err) {
        console.error("Error fetching trending:", err);
      } finally {
        setHotelsLoading(false);
      }
    };

    fetchTrending();
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => setActiveSlide(index);
  const prevSlide = () => setActiveSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  const nextSlide = () => setActiveSlide(prev => (prev + 1) % HERO_SLIDES.length);

  const handleSearch = (e) => {
    e.preventDefault();
    const queryParams = new URLSearchParams();
    if (destination.trim()) queryParams.append('destination', destination);
    if (checkIn) queryParams.append('checkIn', checkIn);
    if (checkOut) queryParams.append('checkOut', checkOut);
    if (guests) queryParams.append('guests', guests);
    
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleCityInput = (val) => {
    setDestination(val);
    if (val.trim().length > 0) {
      const filtered = ELITE_CITIES.filter(city => 
        city.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5); // Limitation: Top 5 suggestions
      setFilteredCities(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectCity = (city) => {
    setDestination(city);
    setShowSuggestions(false);
  };

  const handleCheckInChange = (val) => {
    setCheckIn(val);
    const newIn = new Date(val);
    const currentOut = new Date(checkOut);
    
    // If check-out is not after check-in, set it to the next day
    if (newIn >= currentOut) {
      const nextDay = new Date(newIn);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOut(nextDay.toISOString().split('T')[0]);
    }
  };

  const handleCheckOutChange = (val) => {
    const newOut = new Date(val);
    const currentIn = new Date(checkIn);
    
    if (newOut > currentIn) {
      setCheckOut(val);
    }
  };

  return (
    <div className="home">
      {/* Hero Slideshow Section */}
      <section className="hero">
        {/* Slideshow layers - one per image, crossfade with opacity */}
        <div className="slideshow-container">
          {HERO_SLIDES.map((slide, index) => (
            <div
              key={index}
              className={`slide-layer ${activeSlide === index ? 'active' : ''}`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          ))}
        </div>
        <div className="hero-overlay"></div>

        {/* LEFT SIDE — Prominent Location Panel */}
        <div className="slide-location-panel" key={activeSlide}>
          <div className="slide-country">
            <MapPin size={13} />
            <span>{HERO_SLIDES[activeSlide].country}</span>
          </div>
          <div className="slide-city">{HERO_SLIDES[activeSlide].city}</div>
          <div className="slide-state">{HERO_SLIDES[activeSlide].state}</div>
          <div className="slide-divider"></div>
          <p className="slide-tagline-text">{HERO_SLIDES[activeSlide].tagline}</p>
          <div className="slide-progress-track">
            {HERO_SLIDES.map((_, index) => (
              <button
                key={index}
                className={`slide-progress-bar ${activeSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Prev/Next arrows */}
        <button className="slide-arrow slide-prev" onClick={prevSlide} aria-label="Previous">
          <ChevronLeft size={24} />
        </button>
        <button className="slide-arrow slide-next" onClick={nextSlide} aria-label="Next">
          <ChevronRight size={24} />
        </button>


        <div className="container hero-content animate-fade-in">
          <h1 className="hero-title">
            Discover Incredible <span>India</span> With Us.
          </h1>
          <p className="hero-subtitle">
            Curated heritage stays, royal palaces, and tropical retreats across the subcontinent.
          </p>

          {/* Search Widget */}
          <div className="search-widget glass shadow-2xl">
            <form onSubmit={handleSearch} className="search-form">

              <div className="search-field destination-field">
                <MapPin className="search-icon" size={20} />
                <div className="field-group">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="Where are you going?"
                    value={destination}
                    onChange={(e) => handleCityInput(e.target.value)}
                    onFocus={() => destination.trim().length > 0 && setShowSuggestions(true)}
                    autoComplete="off"
                  />
                  {showSuggestions && filteredCities.length > 0 && (
                    <div className="autocomplete-dropdown glass">
                      {filteredCities.map((city, idx) => (
                        <div 
                          key={idx} 
                          className="suggestion-item"
                          onClick={() => selectCity(city)}
                        >
                          <MapPin size={14} className="mr-2" />
                          {city}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="search-field date-field">
                <Calendar className="search-icon" size={20} />
                <div className="field-group">
                  <label>Check-in</label>
                  <div className="date-display-wrapper">
                    <span>{checkIn ? new Date(checkIn).toLocaleDateString('en-GB').split('/').join('-') : 'DD-MM-YYYY'}</span>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => handleCheckInChange(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="hidden-date-input"
                    />
                  </div>
                </div>
              </div>

              <div className="search-field date-field">
                <Calendar className="search-icon" size={20} />
                <div className="field-group">
                  <label>Check-out</label>
                  <div className="date-display-wrapper">
                    <span>{checkOut ? new Date(checkOut).toLocaleDateString('en-GB').split('/').join('-') : 'DD-MM-YYYY'}</span>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => handleCheckOutChange(e.target.value)}
                      min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                      className="hidden-date-input"
                    />
                  </div>
                </div>
              </div>

              <div className="search-field guests-field">
                <Users className="search-icon" size={20} />
                <div className="field-group">
                  <label>Guests</label>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4+">4+ Guests</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="search-btn btn-primary shadow-lg">
                <Search size={22} />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Section */}
      <section className="section featured-section container">
        <div className="section-header">
          <h2>Trending Luxury Stays</h2>
          <p>Handpicked properties with exceptional ratings and unparalleled views.</p>
        </div>

        <div className="featured-grid">
          {hotelsLoading ? (
            <div className="col-span-3 text-center py-10"><Loader className="animate-spin inline mr-2"/> Loading trending stays...</div>
          ) : trendingHotels.map((hotel, index) => (
            <div key={hotel.id} className="hotel-card animate-fade-in shadow-lg">
              <div className="card-image">
                <img src={hotel.images?.[0]} alt={hotel.name} />
                {index === 0 && <div className="badge">Featured Arrival</div>}
              </div>
              <div className="card-content">
                <div className="flex justify-between items-center">
                  <h3 className="truncate pr-2">{hotel.name}</h3>
                  <div className="star-badge-mini"><Star size={12} fill="#FFD700" color="#FFD700"/> {hotel.rating}</div>
                </div>
                <p className="location"><MapPin size={14} /> {hotel.location}</p>
                <div className="card-footer mt-auto pt-4 border-t border-color">
                  <div className="price">from <span className="font-bold text-lg">₹{Number(hotel.price).toLocaleString()}</span></div>
                  <Link to={`/hotel/${hotel.id}`} className="btn-outline px-4 py-2 border rounded-full text-xs hover:bg-primary hover:text-white transition-all">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Section */}
      <section className="section partners-section bg-secondary-light">
        <div className="container">
          <p className="partners-title">TRUSTED BY LEADING BRANDS</p>
          <div className="partners-logo-grid">
            <h3 className="partner-logo">MakeMyTrip</h3>
            <h3 className="partner-logo">Goibibo</h3>
            <h3 className="partner-logo">Taj Hotels</h3>
            <h3 className="partner-logo">Oberoi Group</h3>
            <h3 className="partner-logo">ITC Hotels</h3>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="section reviews-section container">
        <div className="section-header">
          <h2>What Our Guests Say</h2>
          <p>Real experiences from travelers who booked their Indian stay with us.</p>
        </div>

        <div className="reviews-grid">
          <div className="review-card glass">
            <Quote size={32} className="quote-icon" />
            <p className="review-text">"The booking experience was flawless. Our stay at the Jaipur palace was something out of a fairy tale! Highly recommend SmartStay India."</p>
            <div className="review-author">
              <div className="author-avatar bg-primary text-white">R</div>
              <div>
                <h4>Rahul Sharma</h4>
                <div className="flex-stars">
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                </div>
              </div>
            </div>
          </div>

          <div className="review-card glass">
            <Quote size={32} className="quote-icon" />
            <p className="review-text">"Found a beautiful beachfront villa in Goa for our anniversary. The UI made it so easy to filter and find exactly what we needed."</p>
            <div className="review-author">
              <div className="author-avatar bg-secondary text-primary">A</div>
              <div>
                <h4>Anjali Desai</h4>
                <div className="flex-stars">
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                </div>
              </div>
            </div>
          </div>

          <div className="review-card glass">
            <Quote size={32} className="quote-icon" />
            <p className="review-text">"We booked the Wildflower Hall in Shimla for our honeymoon through SmartStay. The sunrise view over the Himalayas was absolutely breathtaking."</p>
            <div className="review-author">
              <div className="author-avatar" style={{ background: '#9B59B6', color: 'white' }}>P</div>
              <div>
                <h4>Priya & Karan Mehta</h4>
                <div className="flex-stars">
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                </div>
              </div>
            </div>
          </div>

          <div className="review-card glass">
            <Quote size={32} className="quote-icon" />
            <p className="review-text">"SmartStay India listed authentic Kerala houseboat stays that I couldn't find on any other platform. Stayed 3 nights — pure bliss on the backwaters!"</p>
            <div className="review-author">
              <div className="author-avatar" style={{ background: '#27AE60', color: 'white' }}>S</div>
              <div>
                <h4>Suresh Nair</h4>
                <div className="flex-stars">
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                </div>
              </div>
            </div>
          </div>

          <div className="review-card glass">
            <Quote size={32} className="quote-icon" />
            <p className="review-text">"As a frequent business traveller, I use SmartStay India every week. The ITC Grand Chola in Chennai never disappoints — always top-notch service."</p>
            <div className="review-author">
              <div className="author-avatar" style={{ background: '#E67E22', color: 'white' }}>V</div>
              <div>
                <h4>Vikram Iyer</h4>
                <div className="flex-stars">
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                  <Star size={14} fill="var(--secondary)" color="var(--secondary)" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats-bar">
        <div className="container stats-grid">
          <div className="stat-item">
            <span className="stat-number">500+</span>
            <span className="stat-label">Properties</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">98%</span>
            <span className="stat-label">Guest Satisfaction</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">15</span>
            <span className="stat-label">Luxury Awards</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">2+</span>
            <span className="stat-label">Years of Excellence</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <div className="faq-container">
          <div className="faq-label">QUESTIONS</div>
          <h2 className="faq-title">General <em>Information</em></h2>
          <div className="faq-list">
            {FAQS.map((faq, index) => (
              <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  {openFaq === index ? <Minus size={16} /> : <Plus size={16} />}
                </button>
                {openFaq === index && (
                  <div className="faq-answer">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
