const { z } = require("zod");
const AppError = require("../../utils/AppError");

// ── Schemas ──
const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email format")
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: "Password is required" })
    .min(8, "Password must be at least 8 characters"),
});

// ── Middleware factory ──
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const message = result.error.errors.map((e) => e.message).join(", ");
    return next(new AppError(message, 400));
  }

  req.body = result.data; // use sanitized/transformed data
  next();
};

const changePasswordSchema = z
  .object({
    currentPassword: z
      .string({ required_error: "Current password is required" })
      .min(1, "Current password is required"),
    newPassword: z
      .string({ required_error: "New password is required" })
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "New password must contain uppercase, lowercase, and a number",
      ),
    confirmPassword: z.string({
      required_error: "Please confirm your new password",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

// Add to exports
module.exports = {
  validateLogin: validate(loginSchema),
  validateChangePassword: validate(changePasswordSchema), // ← add
};
