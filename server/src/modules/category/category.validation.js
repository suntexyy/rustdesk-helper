const { z } = require("zod");

// HEX color regex
const hexColorRegex = /^#([0-9A-Fa-f]{6})$/;

const createCategorySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or fewer"),
    example: z.string().trim().min(1, "Example is required").max(500),
    color: z.string().regex(hexColorRegex, {
      message: "Color must be a valid HEX code (e.g. #FFFFFF)",
    }),
  })
  .strict();

const updateCategorySchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(100, "Title must be 100 characters or fewer"),
    example: z.string().trim().min(1, "Example is required").max(500),
    color: z.string().regex(hexColorRegex, {
      message: "Color must be a valid HEX code (e.g. #FFFFFF)",
    }),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })
  .strict();

const idParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id"),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
};
