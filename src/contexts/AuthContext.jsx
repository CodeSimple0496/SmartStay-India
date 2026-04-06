import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Extended data from Firestore
  const [loading, setLoading] = useState(true);

  // Register a new user with Email/Password and save extra info to Firestore
  async function register(email, password, firstName, lastName, phone, isPartner) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Save extended user profile to Firestore
    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      firstName,
      lastName,
      phone,
      role: isPartner ? 'partner' : 'customer',
      loyaltyPoints: 0,
      wishlist: [],
      createdAt: new Date()
    });

    // Send email verification to their Gmail
    await sendEmailVerification(user);

    return user;
  }

  // Sign in with Google (OAuth popup)
  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if this Google user already has a Firestore profile
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    // Only create profile on first Google login
    if (!userSnap.exists()) {
      const nameParts = (user.displayName || '').split(' ');
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: user.phoneNumber || '',
        photoURL: user.photoURL || '',
        role: 'customer',
        loyaltyPoints: 0,
        wishlist: [],
        createdAt: new Date()
      });
    }

    return user;
  }

  // Log in existing user
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log out
  function logout() {
    return signOut(auth);
  }

  // Subscribe to authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            let data = userDoc.data();
            
            // Temporary Dev Bypass: Force 'admin' role for project owners
            const adminEmails = ['useless4484@gmail.com'];
            if (adminEmails.includes(user.email) && data.role !== 'admin') {
              console.warn("Dev: Granting temporary 'admin' role to", user.email);
              data.role = 'admin';
            }
            
            setUserData(data);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // ── Phone OTP Authentication ──

  // Step 1: Set up invisible reCAPTCHA and send OTP SMS
  function setupRecaptcha(buttonId) {
    // Clear any existing reCAPTCHA
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
    window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: 'invisible',
      callback: () => {}, // reCAPTCHA solved automatically
    });
    return window.recaptchaVerifier;
  }

  async function sendPhoneOTP(phoneNumber, buttonId) {
    const appVerifier = setupRecaptcha(buttonId);
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    window.confirmationResult = confirmationResult;
    return confirmationResult;
  }

  // Step 2: Verify the OTP the user entered
  async function verifyPhoneOTP(otp) {
    if (!window.confirmationResult) {
      throw new Error('No OTP session found. Please request a new OTP.');
    }
    const result = await window.confirmationResult.confirm(otp);
    return result.user;
  }

  // Update loyalty points in Firestore and local state
  async function updateLoyaltyPoints(newPoints) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    const updatedPoints = (userData?.loyaltyPoints || 0) + newPoints;
    await setDoc(userRef, { loyaltyPoints: updatedPoints }, { merge: true });
    setUserData(prev => ({ ...prev, loyaltyPoints: updatedPoints }));
    return updatedPoints;
  }

  // Resend email verification
  function resendVerificationEmail() {
    if (auth.currentUser) {
      return sendEmailVerification(auth.currentUser);
    }
  }

  // Update wishlist in Firestore and local state
  async function updateWishlist(newWishlist) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { wishlist: newWishlist }, { merge: true });
    setUserData(prev => ({ ...prev, wishlist: newWishlist }));
  }

  // Upgrade user role (e.g. to 'partner')
  async function updateUserRole(newRole) {
    if (!currentUser) return;
    const userRef = doc(db, 'users', currentUser.uid);
    await setDoc(userRef, { role: newRole }, { merge: true });
    setUserData(prev => ({ ...prev, role: newRole }));
    return newRole;
  }

  const value = {
    currentUser,
    userData,
    isEmailVerified: currentUser?.emailVerified || false,
    register,
    login,
    logout,
    signInWithGoogle,
    resendVerificationEmail,
    sendPhoneOTP,
    verifyPhoneOTP,
    updateLoyaltyPoints,
    updateWishlist,
    updateUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
