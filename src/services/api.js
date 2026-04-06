import { collection, query, where, getDocs, limit, orderBy, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { syncCityLive } from './liveService';

// Cache for pagination to handle page-number based requests with Firestore cursors
let lastDocByPage = {};

/**
 * Fetches Indian hotels from Firestore with filtering and pagination.
 * 
 * @param {number} page - The current page to fetch
 * @param {number} limitNum - How many items to fetch at once
 * @param {object} filters - Search filters { destination, priceRange, starRating, amenities }
 */
export const fetchHotelsFromAPI = async (page = 1, limitNum = 6, filters = {}) => {
  const { destination = '', priceRange = 100000, starRating = [], amenities = [] } = filters;

  try {
    const hotelsRef = collection(db, 'properties');
    let q = query(hotelsRef);

    // 1. Basic Destination Filter (City)
    if (destination && destination !== 'Anywhere') {
      q = query(q, where('location', '>=', destination), where('location', '<=', destination + '\uf8ff'));
    }

    // 2. Price Filter
    q = query(q, where('price', '<=', Number(priceRange)));

    // 3. Sorting (Needed for price filter and pagination)
    q = query(q, orderBy('price', 'asc'));

    // 4. Pagination handling
    if (page > 1 && lastDocByPage[page - 1]) {
      q = query(q, startAfter(lastDocByPage[page - 1]));
    }

    q = query(q, limit(limitNum));

    const querySnapshot = await getDocs(q);
    const hotels = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));

    // --- LIVE INFINITY FALLBACK (Case 1: No Results) ---
    if (page === 1 && hotels.length === 0 && destination && destination !== 'Anywhere') {
      console.log(`🔍 [Live Infinity]: No local properties found for ${destination}. Syncing live market...`);
      const liveHotels = await syncCityLive(destination);
      if (liveHotels.length > 0) {
        return {
          data: liveHotels.slice(0, limitNum),
          totalCount: liveHotels.length,
          hasMore: liveHotels.length > limitNum,
          isLiveSyncResult: true
        };
      }
    }

    // Store the last document for the next page's cursor
    if (querySnapshot.docs.length > 0) {
      lastDocByPage[page] = querySnapshot.docs[querySnapshot.docs.length - 1];
    }

    let filteredHotels = hotels;
    if (starRating.length > 0) {
      filteredHotels = filteredHotels.filter(h => starRating.includes(Math.floor(h.rating)));
    }
    if (amenities.length > 0) {
      filteredHotels = filteredHotels.filter(h => 
        amenities.every(required => h.amenities.includes(required))
      );
    }

    return {
      data: filteredHotels,
      totalCount: 200,
      hasMore: querySnapshot.docs.length === limitNum
    };
  } catch (error) {
    console.error("Firestore Fetch Error (Triggering Live Fallback):", error);
    
    // --- LIVE INFINITY FALLBACK (Case 2: Firestore Error/Missing Index) ---
    if (page === 1 && destination && destination !== 'Anywhere') {
      const liveHotels = await syncCityLive(destination);
      if (liveHotels.length > 0) {
        return {
          data: liveHotels.slice(0, limitNum),
          totalCount: liveHotels.length,
          hasMore: liveHotels.length > limitNum,
          isLiveSyncResult: true
        };
      }
    }
    
    return { data: [], totalCount: 0, hasMore: false };
  }
};

/**
 * Fetches a single hotel by ID from Firestore
 */
export const getHotelById = async (id) => {
  const { doc, getDoc } = await import('firebase/firestore');
  const docRef = doc(db, 'properties', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { ...docSnap.data(), id: docSnap.id };
  } else {
    throw new Error("Hotel not found");
  }
};

/**
 * Fetches multiple hotels by their IDs
 */
export const getHotelsByIds = async (ids) => {
  if (!ids || ids.length === 0) return [];
  
  try {
    const hotelsRef = collection(db, 'properties');
    const q = query(hotelsRef, where('__name__', 'in', ids));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    }));
  } catch (error) {
    console.error("Batch fetch error:", error);
    return [];
  }
};
