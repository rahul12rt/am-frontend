"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";
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

  // Changed from separate phone and countryCode to single phoneValue
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

  /** ---- Load user from localStorage and check Supabase session ---- */
  useEffect(() => {
    setAuthLoading(true);

    const checkAuthStatus = async () => {
      try {
        // First check localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setAuthLoading(false);
          return;
        }

        // Check Supabase session if no localStorage data
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          // Create user profile from session data
          const phoneNumber = session.user.phone;
          let parsedPhone = null;

          if (phoneNumber) {
            parsedPhone = parsePhoneForApi(phoneNumber);
          }

          const userProfile: UserProfile = {
            first_name: session.user.user_metadata?.first_name || "User",
            phone_country_code: parsedPhone?.countryCode || "",
            phone_number: parsedPhone?.phone || phoneNumber || "",
            phone_verified: session.user.phone_confirmed_at ? true : false,
          };

          saveUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setUser(null);
      }
      setAuthLoading(false);
    };

    checkAuthStatus();
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
      localStorage.removeItem("user"); // Clear localStorage
      await supabase.auth.signOut(); // Properly await signOut
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

  /** ---- Parse phone number to get country code and national number ---- */
  const parsePhoneForApi = (phoneValue: string) => {
    try {
      const phoneNumber = parsePhoneNumber(phoneValue);
      if (phoneNumber) {
        return {
          countryCode: phoneNumber.countryCallingCode,
          phone: phoneNumber.nationalNumber,
        };
      }
    } catch (error) {
      console.error("Error parsing phone number:", error);
    }
    return null;
  };

  /** ---- Handle Send OTP ---- */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages
    setIsLoading(true);

    if (!phoneValue) {
      showMessage("Phone number is required", "error");
      setIsLoading(false);
      return;
    }

    const parsedPhone = parsePhoneForApi(phoneValue);
    if (!parsedPhone) {
      showMessage("Please enter a valid phone number", "error");
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
        await sendSignupOtp.mutateAsync({
          phone: parsedPhone.phone,
          countryCode: parsedPhone.countryCode,
        });
      } else {
        await sendLoginOtp.mutateAsync({
          phone: parsedPhone.phone,
          countryCode: parsedPhone.countryCode,
        });
      }
      showMessage("OTP sent successfully", "success");
      setStep("otp");
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
    setMessage(null);
    setIsLoading(true);

    if (!otp) {
      showMessage("OTP is required", "error");
      setIsLoading(false);
      return;
    }

    const parsedPhone = parsePhoneForApi(phoneValue);
    if (!parsedPhone) {
      showMessage("Invalid phone number", "error");
      setIsLoading(false);
      return;
    }

    try {
      if (mode === "login") {
        // Use Supabase verifyOtp for login
        const { data, error } = await supabase.auth.verifyOtp({
          phone: phoneValue, // Already in E.164 format
          token: otp,
          type: "sms",
        });

        if (error) {
          showMessage(error.message || "Invalid OTP", "error");
          setIsLoading(false);
          return;
        }

        console.log("SUPABASE", data);

        // You may want to get user or session info here:
        // const { data: sessionData } = await supabase.auth.getSession();

        showMessage("Login successful!", "success");
        onClose?.();
        setStep("phone");
        setOtp("");
        setFirstName("");
      } else {
        // Keep your existing signup flow
        const res = await verifySignupOtp.mutateAsync({
          phone: parsedPhone.phone,
          countryCode: parsedPhone.countryCode,
          otp,
          first_name: firstName,
        });
        if (res.user) saveUser(res.user);
        showMessage(res.message || "Signup successful!", "success");
        onClose?.();
        setStep("phone");
        setOtp("");
        setFirstName("");
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
    }
  };

  /** ---- Handle mode switch ---- */
  const handleModeSwitch = (newMode: "login" | "signup") => {
    setMode(newMode);
    setStep("phone");
    setMessage(null); // Clear messages when switching modes
    setPhoneValue("");
    setOtp("");
    setFirstName("");
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
                  className={`mb-4 p-3 rounded-md text-[12px] ${
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
                className={`mb-4 p-3 rounded-md text-[12px] ${
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
                {/* Phone Number Input with Country Selector */}
                <div className="flex items-center pb-[10px] mb-[15px]">
                  <div className="flex-1">
                    <PhoneInput
                      placeholder="Enter phone number"
                      value={phoneValue}
                      onChange={(value) => setPhoneValue(value || "")}
                      defaultCountry="IN"
                      disabled={isLoading}
                      className="phone-input-custom"
                    />
                  </div>
                </div>
                <div className="border-b-2 border-white-1 mb-[15px]"></div>

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
                {/* OTP Field */}
                <div className="flex items-center pb-[10px]">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter OTP"
                    className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full placeholder:text-white-1 font-medium"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={isLoading}
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
                  onClick={() => setStep("phone")}
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
                  ? "Don't have an account?"
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

      {/* Custom styles for PhoneInput to match your design */}
      <style jsx global>{`
        .phone-input-custom {
          width: 100%;
        }

        .phone-input-custom input {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          color: var(--white-1) !important;
          font-size: 1.6rem !important;
          font-weight: 500 !important;
          width: 100% !important;
        }

        .phone-input-custom input::placeholder {
          color: var(--white-1) !important;
          opacity: 0.7;
        }

        .phone-input-custom .PhoneInputCountry {
          margin-right: 10px;
        }

        .phone-input-custom .PhoneInputCountryIcon {
          width: 20px;
          height: 15px;
        }

        .phone-input-custom .PhoneInputCountrySelect {
          background: transparent !important;
          border: none !important;
          color: var(--white-1) !important;
          margin-right: 5px;
        }

        .phone-input-custom .PhoneInputCountrySelectArrow {
          color: var(--white-1) !important;
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
};

export default User;
