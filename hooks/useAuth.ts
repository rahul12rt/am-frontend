"use client";
import { useMutation } from "@tanstack/react-query";
import {
  unprotectedApiClient,
  handleApiError,
} from "@/lib/api-clients";
import { createClient } from "@/lib/supabase";
import { AxiosError } from "axios";

// Types
export interface SendOtpPayload {
  phone: string;
  countryCode: string;
}

export interface VerifyOtpSignupPayload extends SendOtpPayload {
  otp: string;
  first_name: string;
  supabase_id?: string;
}

export interface VerifyOtpLoginPayload extends SendOtpPayload {
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    supabase_id?: string;
    phone_number: string;
    first_name?: string;
  };
}

// API calls
const sendSignupOtp = async (
  payload: SendOtpPayload
): Promise<AuthResponse> => {
  const res = await unprotectedApiClient.post("/auth/signup/send-otp", payload);
  return res.data;
};

const verifySignupOtp = async (
  payload: VerifyOtpSignupPayload
): Promise<AuthResponse> => {
  const supabase = createClient();

  // First verify OTP with Supabase to establish session
  const e164Phone = `+${payload.countryCode}${payload.phone}`;
  const { data: supabaseData, error: supabaseError } = await supabase.auth.verifyOtp({
    phone: e164Phone,
    token: payload.otp,
    type: 'sms'
  });

  if (supabaseError) {
    throw new Error(supabaseError.message || 'OTP verification failed');
  }

  // Extract supabase_id from the response
  const supabaseUserId = supabaseData?.user?.id;
  if (!supabaseUserId) {
    throw new Error('Failed to get Supabase user ID');
  }

  // Then create user record in backend database with supabase_id
  const res = await unprotectedApiClient.post(
    "/auth/signup/verify-otp",
    {
      ...payload,
      supabase_id: supabaseUserId
    }
  );

  return res.data;
};

const sendLoginOtp = async (payload: SendOtpPayload): Promise<AuthResponse> => {
  const res = await unprotectedApiClient.post("/auth/login/send-otp", payload);
  return res.data;
};

const verifyLoginOtp = async (
  payload: VerifyOtpLoginPayload
): Promise<AuthResponse> => {
  const supabase = createClient();

  // First verify OTP with Supabase to establish session
  const e164Phone = `+${payload.countryCode}${payload.phone}`;
  const { data: supabaseData, error: supabaseError } = await supabase.auth.verifyOtp({
    phone: e164Phone,
    token: payload.otp,
    type: 'sms'
  });

  if (supabaseError) {
    throw new Error(supabaseError.message || 'OTP verification failed');
  }

  // Then verify with backend (without redundant Supabase verification)
  const res = await unprotectedApiClient.post(
    "/auth/login/verify-otp",
    payload
  );

  return res.data;
};

// Hooks
export const useSendSignupOtp = () =>
  useMutation({
    mutationFn: sendSignupOtp,
    onError: (error: AxiosError) => {
      console.error("Signup OTP send failed:", handleApiError(error));
    },
  });

export const useVerifySignupOtp = () =>
  useMutation({
    mutationFn: verifySignupOtp,
    onSuccess: async (data) => {
      console.log("Signup successful:", data.message);
      // Small delay to ensure session is properly established
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    onError: (error: AxiosError) => {
      console.error("Signup OTP verify failed:", handleApiError(error));
    },
  });

export const useSendLoginOtp = () =>
  useMutation({
    mutationFn: sendLoginOtp,
    onError: (error: AxiosError) => {
      console.error("Login OTP send failed:", handleApiError(error));
    },
  });

export const useVerifyLoginOtp = () =>
  useMutation({
    mutationFn: verifyLoginOtp,
    onSuccess: async (data) => {
      console.log("Login successful:", data.message);
      // Small delay to ensure session is properly established
      await new Promise(resolve => setTimeout(resolve, 100));
    },
    onError: (error: AxiosError) => {
      console.error("Login OTP verify failed:", handleApiError(error));
    },
  });
