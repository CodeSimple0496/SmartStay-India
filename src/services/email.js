/**
 * EmailJS Service for SmartStay India
 * This service handles client-side email notifications for bookings and inquiries.
 * 
 * Note: You must install the EmailJS SDK:
 * npm install @emailjs/browser
 */

let emailjs = null;

/** 
 * 🚀 PRODUCTION SETUP:
 * 1. Run: npm install @emailjs/browser
 * 2. Uncomment the line below:
 */
// import emailjsRef from '@emailjs/browser'; emailjs = emailjsRef;

const SERVICE_ID = "YOUR_SERVICE_ID"; 
const TEMPLATE_ID_BOOKING = "YOUR_BOOKING_TEMPLATE_ID"; 
const TEMPLATE_ID_INQUIRY = "YOUR_INQUIRY_TEMPLATE_ID"; 
const PUBLIC_KEY = "YOUR_PUBLIC_KEY"; 

/**
 * Sends a booking confirmation email to the guest.
 */
export const sendBookingEmail = async (bookingData) => {
  try {
    const formattedPrice = typeof bookingData.totalPrice === 'number' 
      ? `₹${bookingData.totalPrice.toLocaleString()}` 
      : bookingData.totalPrice;

    const templateParams = {
      to_name: bookingData.customerName,
      to_email: bookingData.customerEmail,
      hotel_name: bookingData.hotelName,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      total_price: formattedPrice,
      booking_id: bookingData.id || 'Approved',
      location: bookingData.location,
      rooms: bookingData.rooms || 1,
      room_type: bookingData.roomType || 'Standard'
    };

    // Only attempt if keys are provided AND SDK is loaded
    if (PUBLIC_KEY !== "YOUR_PUBLIC_KEY" && emailjs) {
      return await emailjs.send(SERVICE_ID, TEMPLATE_ID_BOOKING, templateParams, PUBLIC_KEY);
    }
    
    console.log("🏙️ [SmartStay Simulation] Booking Confirmation Email:", templateParams);
    return { status: 200, text: "Simulation Successful" };
  } catch (error) {
    console.error("EmailJS Service Error:", error);
    // Don't blockers the user booking if email fails in simulation
    return { status: 500, text: "Email failed but booking preserved" };
  }
};

/**
 * Sends a contact inquiry alert to the admin.
 */
export const sendInquiryEmail = async (inquiryData) => {
  try {
    const templateParams = {
      from_name: inquiryData.name,
      from_email: inquiryData.email,
      message: inquiryData.message,
      submit_time: new Date().toLocaleString()
    };

    if (PUBLIC_KEY !== "YOUR_PUBLIC_KEY" && emailjs) {
      return await emailjs.send(SERVICE_ID, TEMPLATE_ID_INQUIRY, templateParams, PUBLIC_KEY);
    }
    
    console.log("🏙️ [SmartStay Simulation] Inquiry Alert Email:", templateParams);
    return { status: 200, text: "Simulation Successful" };
  } catch (error) {
    console.error("EmailJS Service Error:", error);
    return { status: 500, text: "Inquiry logged to console" };
  }
};

/**
 * Sends a status update notification (Confirmation or Payment) to the guest.
 */
export const sendConfirmationStatusEmail = async (bookingData, type = 'status') => {
  try {
    const isPayment = type === 'payment';
    
    const templateParams = {
      to_name: bookingData.customerName,
      to_email: bookingData.customerEmail,
      hotel_name: bookingData.hotelName,
      booking_id: bookingData.id,
      update_type: isPayment ? "Payment Received" : "Reservation Approved",
      message: isPayment 
        ? `We have successfully received your payment for your stay at ${bookingData.hotelName}. Your reservation is now fully secured.`
        : `Great news! Your reservation at ${bookingData.hotelName} has been officially approved by the property manager.`,
      status: isPayment ? "PAID" : "APPROVED",
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut
    };

    if (PUBLIC_KEY !== "YOUR_PUBLIC_KEY" && emailjs) {
      // Use the booking template or a generic update template if available
      return await emailjs.send(SERVICE_ID, TEMPLATE_ID_BOOKING, templateParams, PUBLIC_KEY);
    }
    
    console.log(`🏙️ [SmartStay Simulation] ${isPayment ? 'Payment' : 'Status'} Update Email:`, templateParams);
    return { status: 200, text: "Simulation Successful" };
  } catch (error) {
    console.error("EmailJS Service Error:", error);
    return { status: 500, text: "Notification failed" };
  }
};
