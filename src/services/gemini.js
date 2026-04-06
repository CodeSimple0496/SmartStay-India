import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

/**
 * Gemini AI Service for SmartStay India
 * 
 * This service handles generating "Smart Summaries" for hotels using Google's Gemini 1.5 Flash.
 */

// NOTE: In production, this should be in an environment variable (VITE_GEMINI_API_KEY)
// For now, we provide a placeholder. The user should get their key from Google AI Studio.
const GEMINI_API_KEY = ""; 

/**
 * Generates a concise, luxury-focused summary for a hotel.
 * 
 * @param {object} hotel - The hotel object with name, location, description, and amenities.
 * @returns {Promise<string>} - The AI generated summary.
 */
export const generateSmartSummary = async (hotel) => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === "") {
    console.warn("Gemini API Key missing. Returning fallback description.");
    return `Enjoy a cinematic stay at ${hotel.name} in ${hotel.location}. This property is highly rated for its ${hotel.amenities?.slice(0, 3).join(', ')} and offers a truly premium experience for Indian travelers.`;
  }

  const prompt = `
    You are a luxury travel concierge for "SmartStay India". 
    Write a 2-3 sentence extremely appealing "Stay Highlight" for the following hotel:
    
    Name: ${hotel.name}
    Location: ${hotel.location}
    Description: ${hotel.description}
    Amenities: ${hotel.amenities?.join(', ')}
    
    The tone should be cinematic, elegant, and professional. Focus on the most unique features.
    Keep it strictly under 60 words.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    throw new Error("Invalid AI response");
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return `Experience the gold standard of hospitality at ${hotel.name}. This is a curated luxury property in ${hotel.location} featuring world-class amenities and unparalleled comfort.`;
  }
};
