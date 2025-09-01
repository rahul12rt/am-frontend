"use client";

import { useState } from "react";
import styles from "./User.module.scss";
import { toast, Toaster } from "react-hot-toast";
import {
  useSendSignupOtp,
  useVerifySignupOtp,
  useSendLoginOtp,
  useVerifyLoginOtp,
} from "@/hooks/useAuth";

const User = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [step, setStep] = useState<"phone" | "otp">("phone");

  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");

  // Mutations
  const sendSignupOtp = useSendSignupOtp();
  const verifySignupOtp = useVerifySignupOtp();
  const sendLoginOtp = useSendLoginOtp();
  const verifyLoginOtp = useVerifyLoginOtp();

  // Handlers
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
    } catch (error) {
      toast.error("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    try {
      if (mode === "signup") {
        await verifySignupOtp.mutateAsync({
          phone,
          countryCode,
          otp,
          first_name: firstName,
        });
        toast.success("Signup successful");
      } else {
        await verifyLoginOtp.mutateAsync({ phone, countryCode, otp });
        toast.success("Login successful");
      }
      setStep("phone");
    } catch (error) {
      toast.error("Invalid OTP");
    }
  };

  return (
    <div className="rounded-bl-[10px] rounded-br-[10px]">
      <div className="container pt-[90px] pb-[30px]">
        <Toaster position="top-right" reverseOrder={false} />
        <div className="flex flex-col items-end">
          <form
            onSubmit={step === "phone" ? handleSendOtp : handleVerifyOtp}
            className={`max-w-[400px] w-full h-auto p-5 shadow-md rounded-md bg-white ${styles.loginForm}`}
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
        </div>
      </div>
    </div>
  );
};

export default User;
