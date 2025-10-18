import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = {
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber,
          name: firebaseUser.displayName || 'مسافر',
          role: 'passenger'
        };
        setUser(userData);
        localStorage.setItem('passenger_data', JSON.stringify(userData));
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('passenger_data');
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }
  };

  const sendOTP = async (phoneNumber) => {
    try {
      // Format phone number to international format for Afghanistan
      let formattedPhone = phoneNumber.trim();
      
      // If doesn't start with +, add Afghanistan country code
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+93' + formattedPhone;
      }
      
      console.log('AuthContext - Sending OTP to:', formattedPhone);

      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      
      return { success: true, message: 'کد تأیید ارسال شد' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
      
      throw new Error(error.message || 'خطا در ارسال کد تأیید');
    }
  };

  const verifyOTP = async (otpCode) => {
    try {
      if (!confirmationResult) {
        throw new Error('لطفاً ابتدا شماره تلفن را وارد کنید');
      }

      const result = await confirmationResult.confirm(otpCode);
      const firebaseUser = result.user;
      
      // User data will be automatically set by onAuthStateChanged
      return { 
        success: true, 
        user: {
          uid: firebaseUser.uid,
          phone: firebaseUser.phoneNumber,
        }
      };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error('کد تأیید نادرست است');
    }
  };

  const login = async (phone, otp) => {
    // This is kept for backward compatibility
    // You can remove this if not used elsewhere
    try {
      await verifyOTP(otp);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setConfirmationResult(null);
      localStorage.removeItem('passenger_data');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('passenger_data', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUser, 
      loading,
      sendOTP,
      verifyOTP
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};