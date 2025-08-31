"use client";

import {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  useCallback,
} from "react";
import Image from "next/image";
import styles from "./User.module.scss";
import { toast, Toaster } from "react-hot-toast";

interface UserProps {
  onClose?: () => void;
}

interface User {
  id: string;
  phone: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
  error?: string;
  code?: string;
}

const User = ({ onClose }: UserProps) => {
  const [formData, setFormData] = useState({
    phone: "",
    otp: "",
  });
  const [errors, setErrors] = useState<{ phone?: string; otp?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

  // Check if user is logged in by checking localStorage
  const checkAuthStatus = useCallback(() => {
    setAuthLoading(true);
    try {
      const userSession = localStorage.getItem("user_session");
      const userData = localStorage.getItem("user_data");

      if (userSession && userData) {
        const session = JSON.parse(userSession);
        const user = JSON.parse(userData);

        if (session.expires_at && Date.now() < session.expires_at * 1000) {
          setUser(user);
        } else {
          localStorage.removeItem("user_session");
          localStorage.removeItem("user_data");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error checking auth status:", error);
      setUser(null);
    }
    setAuthLoading(false);
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validatePhone = (): boolean => {
    if (!formData.phone.trim()) {
      setErrors({ phone: "Phone number is required" });
      return false;
    } else if (!/^\d{10}$/.test(formData.phone)) {
      setErrors({ phone: "Enter a valid 10-digit phone number" });
      return false;
    }
    return true;
  };

  const handleSendOtp = async () => {
    if (!validatePhone()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Failed to send OTP");
        return;
      }

      toast.success("OTP sent successfully!");
      setOtpSent(true);
    } catch (error) {
      console.error("OTP request error:", error);
      toast.error("Network error. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.otp.trim()) {
      setErrors({ otp: "OTP is required" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          otp: formData.otp,
        }),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        toast.error(data.error || "Invalid OTP");
        return;
      }

      if (data.user && data.session) {
        localStorage.setItem("user_data", JSON.stringify(data.user));
        localStorage.setItem("user_session", JSON.stringify(data.session));
        setUser(data.user);
        toast.success("Login successful!");
        onClose?.();
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem("user_session");
      localStorage.removeItem("user_data");
      setUser(null);
      setFormData({ phone: "", otp: "" });
      setOtpSent(false);
      toast.success("Signed out successfully!");
      onClose?.();
    } catch (error) {
      toast.error("An error occurred while signing out");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

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

  if (user) {
    return (
      <div className="rounded-bl-[10px] rounded-br-[10px]">
        <div className="container pt-[90px] pb-[30px]">
          <Toaster position="top-right" reverseOrder={false} />
          <div className="flex flex-col items-end">
            <div className={`max-w-[400px] w-full h-auto ${styles.loginForm}`}>
              <h3 className="text-[2.4rem] font-bold pt-[20px]">Welcome!</h3>
              <h6 className="text-[1.6rem] pb-[20px]">
                Logged in with {user.phone}
              </h6>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600 text-white rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] w-full mb-[10px]"
              >
                {isLoading ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-bl-[10px] rounded-br-[10px]">
      <div className="container pt-[90px] pb-[30px]">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="flex flex-col items-end">
          <form
            onSubmit={handleVerifyOtp}
            className={`max-w-[400px] w-full h-auto ${styles.loginForm}`}
          >
            <h3 className="text-[2.4rem] font-bold pt-[20px]">
              Mobile OTP Login
            </h3>
            <h6 className="text-[1.6rem] pb-[20px]">Quick & Secure</h6>

            {/* Phone Number */}
            <div className="flex item-center pb-[10px]">
              <div className="mr-[10px] flex item-center">
                <Image src="/icons/sms.svg" alt="Icon" width={20} height={20} />
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Enter Mobile Number"
                className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={isLoading || otpSent}
              />
            </div>
            {errors.phone && (
              <p className="text-red-2 text-[1rem] mb-[4px]">{errors.phone}</p>
            )}
            <div className="border-b-2 border-white-1 mb-[15px]"></div>

            {/* OTP */}
            {otpSent && (
              <>
                <div className="flex item-center pb-[10px]">
                  <div className="mr-[10px] flex item-center">
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
                    className="bg-transparent border-none outline-none text-white-1 text-[1.6rem] w-full"
                    value={formData.otp}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                {errors.otp && (
                  <p className="text-red-2 text-[1rem] mb-[4px]">
                    {errors.otp}
                  </p>
                )}
                <div className="border-b-2 border-white-1 mb-[15px]"></div>
              </>
            )}

            {/* Button */}
            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="bg-white-1 text-black-1 rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] w-full mb-[10px]"
              >
                {isLoading ? "Sending..." : "Send OTP"}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="bg-white-1 text-black-1 rounded-[5px] text-[1.6rem] font-bold py-[12px] px-[24px] w-full mb-[10px]"
              >
                {isLoading ? "Verifying..." : "Verify OTP"}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default User;
