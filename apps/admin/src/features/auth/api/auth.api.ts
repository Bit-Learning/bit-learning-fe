import type { AxiosResponse } from "axios";
import api from "@/shared/api/api";
import { endpoints } from "@/shared/constants/endpoints";
import type { TAdminLoginRequest, TAdminLoginResponse, TAdminUser, TRefreshTokenRequest } from "../types/auth.types";

// Admin login - Only accepts ADMIN role
export function AdminLogin(requestBody: TAdminLoginRequest): Promise<AxiosResponse<{ data: TAdminLoginResponse }>> {
  // Force ADMIN role for admin panel login
  return api.post(`${endpoints.AUTH}/login-user`, {
    ...requestBody,
    role: "MANAGER", // Always use ADMIN role
  });
}

export function RefreshToken(requestBody: TRefreshTokenRequest): Promise<AxiosResponse<{ data: TAdminLoginResponse }>> {
  return api.post(`${endpoints.AUTH}/refresh-token`, requestBody);
}

export function GetAdminProfile(): Promise<AxiosResponse<{ data: TAdminUser }>> {
  return api.get(`${endpoints.ACCOUNT}/profile`);
}

export function Logout(): Promise<AxiosResponse<any>> {
  return api.post(`${endpoints.AUTH}/logout`);
}
