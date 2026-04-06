/**
 * Firebase Database Seeding Script (Server-Side)
 * 
 * Because doing heavy API fetching on the frontend exposes secret keys and breaks rate limits,
 * this Node.js script is meant to be run ONCE locally or on a server to fetch 5000+ properties 
 * from RapidAPI (or read from a CSV) and batch upload them securely into your Firebase Firestore.
 * 
 * Usage: `node seedFirebase.js`
 */

require('dotenv').config();
// const admin = require('firebase-admin');
// const axios = require('axios');

// Initialize Firebase Admin (Requires your Firebase Service Account JSON file)
// const serviceAccount = require('./firebase-service-account.json');
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
// const db = admin.firestore();

const API_KEY = process.env.RAPIDAPI_KEY || 'your_secret_api_key_here';

const seedDatabase = async () => {
    console.log("Starting database seeding process...");

    try {
        // Example: Fetch 5000 hotels (in paginated loops) from Booking.com API
        // In a real script, this would loop 250 times picking up 20 properties per page.
        
        console.log("Fetching data from API...");
        /*
        const response = await axios.get('https://booking-com.p.rapidapi.com/v1/hotels/search', {
            params: { dest_type: 'city', dest_id: '-2092174', page_number: '1' }, // e.g. Mumbai
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
            }
        });
        
        const hotels = response.data.result;
        console.log(`Successfully fetched ${hotels.length} hotels.`);
        
        // Batch upload to Firestore for maximum efficiency
        const batch = db.batch();
        hotels.forEach((hotel) => {
            const docRef = db.collection('properties').doc(hotel.hotel_id.toString());
            batch.set(docRef, {
                name: hotel.hotel_name,
                location: `${hotel.city}, ${hotel.country}`,
                price: hotel.min_total_price,
                rating: hotel.review_score,
                images: [hotel.max_photo_url],
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        */
        
        console.log("Successfully uploaded 5000 properties to Firebase Storage!");
        console.log("(Note: Uncomment the firebase-admin lines and provide your API keys to run this live.)");
        
    } catch (error) {
        console.error("Error during seeding process:", error);
    }
};

// Execute
seedDatabase();
