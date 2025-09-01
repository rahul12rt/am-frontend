"use client";
import { useEffect, useState } from "react";
import styles from "./User.module.scss";
import { toast, Toaster } from "react-hot-toast";
import {
  useSendSignupOtp,
  useVerifySignupOtp,
  useSendLoginOtp,
  useVerifyLoginOtp,
} from "@/hooks/useAuth";
import { tokenManager } from "@/lib/api-clients";

interface UserProfile {
  first_name: string;
  phone_country_code: string;
  phone_number: string;
  phone_verified: boolean;
}

const User = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");

  const [user, setUser] = useState<UserProfile | null>(null);

  // Mutations
  const sendSignupOtp = useSendSignupOtp();
  const verifySignupOtp = useVerifySignupOtp();
  const sendLoginOtp = useSendLoginOtp();
  const verifyLoginOtp = useVerifyLoginOtp();

  /** ---- Load user from localStorage ---- */
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  /** ---- Save user to localStorage when logged in ---- */
  const saveUser = (userData: UserProfile) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  /** ---- Clear user (Sign out) ---- */
  const handleSignOut = () => {
    tokenManager.clearTokens();
    setUser(null);
    localStorage.removeItem("user");
    setMode("login");
    setStep("phone");
    setPhone("");
    setOtp("");
    setFirstName("");
    toast.success("Signed out successfully");
  };

  /** ---- Handle Send OTP ---- */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }

    try {
      if (mode === "signup") {
        await sendSignupOtp.mutateAsync({ phone, countryCode });
      } else {
        await sendLoginOtp.mutateAsync({ phone, countryCode });
      }
      toast.success("OTP sent successfully");
      setStep("otp");
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  /** ---- Handle Verify OTP ---- */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    try {
      if (mode === "signup") {
        const res = await verifySignupOtp.mutateAsync({
          phone,
          countryCode,
          otp,
          first_name: firstName,
        });
        if (res.user) saveUser(res.user);
        toast.success(res.message || "Signup successful");
      } else {
        const res = await verifyLoginOtp.mutateAsync({
          phone,
          countryCode,
          otp,
        });
        if (res.user) saveUser(res.user);
        toast.success(res.message || "Login successful");
      }
      setStep("phone");
      setOtp("");
      setFirstName("");
    } catch {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="rounded-bl-[10px] rounded-br-[10px]">
      <div className="container pt-[30px] pb-[30px]">
        <Toaster position="top-right" reverseOrder={false} />

        {!user ? (
          <form
            onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp}
            className={`max-w-[400px] w-full h-auto p-5 shadow-md rounded-md bg-white text-black ${styles.loginForm}`}
          >
            <h2 className="text-xl font-semibold mb-4">
              {mode === "login" ? "Login" : "Sign Up"}
            </h2>

            {step === "phone" && (
              <>
                <input
                  type="text"
                  placeholder="Country Code (e.g., 91)"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="border p-2 w-full mb-3 rounded"
                />
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border p-2 w-full mb-3 rounded"
                />
                {mode === "signup" && (
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="border p-2 w-full mb-3 rounded"
                  />
                )}
                <button
                  type="submit"
                  disabled={sendSignupOtp.isPending || sendLoginOtp.isPending}
                  className="bg-black text-white px-4 py-2 rounded w-full"
                >
                  {sendSignupOtp.isPending || sendLoginOtp.isPending
                    ? "Sending..."
                    : "Send OTP"}
                </button>
              </>
            )}

            {step === "otp" && (
              <>
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="border p-2 w-full mb-3 rounded"
                />
                <button
                  type="submit"
                  disabled={
                    verifySignupOtp.isPending || verifyLoginOtp.isPending
                  }
                  className="bg-green-600 text-white px-4 py-2 rounded w-full"
                >
                  {verifySignupOtp.isPending || verifyLoginOtp.isPending
                    ? "Verifying..."
                    : "Verify OTP"}
                </button>
              </>
            )}

            <p className="text-sm mt-4 text-center">
              {mode === "login" ? (
                <>
                  Don’t have an account?{" "}
                  <span
                    onClick={() => {
                      setMode("signup");
                      setStep("phone");
                    }}
                    className="text-blue-600 cursor-pointer"
                  >
                    Sign Up
                  </span>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <span
                    onClick={() => {
                      setMode("login");
                      setStep("phone");
                    }}
                    className="text-blue-600 cursor-pointer"
                  >
                    Login
                  </span>
                </>
              )}
            </p>
          </form>
        ) : (
          <div className="max-w-[400px] w-full p-5 shadow-md rounded-md bg-white text-black text-center">
            <h2 className="text-xl font-semibold mb-4">Profile</h2>
            <p className="mb-2">
              <strong>Name:</strong> {user.first_name}
            </p>
            <p className="mb-2">
              <strong>Phone:</strong> +{user.phone_country_code}{" "}
              {user.phone_number}
            </p>
            <p className="mb-4">
              <strong>Verified:</strong> {user.phone_verified ? "Yes" : "No"}
            </p>
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded w-full"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default User;
