import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { MapPin, Star, Filter, Coffee, Wifi, Car, Waves, Loader, Heart, ChevronDown } from 'lucide-react';
import { fetchHotelsFromAPI } from '../services/api';
import { useMarket } from '../contexts/MarketContext';
import { useAuth } from '../contexts/AuthContext';
import { ELITE_CITIES } from '../utils/cities';
import './SearchResults.css';

const SearchResults = () => {
  const { convertPrice } = useMarket();
  const { currentUser, userData, updateWishlist } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialDest = queryParams.get('destination');
  const initialIn = queryParams.get('checkIn');
  const initialOut = queryParams.get('checkOut');
  
  const [destination, setDestination] = useState(initialDest || 'Anywhere');
  const [checkIn, setCheckIn] = useState(initialIn || '');
  const [checkOut, setCheckOut] = useState(initialOut || '');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  // Filter States
  const [priceRange, setPriceRange] = useState(100000);
  const [starRating, setStarRating] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLiveSyncing, setIsLiveSyncing] = useState(false);
  const [total, setTotal] = useState(0);

  const loadHotels = async (currentPage, isNewSearch = false) => {
    try {
      setLoading(true);
      const filters = {
        destination,
        priceRange,
        starRating,
        amenities
      };

      const response = await fetchHotelsFromAPI(currentPage, 6, filters);
      
      if (response.isLiveSyncResult) {
        setIsLiveSyncing(true);
        setTimeout(() => setIsLiveSyncing(false), 3000); // Pulse effect duration
      }

      if (isNewSearch) {
        setHotels(response.data);
      } else {
        setHotels(prev => [...prev, ...response.data]);
      }
      
      setHasMore(response.hasMore);
      setTotal(response.totalCount);
    } catch (error) {
      console.error("Failed to load hotels", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset and search when top update button or fundamental filters change
  const handleUpdateSearch = () => {
    // Update URL query parameters to maintain state on refresh
    const queryParams = new URLSearchParams(location.search);
    if (destination) queryParams.set('destination', destination);
    if (checkIn) queryParams.set('checkIn', checkIn);
    if (checkOut) queryParams.set('checkOut', checkOut);
    
    navigate({
      pathname: location.pathname,
      search: queryParams.toString()
    }, { replace: true });

    setPage(1);
    loadHotels(1, true);
  };

  useEffect(() => {
    document.title = destination && destination !== 'Anywhere' 
      ? `Luxury Hotels in ${destination} | SmartStay India` 
      : "Search Luxury Hotels & Suites | SmartStay India";
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", `Discover and book premium 5-star hotels and heritage stays in ${destination || 'India'}. Top-rated accommodations with world-class amenities.`);
    }

    loadHotels(page, page === 1);
  }, [page, destination]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const toggleStar = (rating) => {
    setStarRating(prev => 
      prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
    );
  };

  const toggleAmenity = (name) => {
    setAmenities(prev => 
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    );
  };

  const isWishlisted = (id) => userData?.wishlist?.includes(id);

  const handleWishlistToggle = async (e, hotelId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return alert("Sign in to save properties!");
    
    const newWishlist = isWishlisted(hotelId)
      ? userData.wishlist.filter(id => id !== hotelId)
      : [...(userData.wishlist || []), hotelId];
    
    await updateWishlist(newWishlist);
  };
  
  return (
    <div className="search-results-page">
      <div className="search-header-compact">
        <div className="container compact-search-bar glass">
          <div className="compact-input-wrapper">
            <input 
              type="text" 
              placeholder="Location" 
              value={destination}
              onChange={(e) => {
                const val = e.target.value;
                setDestination(val);
                if (val.trim().length > 0) {
                  setFilteredCities(ELITE_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
                  setShowSuggestions(true);
                } else {
                  setShowSuggestions(false);
                }
              }} 
              autoComplete="off"
            />
            {showSuggestions && filteredCities.length > 0 && (
              <div className="autocomplete-dropdown glass">
                {filteredCities.map(city => (
                  <div key={city} className="suggestion-item" onClick={() => { setDestination(city); setShowSuggestions(false); handleUpdateSearch(); }}>
                    <MapPin size={14} /> {city}
                  </div>
                ))}
              </div>
            )}
          </div>
          <input 
            type="date" 
            value={checkIn} 
            onChange={(e) => setCheckIn(e.target.value)}
            className="compact-date-input"
          />
          <input 
            type="date" 
            value={checkOut} 
            onChange={(e) => setCheckOut(e.target.value)}
            className="compact-date-input"
          />
          <button onClick={handleUpdateSearch} className="btn-primary search-update">Update</button>
        </div>
      </div>

      <div className="container results-layout">
        <aside className="filters-sidebar">
          <div className="filter-card">
            <div className="filter-header">
              <h3><Filter size={18}/> Filters</h3>
            </div>
            
            <div className="filter-section">
              <h4>Price Range (per night)</h4>
              <input 
                type="range" 
                min="2000" 
                max="100000" 
                step="1000"
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
                onMouseUp={handleUpdateSearch}
                onTouchEnd={handleUpdateSearch}
                className="price-slider"
              />
              <div className="price-labels">
                <span>{convertPrice(2000)}</span>
                <span>Up to {convertPrice(priceRange)}</span>
              </div>
            </div>

            <div className="filter-section">
              <h4>Star Rating</h4>
              <div className="checkbox-group">
                {[5, 4, 3].map(star => (
                   <label key={star}>
                     <input 
                       type="checkbox" 
                       checked={starRating.includes(star)}
                       onChange={() => toggleStar(star)}
                     /> {star} Stars
                   </label>
                ))}
              </div>
            </div>

            <div className="filter-section">
              <h4>Amenities</h4>
              <div className="checkbox-group">
                {['Free Wifi', 'Pool', 'Spa', 'Gym'].map(name => (
                  <label key={name}>
                    <input 
                      type="checkbox" 
                      checked={amenities.includes(name)}
                      onChange={() => toggleAmenity(name)}
                    /> {name}
                  </label>
                ))}
              </div>
            </div>
            
            <button onClick={handleUpdateSearch} className="btn btn-outline w-100 mt-2" style={{ fontSize: '0.85rem' }}>
              Apply Filter Selection
            </button>
          </div>
        </aside>

        <div className="results-list">
          {isLiveSyncing && (
            <div className="live-sync-indicator pulse animate-fade-in shadow-lg">
              <Loader className="animate-spin" size={16} /> 
              <span>Connected to Live Market: Procuring Elite Properties in India...</span>
            </div>
          )}
          <div className="results-meta">
            <h2>{hotels.length > 0 ? `Properties Found in ${destination}` : 'Searching properties...'}</h2>
            <select className="sort-select">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>

          <div className="list-items">
            {hotels.map((hotel, index) => (
              <Link to={`/hotel/${hotel.id}`} key={`${hotel.id}-${index}`} className="list-card animate-fade-in" style={{ textDecoration: 'none' }}>
                <div className="list-img">
                  <img src={hotel.images[0]} alt={hotel.name} />
                  <button 
                    className={`wishlist-btn ${isWishlisted(hotel.id) ? 'active' : ''}`}
                    onClick={(e) => handleWishlistToggle(e, hotel.id)}
                  >
                    <Heart size={20} fill={isWishlisted(hotel.id) ? "var(--secondary)" : "none"} />
                  </button>
                </div>
                <div className="list-details">
                  <div className="list-header">
                    <div>
                      <h3>{hotel.name}</h3>
                      <p className="location"><MapPin size={14}/> {hotel.location}</p>
                    </div>
                    <div className="rating">
                      <Star size={16} fill="var(--secondary)" color="var(--secondary)"/>
                      <span>{hotel.rating}</span>
                      <span className="reviews">({hotel.reviews})</span>
                    </div>
                  </div>
                  
                  <div className="amenities-tags">
                    {hotel.amenities?.map(a => <span key={a} className="tag">{a}</span>)}
                  </div>
                  
                  <div className="list-footer">
                    <div className="price">
                      <span>{convertPrice(hotel.price)}</span> / night
                    </div>
                    <div className="btn btn-primary">
                      View Details
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {!loading && hotels.length === 0 && (
              <div className="text-center py-5 glass" style={{ borderRadius: '15px', padding: '4rem' }}>
                <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>No Stays Found</h3>
                <p className="text-muted">Try adjusting your filters or searching for another city.</p>
                <button onClick={() => { setDestination('Anywhere'); setPriceRange(100000); setStarRating([]); setAmenities([]); handleUpdateSearch(); }} className="btn btn-outline mt-3">Reset All Filters</button>
              </div>
            )}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--primary)' }}>
              <Loader className="animate-spin" size={32} style={{ margin: '0 auto', display: 'block', animation: 'spin 2s linear infinite' }} />
              <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Searching for luxury properties...</p>
            </div>
          )}

          {!loading && hasMore && (
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
              <button onClick={handleLoadMore} className="btn-outline" style={{ padding: '0.8rem 3rem', borderRadius: 'var(--radius-full)' }}>
                Load More Results
              </button>
            </div>
          )}
          
          {!loading && !hasMore && hotels.length > 0 && (
            <p style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-muted)' }}>
              You have viewed all matching properties.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
