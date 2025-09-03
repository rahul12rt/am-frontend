"use client";
import { useMutation } from "@tanstack/react-query";
import {
  unprotectedApiClient,
  handleApiError,
  tokenManager,
} from "@/lib/api-clients";
import { AxiosError } from "axios";

// Types
export interface SendOtpPayload {
  phone: string;
  countryCode: string;
}

export interface VerifyOtpSignupPayload extends SendOtpPayload {
  otp: string;
  first_name: string;
}

export interface VerifyOtpLoginPayload extends SendOtpPayload {
  otp: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  refreshToken?: string;
  user?: {
    id: string;
    phone: string;
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
  const res = await unprotectedApiClient.post(
    "/auth/signup/verify-otp",
    payload
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
    onSuccess: (data) => {
      if (data.token) {
        tokenManager.setToken(data.token);
        if (data.refreshToken) tokenManager.setRefreshToken(data.refreshToken);
      }
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
    onSuccess: (data) => {
      if (data.token) {
        tokenManager.setToken(data.token);
        if (data.refreshToken) tokenManager.setRefreshToken(data.refreshToken);
      }
    },
    onError: (error: AxiosError) => {
      console.error("Login OTP verify failed:", handleApiError(error));
    },
  });
