import { useMutation } from "@tanstack/react-query";
import { LoginPayload, LoginResponse } from "../types/authTypes";
import { login } from "../api/authApi";

export const useLogin = () => {
  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: login,
  });
};
