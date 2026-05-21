import { z } from "zod";
export const schema = z.object({
  name: z.string().min(1, "Group name is required"),
  code: z.string().length(6, "Code must be exactly 6 characters"),
});
export interface Student {
  socketId: string;
  name: string;
  rustdeskId: string;
  password: string;
  avatar?: string;
  status: "idle" | "waiting" | "ongoing";
}
