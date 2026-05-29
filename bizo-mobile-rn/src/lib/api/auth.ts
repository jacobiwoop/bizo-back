import { api } from "@/src/lib/api/client";
import { ApiMessageResponse, ApiUser, AuthResponse } from "@/src/lib/api/types";

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  password_confirmation: string;
  display_name: string;
  username?: string | null;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type SendPasswordOtpPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

export type ResetPasswordWithOtpPayload = {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
};

function unwrapData<T>(payload: T | { data: T }): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function logout(): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/auth/logout");
  return response.data;
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/auth/password/reset", payload);
  return response.data;
}

export async function sendPasswordOtp(payload: SendPasswordOtpPayload): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/auth/password/otp/send", payload);
  return response.data;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/auth/password/update", payload);
  return response.data;
}

export async function resetPasswordWithOtp(payload: ResetPasswordWithOtpPayload): Promise<ApiMessageResponse> {
  const response = await api.post<ApiMessageResponse>("/auth/password/otp/reset", payload);
  return response.data;
}

export async function getProfile(): Promise<ApiUser> {
  const response = await api.get<ApiUser | { data: ApiUser }>("/profile");
  return unwrapData<ApiUser>(response.data);
}
