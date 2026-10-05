import { safeFetch } from "@/features/lib/apiClient";
import { MeResponse, LogoutResponse, DashboardStats } from "./dashboardTypes";

type StatsResponse = { success: boolean; data: DashboardStats };

export const getMe = () => {
  return safeFetch<MeResponse>("/api/auth/me");
};

export const logout = () => {
  return safeFetch<LogoutResponse>("/api/auth/logout", {
    method: "POST",
  });
};

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const start = new Date();
  start.setHours(0, 0, 0, 0); // midnight today in the admin's timezone

  const qs = new URLSearchParams({
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    since: start.toISOString(),
  });

  const res = await safeFetch<StatsResponse>(`/api/dashboard/stats?${qs}`);
  return res.data;
};
