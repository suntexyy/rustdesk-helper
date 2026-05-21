import { safeFetch } from "@/features/lib/apiClient";
import { MeResponse, LogoutResponse } from "./dashboardTypes";

export const getMe = () => {
  return safeFetch<MeResponse>("/api/auth/me");
};

export const logout = () => {
  return safeFetch<LogoutResponse>("/api/auth/logout", {
    method: "POST",
  });
};
