import { collection, query, where, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';

// Hardcoded for the one-click seeder based on the user's provided key
const RAPIDAPI_KEY = "18f9a8a520msh6427893084383eep1d0723jsn38116b24aff0";

/**
 * Advanced List of 30+ Luxury-Relevant Indian Destinations
 * Spanning Metros, Hills, Beaches, and Heritage.
 */
const CITY_NAMES = [
  'Mumbai', 'New Delhi', 'Jaipur', 'Goa', 'Udaipur', 
  'Bangalore', 'Chennai', 'Kochi', 'Agra', 'Shimla', 
  'Varanasi', 'Pune', 'Hyderabad', 'Amritsar', 'Manali', 
  'Rishikesh', 'Mussoorie', 'Darjeeling', 'Ooty', 'Munnar', 
  'Jaisalmer', 'Jodhpur', 'Madurai', 'Ahmedabad', 'Kolkata', 
  'Srinagar', 'Leh', 'Gangtok', 'Hampi', 'Alleppey'
];

/**
 * Dynamically fetches the dest_id for a given city name using RapidAPI
 */
async function getDestId(cityName) {
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
  // We want the city record
  const cityRecord = result.find(res => res.dest_type === 'city');
  return cityRecord ? cityRecord.dest_id : null;
}

/**
 * Fetches high-end hotels for a specific dest_id
 */
async function fetchCityHotels(dest_id) {
  // Use dynamic future dates (tomorrow and day after) to avoid 422 errors from Booking.com API
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  
  const checkin = tomorrow.toISOString().split('T')[0];
  const checkout = dayAfter.toISOString().split('T')[0];

  const url = `https://booking-com.p.rapidapi.com/v1/hotels/search?dest_id=${dest_id}&dest_type=city&room_number=1&adults_number=2&checkout_date=${checkout}&checkin_date=${checkin}&units=metric&filter_by_currency=INR&order_by=popularity&locale=en-gb`;
  
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': 'booking-com.p.rapidapi.com'
    }
  };

  const response = await fetch(url, options);
  if (!response.ok) throw new Error('RapidAPI limit reached or network error');
  const result = await response.json();
  return result.result || [];
}

/**
 * Clears existing properties to ensure a clean state
 */
async function clearProperties() {
  const q = query(collection(db, 'properties'));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach(d => batch.delete(d.ref));
  await batch.commit();
}

/**
 * The Master Seeder: Populates 200 luxury properties across India
 * @param {string} currentPartnerId - The UID of the partner who will own these hotels
 * @param {function} onProgress - Callback for UI status updates
 */
export const seedDatabase = async (currentPartnerId, onProgress) => {
  let count = 0;
  const targetCount = 200;
  
  if (!currentPartnerId) {
    onProgress("❌ Error: MISSION HALTED. You must be signed in to seed hotels.");
    return;
  }

  try {
    onProgress("🛑 Clearing existing inventory for a clean 'Masterpiece' state...");
    await clearProperties();

    for (const cityName of CITY_NAMES) {
      if (count >= targetCount) break;

      try {
        onProgress(`🔍 Locating Luxury Stay IDs for ${cityName}...`);
        const destId = await getDestId(cityName);
        if (!destId) continue;

        onProgress(`📡 Harvesting properties for ${cityName}...`);
        const hotels = await fetchCityHotels(destId);
        
        // Take up to 10 hotels per city to reach 200 across 30 cities
        const cityHotels = hotels.slice(0, 10);

        for (const hotel of cityHotels) {
          if (!hotel.max_photo_url) continue;

          const hotelId = hotel.hotel_id.toString();
          const docRef = doc(db, 'properties', hotelId);
          
          // Luxury Interior Backup Gallery (Curated High-Res)
          const LUXURY_INTERIORS = [
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1974&auto=format&fit=crop", // Elegant Lobby
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2070&auto=format&fit=crop", // Royal Suite
            "https://images.unsplash.com/photo-1544124499-58b3273515d4?q=80&w=2070&auto=format&fit=crop", // Luxury Spa/Bath
            "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=2070&auto=format&fit=crop", // Infinity Pool
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop", // Boutique Bedroom
            "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=2070&auto=format&fit=crop", // Fine Dining Room
            "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=2070&auto=format&fit=crop"  // Panoramic Balcony
          ];

          // Use hotelId as a seed for consistent but varied secondary images
          const seed = parseInt(hotelId.slice(-3)) || 0;
          const img2 = LUXURY_INTERIORS[seed % LUXURY_INTERIORS.length];
          const img3 = LUXURY_INTERIORS[(seed + 1) % LUXURY_INTERIORS.length];

          await setDoc(docRef, {
            id: hotelId,
            ownerId: currentPartnerId, // LINKED!
            name: hotel.hotel_name || 'Luxury Stay',
            location: `${cityName}, India`,
            price: luxuryPrice,
            rating: hotel.review_score || 4.5,
            reviews: hotel.review_nr || Math.floor(Math.random() * 500) + 50,
            status: 'Active',
            images: [
              hotel.max_photo_url.replace('max1280x900', 'max1024x768'), // Real exterior
              img2, // Signature Interior 1
              img3  // Signature Interior 2
            ],
            amenities: (hotel.facilities?.map(f => f.name).slice(0, 8) || ['Infinity Pool', 'Luxury Spa', 'Butler Service', 'Fine Dining']).filter(a => a),
            description: `Experience the gold standard of hospitality in ${cityName}. This property features world-class amenities and unparalleled views, ensuring a stay that is both cinematic and profoundly comfortable.`,
            createdAt: new Date().toISOString()
          });
          
          count++;
          if (count >= targetCount) break;
        }

        onProgress(`✅ Total Inventory: ${count}/200. Progress: ${Math.round((count/targetCount)*100)}%`);
        
        // Anti-Throttling Delay
        await new Promise(r => setTimeout(r, 1500));
      } catch (err) {
        console.error(`Harvesting failed for ${cityName}:`, err);
      }
    }
    
    if (count === 0) {
      onProgress(`⚠️ MISSION HALTED: 0 hotels were added.`);
    } else {
      onProgress(`🏁 [MISSION ACCOMPLISHED]: ${count} Luxury Properties secured for your Account.`);
    }
  } catch (error) {
    onProgress(`❌ Database scaling failed: ${error.message}`);
    console.error(error);
  }
};
