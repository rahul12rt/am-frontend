"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import OtpInput from "../otp/Otp";
import styles from "./User.module.scss";
import {
  useSendSignupOtp,
  useVerifySignupOtp,
  useSendLoginOtp,
  useVerifyLoginOtp,
} from "@/hooks/useAuth";
import { supabase } from "@/lib/utils";
import { useUser } from "@/contexts/UserContext";
import { useToast } from '@/contexts/ToastContext';
import { UserProfile, Address } from "@/types/user";
import Accordion from '../accordion/Accordion';
import { getOrders } from '@/services/orderService';
import { SkeletonLoader, LoadingOverlay } from '@/components/atoms';
import { User as UserIcon, LogOut, MapPin, ShoppingBag, X, CheckCircle, AlertCircle, Info, ChevronRight, Package } from 'lucide-react';
import { trackLogin, trackSignUp } from '@/components/seo/GoogleAnalytics';

interface InlineMessage {
  text: string;
  type: "success" | "error" | "info";
}

interface UserProps {
  onClose?: () => void;
}

const User = ({ onClose }: UserProps) => {
  const { showToast } = useToast();
  const { 
    profile, 
    isInitializing, 
    isLoadingProfile, 
    isAuthenticated, 
    isReady, 
    logout, 
    refetchProfile 
  } = useUser();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phone, setPhone] = useState("");
  const countryCode = "91";
  const [otp, setOtp] = useState("");

  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
    // Remove auto-submit to prevent duplicate calls - let users click verify button
  };
  const [firstName, setFirstName] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [message, setMessage] = useState<InlineMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [isRefetchingProfile, setIsRefetchingProfile] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Mutations
  const sendSignupOtp = useSendSignupOtp();
  const verifySignupOtp = useVerifySignupOtp();
  const sendLoginOtp = useSendLoginOtp();
  const verifyLoginOtp = useVerifyLoginOtp();

  /** ---- Validation functions ---- */
  const validateName = (name: string): boolean => {
    const trimmedName = name.trim();
    // Must have at least 2 characters, only letters and spaces, no consecutive spaces
    const nameRegex = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
    return nameRegex.test(trimmedName) && trimmedName.length >= 2 && trimmedName.length <= 50;
  };

  const validatePhone = (phoneNumber: string): boolean => {
    // Exactly 10 digits, no leading zeros, valid Indian mobile pattern
    const phoneRegex = /^[6-9][0-9]{9}$/;
    return phoneRegex.test(phoneNumber.replace(/\s/g, ''));
  };

  /** ---- Input handlers with validation ---- */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Handle paste operations - extract only numbers from pasted content
    value = value.replace(/[^0-9]/g, ''); // Only allow numbers
    
    // Prevent leading zeros (except for single 0)
    if (value.length > 1 && value.startsWith('0')) {
      value = value.substring(1);
    }
    
    // Limit to exactly 10 digits
    if (value.length <= 10) {
      setPhone(value);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Allow only letters and spaces
    value = value.replace(/[^a-zA-Z\s]/g, '');
    
    // Prevent multiple consecutive spaces
    value = value.replace(/\s+/g, ' ');
    
    // Prevent starting with space
    if (value.startsWith(' ')) {
      value = value.trimStart();
    }
    
    // Limit length to reasonable name size (50 characters)
    if (value.length <= 50) {
      setFirstName(value);
    }
  };

  /** ---- Clear message after timeout ---- */
  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };


  /** ---- Handle Send OTP ---- */
  const handleResendOtp = async () => {
    if (isResendDisabled) return;

    setIsLoading(true);
    try {
      if (mode === "signup") {
        await sendSignupOtp.mutateAsync({ phone, countryCode });
      } else {
        await sendLoginOtp.mutateAsync({ phone, countryCode });
      }
      showToast("A new OTP has been sent.", "success");
      setResendTimer(60);
      setIsResendDisabled(true);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to resend OTP";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    setIsLoading(true);

    // Validate phone number
    if (!phone) {
      showMessage("Phone number is required", "error");
      setIsLoading(false);
      return;
    }

    if (!validatePhone(phone)) {
      showMessage("Phone number must be 10 digits starting with 6, 7, 8, or 9", "error");
      setIsLoading(false);
      return;
    }

    // Validate first name for signup
    if (mode === "signup" && !firstName.trim()) {
      showMessage("First name is required", "error");
      setIsLoading(false);
      return;
    }

    if (mode === "signup" && !validateName(firstName)) {
      showMessage("First name must be 2-50 characters, letters and single spaces only", "error");
      setIsLoading(false);
      return;
    }

    if (mode === "signup" && !agreedToTerms) {
      showMessage("Please agree to Terms & Conditions and Privacy Policy", "error");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        await sendSignupOtp.mutateAsync({ phone, countryCode });
      } else {
        await sendLoginOtp.mutateAsync({ phone, countryCode });
      }
      showMessage("OTP sent successfully", "success");
      setStep("otp");
      setResendTimer(60);
      setIsResendDisabled(true);
    } catch (error: any) {
      // Show the actual error message from the API
      const errorMessage =
        error?.data?.error ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP";
      showMessage(errorMessage, "error");

      // If user exists during signup, suggest switching to login
      if (mode === "signup" && errorMessage.includes("already exists")) {
        setTimeout(() => {
          showMessage("💡 Try logging in instead", "info");
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };


  /** ---- Handle Verify OTP ---- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (isVerifying || isLoading) {
      return;
    }
    
    setMessage(null);
    setIsLoading(true);
    setIsVerifying(true);

  if (!otp) {
    showMessage("OTP is required", "error");
    setIsLoading(false);
    setIsVerifying(false);
    return;
  }

  try {
    if (mode === "login") {
      // Use backend API for login verification
      const res = await verifyLoginOtp.mutateAsync({
        phone,
        countryCode,
        otp,
      });

      // Login successful

      // Track login event
      trackLogin('phone', res?.user?.id);

      // Refetch profile after successful login
      setTimeout(async () => {
        setIsRefetchingProfile(true);
        try {
          await refetchProfile();
          showToast("Login successful! ", 'success');
        } catch (error) {
          // Failed to refetch profile
          showToast("Login successful, but failed to load profile", 'info');
        } finally {
          setIsRefetchingProfile(false);
        }
      }, 200);

      onClose?.();
      setStep("phone");
      setOtp("");
      setFirstName("");
      setAgreedToTerms(false);
    } else {
      // Use backend API for signup verification
      const res = await verifySignupOtp.mutateAsync({
        phone,
        countryCode,
        otp,
        first_name: firstName,
      });

      // Signup successful
      
      // Track signup event
      trackSignUp('phone', res?.user?.id);
      
      // Show success message and refetch profile like login does
      showToast("Registration successful! Welcome to Alban Marcus! 🎉", 'success');
      
      // Refetch profile after successful registration (same as login)
      setTimeout(async () => {
        setIsRefetchingProfile(true);
        try {
          await refetchProfile();
          showToast("Profile loaded successfully!", 'success');
        } catch (error) {
          // Failed to refetch profile after registration
          showToast("Registration successful, but failed to load profile", 'info');
        } finally {
          setIsRefetchingProfile(false);
        }
      }, 200);

      onClose?.();
      setStep("phone");
      setOtp("");
      setFirstName("");
      setAgreedToTerms(false);
    }
  } catch (error: any) {
    const errorMessage =
      error?.data?.error ||
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Invalid OTP";
    showMessage(errorMessage, "error");
  } finally {
    setIsLoading(false);
    setIsVerifying(false);
  }
};


  /** ---- Handle mode switch ---- */
  // All useEffect hooks must be at the top level, before any conditional returns
  useEffect(() => {
    if (profile) {
      getOrders().then(setOrders);
    }
  }, [profile]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && isResendDisabled) {
      timer = setInterval(() => {
        setResendTimer(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, isResendDisabled]);

  const handleModeSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
    setStep("phone");
    setMessage(null); // Clear messages when switching modes
    setPhone("");
    setOtp("");
    setFirstName("");
    // Country code is now fixed at 91
    setAgreedToTerms(false);
  };

  // Show loading state while initializing or loading profile
  if (isInitializing || (isAuthenticated && isLoadingProfile && !profile)) {
    return (
      <div className="h-full flex flex-col bg-black overflow-hidden relative">
        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800 shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-gray-400" />
            Account
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 p-2 rounded-full"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>
        
        {/* Loading Content */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg mb-2">
              {isInitializing ? 'Initializing...' : 'Loading your profile...'}
            </p>
            <p className="text-gray-400 text-sm">
              {isInitializing ? 'Checking authentication status' : 'Fetching your account details'}
            </p>
          </div>
        </div>
      </div>
    );
  }


  if (profile) {
    return (
      <div className="h-full flex flex-col bg-black overflow-hidden relative">
        {/* Header with Close Button */}
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800 shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-3">
            <UserIcon className="w-6 h-6 text-gray-400" />
            Account
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 p-2 rounded-full"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 lg:p-8">
            <div className={`w-full max-w-none ${styles.loginForm}`}>
              {/* Enhanced Profile Header */}
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white">Hello, {profile.first_name}!</h3>
                <p className="text-gray-400 mt-1">+{profile.phone_country_code} {profile.phone_number}</p>
              </div>

              {/* Inline Message Display */}
              {message && (
                <div
                  className={`${styles.messageContainer} mb-6 p-4 rounded-[8px] text-[1.4rem] font-medium leading-[1.4] transition-all duration-300 ease-in-out ${
                    message.type === "success"
                      ? `${styles.successMessage} bg-green-900/20 text-green-300 border border-green-600/30`
                      : message.type === "error"
                      ? `${styles.errorMessage} bg-red-900/20 text-red-300 border border-red-600/30`
                      : `${styles.infoMessage} bg-blue-900/20 text-blue-300 border border-blue-600/30`
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`${styles.messageIcon} flex-shrink-0 mt-1`}>
                      {message.type === "success" && <CheckCircle className="w-5 h-5" />}
                      {message.type === "error" && <AlertCircle className="w-5 h-5" />}
                      {message.type === "info" && <Info className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      {message.text}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="bg-transparent rounded-lg border border-gray-800 overflow-hidden">
                  <Accordion title="Addresses" icon={<MapPin className="w-5 h-5 text-gray-400" />}>
                    {profile.addresses && profile.addresses.length > 0 ? (
                      <div className="space-y-4 p-4">
                        {profile.addresses.map((addr: Address) => (
                          <div key={addr.id} className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <p className='font-bold text-white text-lg'>{addr.full_name}</p>
                                {addr.is_default && (
                                  <span className='px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-500/30'>
                                    Default
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="space-y-1 text-gray-300">
                              <p className="leading-relaxed">{addr.address_line1}</p>
                              {addr.address_line2 && <p className="leading-relaxed">{addr.address_line2}</p>}
                              <p className="font-medium">{addr.city}, {addr.state} - {addr.postal_code}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400 p-4">
                        <MapPin className="w-12 h-12 mb-3 text-gray-500" strokeWidth={1.5} />
                        <p className="text-lg">No addresses found</p>
                        <p className="text-sm text-gray-500 mt-1">Add your first address during checkout</p>
                      </div>
                    )}
                  </Accordion>
                </div>

                <div className="bg-transparent rounded-lg border border-gray-800 overflow-hidden">
                  <Accordion title="Orders" icon={<ShoppingBag className="w-5 h-5 text-gray-400" />}>
                    {orders.length > 0 ? (
                      <div className="space-y-4 p-4">
                        {orders.map(order => (
                          <div key={order.id} className="p-4 bg-gray-800/60 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-white font-semibold text-lg">Order #{order.id}</p>
                                <p className="text-sm text-gray-400">Placed on {new Date(order.created_at || Date.now()).toLocaleDateString()}</p>
                              </div>
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                order.status === 'completed' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                order.status === 'processing' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                              }`}>
                                {order.status?.charAt(0)?.toUpperCase() + order.status?.slice(1) || 'Unknown'}
                              </div>
                            </div>
                            {order.total_amount && (
                              <div className="flex justify-between items-center pt-2 border-t border-gray-700">
                                <span className="text-gray-400">Total Amount</span>
                                <span className="text-white font-semibold">₹{order.total_amount}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400 p-4">
                        <ShoppingBag className="w-12 h-12 mb-3 text-gray-500" strokeWidth={1.5} />
                        <p className="text-lg">No orders yet</p>
                        <p className="text-sm text-gray-500 mt-1">Start shopping to see your orders here</p>
                      </div>
                    )}
                  </Accordion>
                </div>
              </div>

              {/* Sign Out Button */}
              <div className="mt-8">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await logout();
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  disabled={isLoading}
                  className={`${styles.submitButton} ${styles.outlineButton} w-full flex justify-between items-center p-4 rounded-lg font-bold text-lg`}
                >
                  <span>
                    {isLoading ? "Signing out..." : "Sign Out"}
                  </span>
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom padding for mobile */}
        <div className="h-6 md:h-8 shrink-0"></div>

        {/* Loading overlay when refetching profile */}
        {isRefetchingProfile && (
          <LoadingOverlay message="Refreshing your profile..." />
        )}
      </div>
    );
  }

  // Show login/register form for unauthenticated users
  return (
    <div className="h-full flex flex-col bg-black overflow-hidden  pt-20">
      {/* Mobile/Tablet Close Button Header */}
      <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-800 shrink-0">
        <h2 className="text-[2.4rem] font-semibold text-white">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300 transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pt-8">
        <div className="p-4 md:p-6 lg:p-8">
          <form
            onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp}
            className={`w-full max-w-none ${
              mode === "login" ? styles.loginForm : styles.registerForm
            }`}
          >
            <h3 className="text-[1.8rem] font-bold leading-tight mb-2 md:mb-4">
              {mode === "login" ? "Existing member" : "Register New Account"}
            </h3>
            <h6 className="text-[1.6rem] leading-relaxed mb-6 md:mb-8 text-gray-300">
              {mode === "login" ? "Welcome Back!" : "Join Us!"}
            </h6>

            {/* Inline Message Display */}
            {message && (
              <div
                className={`${styles.messageContainer} mb-6 p-4 rounded-[8px] text-[1.6rem] font-medium leading-[1.4] transition-all duration-300 ease-in-out ${
                  message.type === "success"
                    ? `${styles.successMessage} bg-green-900/20 text-green-300 border border-green-600/30`
                    : message.type === "error"
                    ? `${styles.errorMessage} bg-red-900/20 text-red-300 border border-red-600/30`
                    : `${styles.infoMessage} bg-blue-900/20 text-blue-300 border border-blue-600/30`
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`${styles.messageIcon} flex-shrink-0 mt-1`}>
                    {message.type === "success" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                    {message.type === "error" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    )}
                    {message.type === "info" && (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    {message.text}
                  </div>
                </div>
              </div>
            )}

            {step === "phone" && (
              <>
                {/* Combined Phone Number Field - Responsive */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center p-3 md:p-4 bg-gray-900/30 rounded-lg border border-gray-700 focus-within:border-white transition-colors">
                    <div className="mr-3 flex items-center">
                      <Image
                        src="/icons/sms.svg"
                        alt="Phone"
                        width={18}
                        height={18}
                        className="md:w-5 md:h-5"
                      />
                    </div>
                    <span className="text-white text-[1.6rem] font-medium mr-2 md:mr-3">
                      +91
                    </span>
                    <input 
                      type="tel"
                      name="phone"
                      placeholder="Phone number"
                      value={phone}
                      onChange={handlePhoneChange}
                      disabled={isLoading}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="[6-9][0-9]{9}"
                      autoComplete="tel"
                      className="bg-transparent border-none outline-none text-white flex-1 placeholder:text-gray-400 text-[1.4rem] font-medium disabled:opacity-60"
                    />
                  </div>
                </div>

                {/* First Name Field (Signup only) - Responsive */}
                {mode === "signup" && (
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-center p-3 md:p-4 bg-gray-900/30 rounded-lg border border-gray-700 focus-within:border-white transition-colors">
                      <div className="mr-3 flex items-center">
                        <Image
                          src="/icons/user.svg"
                          alt="User"
                          width={18}
                          height={18}
                          className="md:w-5 md:h-5"
                        />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Enter Name"
                        className="bg-transparent border-none outline-none text-white flex-1 placeholder:text-gray-400 text-[1.4rem] font-medium disabled:opacity-60"
                        value={firstName}
                        onChange={handleNameChange}
                        disabled={isLoading}
                        maxLength={50}
                        pattern="[a-zA-Z\s]+"
                        autoComplete="given-name"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                )}

                {/* Terms Agreement (Signup only) - Responsive */}
                {mode === "signup" && (
                  <div className="mb-4 md:mb-6">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="termsAgreement"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        disabled={isLoading}
                        className="mt-1 accent-white w-4 h-4 md:w-5 md:h-5 cursor-pointer disabled:opacity-60"
                      />
                        <label htmlFor="termsAgreement" className="text-[1.4rem] text-gray-300 leading-relaxed cursor-pointer select-none">
                          By registering, you agree to our{" "}
                          <Link 
                            href="/termsandconditions" 
                            className="underline hover:text-white transition-colors text-white" 
                            target="_blank"
                          >
                            Terms & Conditions
                          </Link>
                          {" "}and{" "}
                          <Link 
                            href="/privacypolicy" 
                            className="underline hover:text-white transition-colors text-white" 
                            target="_blank"
                          >
                            Privacy Policy
                          </Link>
                        </label>
                      </div>
                    </div>
                  )}

                {/* Send OTP Button - Responsive */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${styles.submitButton} ${styles.outlineButton} rounded-lg text-[1.6rem] font-bold py-3 md:py-4 px-4 md:px-6 mt-4 md:mt-6 cursor-pointer w-full flex justify-between items-center gap-2 md:gap-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                  <Image
                    src="/icons/rightArrow.svg"
                    alt="Arrow Icon"
                    width={24}
                    height={24}
                  />
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                {/* OTP Field - Responsive */}
                <div className="mb-4 md:mb-6">
                  <OtpInput length={6} onComplete={handleOtpChange} />
                </div>

                {/* Verify OTP Button - Responsive */}
                <button
                  type="submit"
                  disabled={isLoading || isVerifying || otp.length !== 6}
                  className={`${styles.submitButton} ${styles.outlineButton} rounded-lg text-[1.6rem] font-bold py-3 md:py-4 px-4 md:px-6 mt-4 md:mt-6 cursor-pointer w-full flex justify-between items-center gap-2 md:gap-4 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                >
                  {isLoading || isVerifying ? "Verifying..." : "Verify OTP"}
                  <Image
                    src="/icons/rightArrow.svg"
                    alt="Arrow Icon"
                    width={20}
                    height={20}
                    className="md:w-6 md:h-6"
                  />
                </button>

                {/* Back to Phone Button - Responsive */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setStep("phone")}
                    disabled={isLoading}
                    className="text-[1.4rem] font-medium text-left text-gray-300 hover:text-white hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-60 transition-colors"
                  >
                    ← Back to phone number
                  </button>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendDisabled || isLoading}
                    className="text-[1.4rem] font-medium text-right text-gray-300 hover:text-white hover:underline cursor-pointer bg-transparent border-none p-0 disabled:opacity-60 transition-colors"
                  >
                    {isResendDisabled ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>
                </div>
              </>
            )}

            {/* Toggle between Login and Register - Responsive */}
            {step === "phone" && (
              <div className="mt-6 md:mt-8 pt-4 border-t border-gray-800">
                <p className="text-[1.4rem] text-center text-gray-400">
                  {mode === "login"
                    ? "Don't have an account?"
                    : "Already have an account?"}{" "}
                  <span
                    onClick={() =>
                      handleModeSwitch(mode === "login" ? "signup" : "login")
                    }
                    className="text-[1.4rem] font-bold text-white cursor-pointer hover:underline transition-colors underline"
                  >
                    {mode === "login" ? "Register Now" : "Login"}
                  </span>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
      
      {/* Bottom padding for mobile */}
      <div className="h-6 md:h-8 shrink-0"></div>
    </div>
  );
};

export default User;
