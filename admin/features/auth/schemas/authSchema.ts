import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .regex(emailRegex, { message: "Invalid email format" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
