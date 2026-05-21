import { safeFetch } from "@/features/lib/apiClient";
import { LoginPayload, LoginResponse } from "../types/authTypes";

export const login = (payload: LoginPayload) => {
  return safeFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
