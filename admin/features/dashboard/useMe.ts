import { useQuery } from "@tanstack/react-query";
import { MeResponse } from "./dashboardTypes";
import { getMe } from "./dashboardApi";

export const useMe = () => {
  return useQuery<MeResponse, Error>({
    queryKey: ["me"],
    queryFn: getMe,
    retry: false, // important for auth checks
  });
};
