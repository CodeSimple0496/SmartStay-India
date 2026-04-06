import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Star, ArrowLeft, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMarket } from '../contexts/MarketContext';
import { getHotelsByIds } from '../services/api';
import './Wishlist.css';

const Wishlist = () => {
  const { userData, currentUser, updateWishlist } = useAuth();
  const { convertPrice } = useMarket();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchWishlistItems = async () => {
      if (userData?.wishlist?.length > 0) {
        setLoading(true);
        const data = await getHotelsByIds(userData.wishlist);
        setHotels(data);
        setLoading(false);
      } else {
        setHotels([]);
        setLoading(false);
      }
    };

    fetchWishlistItems();
  }, [userData?.wishlist, currentUser, navigate]);

  const removeHandle = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    const newWishlist = userData.wishlist.filter(item => item !== id);
    await updateWishlist(newWishlist);
  };

  if (loading) {
    return (
      <div className="wishlist-page flex items-center justify-center min-h-screen">
        <Loader className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="container">
        <header className="wishlist-header pt-6">
          <Link to="/search" className="back-link"><ArrowLeft size={16}/> Explore More</Link>
          <h1>Your Curated Selection</h1>
          <p className="text-muted">High-end stays saved for your future journeys.</p>
        </header>

        {hotels.length === 0 ? (
          <div className="empty-wishlist animate-fade-in glass text-center">
            <Heart size={64} className="text-muted mb-4" strokeWidth={1} />
            <h2>Your collection is empty</h2>
            <p className="text-muted mt-3 mb-5">Save the gold standard of luxury stays to see them here.</p>
            <Link to="/search" className="btn btn-primary">Discover Stays</Link>
          </div>
        ) : (
          <div className="wishlist-grid mt-5">
            {hotels.map(hotel => (
              <Link to={`/hotel/${hotel.id}`} key={hotel.id} className="wishlist-card animate-scale-in">
                <div className="card-image">
                  <img src={hotel.images[0]} alt={hotel.name} />
                  <button onClick={(e) => removeHandle(e, hotel.id)} className="remove-btn" title="Remove">
                    <Heart size={20} fill="var(--secondary)" color="var(--secondary)" />
                  </button>
                </div>
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h3>{hotel.name}</h3>
                    <div className="rating">
                      <Star size={14} fill="var(--secondary)" color="var(--secondary)" /> {hotel.rating}
                    </div>
                  </div>
                  <p className="location"><MapPin size={14}/> {hotel.location}</p>
                  <div className="price-tag mt-3">
                    <strong>{convertPrice(hotel.price)}</strong> / night
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
