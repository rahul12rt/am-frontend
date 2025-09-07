"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import styles from "./User.module.scss";
import {
  useSendSignupOtp,
  useVerifySignupOtp,
  useSendLoginOtp,
  useVerifyLoginOtp,
} from "@/hooks/useAuth";
import { supabase } from "@/lib/utils";

interface UserProfile {
  first_name: string;
  phone_country_code: string;
  phone_number: string;
  phone_verified: boolean;
}

interface InlineMessage {
  text: string;
  type: "success" | "error" | "info";
}

interface UserProps {
  onClose?: () => void;
}

const User = ({ onClose }: UserProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phoneValue, setPhoneValue] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");

  const [user, setUser] = useState<UserProfile | null>(null);
  const [message, setMessage] = useState<InlineMessage | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Mutations
  const sendSignupOtp = useSendSignupOtp();
  const verifySignupOtp = useVerifySignupOtp();
  const sendLoginOtp = useSendLoginOtp();
  const verifyLoginOtp = useVerifyLoginOtp();

  /** ---- Clear message after timeout ---- */
  const showMessage = (text: string, type: "success" | "error" | "info") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  /** ---- Load user from localStorage ---- */
  useEffect(() => {
    setAuthLoading(true);
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    }
    setAuthLoading(false);
  }, []);

  /** ---- Save user to localStorage when logged in ---- */
  const saveUser = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /** ---- Clear user (Sign out) ---- */
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      localStorage.removeItem("user");
      supabase.auth.signOut();
      setMode("login");
      setStep("phone");
      setPhoneValue("");
      setOtp("");
      setFirstName("");
      showMessage("Signed out successfully!", "success");
      onClose?.();
    } catch (error) {
      showMessage("An error occurred while signing out", "error");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /** ---- Extract country code and phone number ---- */
  const parsePhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return { countryCode: "", phone: "" };

    // Remove the + sign and extract country code and phone number
    const cleanNumber = phoneNumber.replace("+", "");

    // Common country code patterns (you can expand this)
    const countryCodePatterns = [
      { code: "91", length: 2 }, // India
      { code: "1", length: 1 }, // US/Canada
      { code: "44", length: 2 }, // UK
      { code: "971", length: 3 }, // UAE
      { code: "966", length: 3 }, // Saudi Arabia
      { code: "81", length: 2 }, // Japan
      { code: "49", length: 2 }, // Germany
      { code: "33", length: 2 }, // France
      { code: "39", length: 2 }, // Italy
      { code: "34", length: 2 }, // Spain
      { code: "86", length: 2 }, // China
      { code: "82", length: 2 }, // South Korea
    ];

    for (const pattern of countryCodePatterns) {
      if (cleanNumber.startsWith(pattern.code)) {
        return {
          countryCode: pattern.code,
          phone: cleanNumber.substring(pattern.length),
        };
      }
    }

    // Default fallback - assume first 1-3 digits are country code
    const matches = cleanNumber.match(/^(\d{1,3})(\d+)$/);
    if (matches) {
      return {
        countryCode: matches[1],
        phone: matches[2],
      };
    }

    return { countryCode: "", phone: cleanNumber };
  };

  /** ---- Handle Send OTP ---- */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!phoneValue) {
      showMessage("Phone number is required", "error");
      setIsLoading(false);
      return;
    }

    const { countryCode, phone } = parsePhoneNumber(phoneValue);

    if (!countryCode || !phone) {
      showMessage(
        "Please enter a valid phone number with country code",
        "error"
      );
      setIsLoading(false);
      return;
    }

    if (mode === "signup" && !firstName.trim()) {
      showMessage("First name is required", "error");
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
    } catch (error: any) {
      const errorMessage =
        error?.data?.error ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send OTP";

      showMessage(errorMessage, "error");

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
    setMessage(null);
    setIsLoading(true);

    if (!otp) {
      showMessage("OTP is required", "error");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        // Use Supabase verifyOtp for login
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phoneValue,
          token: otp,
          type: "sms",
        });

        if (error) {
          showMessage(error.message || "Invalid OTP", "error");
          setIsLoading(false);
          return;
        }

        console.log("SUPABASE", data);
        showMessage("Login successful!", "success");
        onClose?.();
      } else {
        // Keep existing signup flow
        const { countryCode, phone } = parsePhoneNumber(phoneValue);
        const res = await verifySignupOtp.mutateAsync({
          phone,
          countryCode,
          otp,
          first_name: firstName,
        });

        if (res.user) saveUser(res.user);
        showMessage(res.message || "Signup successful!", "success");
        onClose?.();
      }

      setStep("phone");
      setOtp("");
      setFirstName("");
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
    }
  };

  /** ---- Handle mode switch ---- */
  const handleModeSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
    setStep("phone");
    setMessage(null);
    setPhoneValue("");
    setOtp("");
    setFirstName("");
  };

  /** ---- Handle back to phone step ---- */
  const handleBackToPhone = () => {
    setStep("phone");
    setOtp("");
  };

  // Loading state while checking authentication
  if (authLoading) {
    return (
      <div className="rounded-bl-[10px] rounded-br-[10px]">
        <div className="container pt-[90px] pb-[30px]">
          <div className="flex flex-col items-end">
            <div className="max-w-[400px] w-full h-auto flex justify-center items-center py-[40px]">
              <p className="text-white-1 text-[1.6rem]">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show authenticated user interface
  if (user) {
    return (
      <div className="rounded-bl-[10px] rounded-br-[10px]">
        <div className="container pt-[90px] pb-[30px]">
          <div className="flex flex-col items-end">
            <div className={`max-w-[400px] w-full h-auto ${styles.loginForm}`}>
              <h3 className="text-[2.4rem] font-bold leading-[36px] pt-[20px]">
                Welcome Back!
              </h3>
              <h6 className="text-[1.6rem] leading-[36px] pb-[20px]">
                You&apos;re logged in
              </h6>

              {/* Inline Message Display */}
              {message && (
                <div
                  className={`mb-4 p-3 rounded-md text-sm ${
                    message.type === "success"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : message.type === "error"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-blue-100 text-blue-800 border border-blue-300"
                  }`}
                >
                  {message.text}
                </div>
              )}

              {/* User Profile Info */}
              <div className="flex items-center pb-[10px] mb-[15px]">
                <div className="mr-[10px] flex items-center">
                  <Image
                    src="/icons/sms.svg"
                    alt="Icon"
                    width={20}
                    height={20}
                  />
                </div>
                <div className="flex-1">
                  <p className="text-white-1 text-[1.6rem] font-medium">
                    {user.first_name}
                  </p>
                  <p className="text-white-1 text-[1.2rem] opacity-70">
                    +{user.phone_country_code} {user.phone_number}
                  </p>
                  <p className="text-white-1 text-[1.0rem] opacity-60">
                    Status: {user.phone_verified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
              <div className="border-b-2 border-white-1 mb-[15px]"></div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className={`${styles.submitButton} bg-red-500 hover:bg-red-600 text-white border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? "Signing out..." : "Sign Out"}
                <Image
                  src="/icons/rightArrow.svg"
                  alt="Arrow Icon"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login/register form for unauthenticated users
  return (
    <div className="rounded-bl-[10px] rounded-br-[10px]">
      <div className="container pt-[90px] pb-[30px]">
        <div className="flex flex-col items-end">
          <form
            onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp}
            className={`max-w-[400px] w-full h-auto ${
              mode === "login" ? styles.loginForm : styles.registerForm
            }`}
          >
            <h3 className="text-[2.4rem] font-bold leading-[36px] pt-[20px]">
              {mode === "login" ? "Existing member" : "Register New Account"}
            </h3>
            <h6 className="text-[1.6rem] leading-[36px] pb-[20px]">
              {mode === "login" ? "Welcome Back!" : "Join Us!"}
            </h6>

            {/* Inline Message Display */}
            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : message.type === "error"
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {message.text}
              </div>
            )}

            {step === "phone" && (
              <>
                {/* Phone Input with react-phone-number-input */}
                <div className="mb-[15px]">
                  <PhoneInput
                    placeholder="Enter phone number"
                    value={phoneValue}
                    onChange={setPhoneValue}
                    defaultCountry="IN"
                    disabled={isLoading}
                    className="phone-input-custom"
                  />
                </div>

                {/* First Name Field (Signup only) */}
                {mode === "signup" && (
                  <>
                    <div className="flex items-center pb-[10px]">
                      <div className="mr-[10px] flex items-center">
                        <Image
                          src="/icons/user.svg"
                          alt="Icon"
                          width={20}
                          height={20}
                        />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Enter First Name"
                        className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                    <div className="border-b-2 border-white-1 mb-[15px]"></div>
                  </>
                )}

                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${styles.submitButton} bg-white-1 text-black-1 border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] hover:bg-white-3 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
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
                {/* Display selected phone number */}
                <div className="mb-[15px] p-[10px] bg-gray-800 rounded-[5px]">
                  <p className="text-white-1 text-[1.4rem] opacity-80">
                    OTP sent to: {phoneValue}
                  </p>
                </div>

                {/* OTP Field */}
                <div className="flex items-center pb-[10px]">
                  <div className="mr-[10px] flex items-center">
                    <Image
                      src="/icons/lock.svg"
                      alt="Icon"
                      width={20}
                      height={20}
                    />
                  </div>
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium"
                    value={otp}
                    onChange={(e) => {
                      // Only allow digits and limit to 6 characters
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);
                      setOtp(value);
                    }}
                    disabled={isLoading}
                    maxLength={6}
                  />
                </div>
                <div className="border-b-2 border-white-1 mb-[15px]"></div>

                {/* Verify OTP Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`${styles.submitButton} bg-green-600 hover:bg-green-700 text-white border-none rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] mt-[20px] cursor-pointer w-full flex justify-between items-center gap-[10px] mb-[10px] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Verifying..." : "Verify OTP"}
                  <Image
                    src="/icons/rightArrow.svg"
                    alt="Arrow Icon"
                    width={24}
                    height={24}
                  />
                </button>

                {/* Back to Phone Button */}
                <button
                  type="button"
                  onClick={handleBackToPhone}
                  disabled={isLoading}
                  className="text-[1.2rem] font-medium leading-[21px] text-left text-white-1 hover:underline cursor-pointer mt-[10px] bg-transparent border-none p-0"
                >
                  ← Back to phone number
                </button>
              </>
            )}

            {/* Toggle between Login and Register */}
            {step === "phone" && (
              <p className="text-[1.2rem] font-medium leading-[21px] text-left mt-[20px]">
                {mode === "login"
                  ? "Don&apos;t have an account?"
                  : "Already have an account?"}{" "}
                <span
                  onClick={() =>
                    handleModeSwitch(mode === "login" ? "signup" : "login")
                  }
                  className="text-[1.2rem] font-bold leading-[21px] text-left tracking-[0.02rem] cursor-pointer hover:underline"
                >
                  {mode === "login" ? "Register Now" : "Login"}
                </span>
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Custom CSS for react-phone-number-input */}
      <style jsx global>{`
        .phone-input-custom {
          width: 100%;
          margin-bottom: 15px;
        }

        .phone-input-custom .PhoneInputInput {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 1.6rem;
          font-weight: 500;
          border-bottom: 2px solid white;
          border-radius: 0;
          padding: 8px 0;
          margin-left: 8px;
          width: 100%;
        }

        .phone-input-custom .PhoneInputInput::placeholder {
          color: white;
          opacity: 0.7;
        }

        .phone-input-custom .PhoneInputCountrySelect {
          background: transparent;
          border: none;
          outline: none;
          color: white;
          font-size: 1.4rem;
          cursor: pointer;
          margin-right: 8px;
          border-bottom: 2px solid white;
          padding: 8px 4px;
          border-radius: 0;
        }

        .phone-input-custom .PhoneInputCountrySelect:hover {
          opacity: 0.8;
        }

        .phone-input-custom .PhoneInputCountrySelectArrow {
          color: white;
          opacity: 0.8;
        }

        .phone-input-custom .PhoneInputCountryIcon {
          margin-right: 4px;
        }

        /* Custom dropdown styling */
        .PhoneInputCountrySelect option {
          background: #1a1a1a;
          color: white;
        }
      `}</style>
    </div>
  );
};

export default User;
