import { User } from "../auth/types/authTypes";

export interface MeResponse {
  success: boolean;
  message: string;
  data: User;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
