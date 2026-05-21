import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogoutResponse } from "./dashboardTypes";
import { logout } from "./dashboardApi";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation<LogoutResponse, Error>({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all queries related to the logged-in user
      queryClient.removeQueries({ queryKey: ["me"] });
      queryClient.clear();
      
      // Redirect to login page
      router.push("/login");
    },
  });
};
