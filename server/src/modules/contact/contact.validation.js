const { z } = require("zod");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const contactSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, "Name is required")
    .max(20, "Name must be at most 20 characters"),

  lastName: z
    .string({ required_error: "Last name is required" })
    .min(1, "Last name is required")
    .max(25, "Last name must be at most 25 characters"),

  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .toLowerCase()
    .regex(emailRegex, "Invalid email address"),

  phone: z
    .string({ required_error: "Phone is required" })
    .regex(/^\d{9}$/, "Phone must be exactly 9 digits"),

  message: z
    .string({ required_error: "Message is required" })
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters"),
});

module.exports = { contactSchema };
