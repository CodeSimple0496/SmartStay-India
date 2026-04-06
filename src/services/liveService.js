import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

const RAPIDAPI_KEY = "18f9a8a520msh6427893084383eep1d0723jsn38116b24aff0";

const LUXURY_INTERIORS = [
  "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544124499-58b3273515d4?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"
];

const getDestId = async (cityName) => {
  const url = `https://booking-com.p.rapidapi.com/v1/hotels/locations?name=${cityName}&locale=en-gb`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'booking-com.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  const result = await response.json();
  const cityRecord = result.find(res => res.dest_type === 'city');
  return cityRecord ? cityRecord.dest_id : null;
};

const fetchPropertiesFromAPI = async (destId) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  const checkin = tomorrow.toISOString().split('T')[0];
  const checkout = dayAfter.toISOString().split('T')[0];

  const url = `https://booking-com.p.rapidapi.com/v1/hotels/search?dest_id=${destId}&dest_type=city&room_number=1&adults_number=2&checkout_date=${checkout}&checkin_date=${checkin}&units=metric&filter_by_currency=INR&order_by=popularity&locale=en-gb`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'booking-com.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  const result = await response.json();
  return result.result || [];
};

/**
 * Public function to sync a specific city with the Live Market.
 * Returns the procured and normalized hotels.
 */
export const syncCityLive = async (cityName, ownerId = 'system_admin') => {
  try {
    console.log(`📡 [Live Infinity]: Reaching out for ${cityName}...`);
    const destId = await getDestId(cityName);
    if (!destId) return [];

    const rawHotels = await fetchPropertiesFromAPI(destId);
    if (!rawHotels.length) return [];

    const cityHotels = rawHotels.slice(0, 10);
    const normalizedHotels = [];

    for (const hotel of cityHotels) {
      if (!hotel.max_photo_url) continue;

      const hotelId = hotel.hotel_id.toString();
      const docRef = doc(db, 'properties', hotelId);
      
      const rawPrice = hotel.min_total_price || Math.floor(Math.random() * 15000) + 5000;
      const luxuryPrice = Math.max(8000, Math.floor(rawPrice));

      const seed = parseInt(hotelId.slice(-3)) || 0;
      const img2 = LUXURY_INTERIORS[seed % LUXURY_INTERIORS.length];
      const img3 = LUXURY_INTERIORS[(seed + 1) % LUXURY_INTERIORS.length];

      const propertyData = {
        id: hotelId,
        ownerId,
        name: hotel.hotel_name || 'Luxury Stay',
        location: `${cityName}, India`,
        price: luxuryPrice,
        rating: hotel.review_score || 4.5,
        reviews: hotel.review_nr || Math.floor(Math.random() * 500) + 50,
        status: 'Active',
        images: [
          hotel.max_photo_url.replace('max1280x900', 'max1024x768'),
          img2,
          img3
        ],
        amenities: (hotel.facilities?.map(f => f.name).slice(0, 8) || ['Infinity Pool', 'Luxury Spa', 'Butler Service', 'Fine Dining']).filter(a => a),
        description: `Experience the gold standard of hospitality in ${cityName}. This property features world-class amenities and unparalleled views, ensuring a stay that is both cinematic and profoundly comfortable.`,
        isLiveSynced: true,
        createdAt: new Date().toISOString()
      };

      await setDoc(docRef, propertyData);
      normalizedHotels.push(propertyData);
    }

    return normalizedHotels;
  } catch (err) {
    console.error("Live Synchronization Failure:", err);
    return [];
  }
};
