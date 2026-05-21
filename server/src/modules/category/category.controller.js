const categoryService = require("./category.service");
const {
  createCategorySchema,
  updateCategorySchema,
  idParamSchema,
} = require("./category.validation");
const AppError = require("../../utils/AppError");

const validate = (schema, payload) => {
  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(", ");
    throw new AppError(message, 400);
  }

  return parsed.data;
};

const getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      status: "success",
      data: { categories },
    });
  } catch (err) {
    next(err);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    validate(idParamSchema, req.params);
    const category = await categoryService.getCategoryById(req.params.id);

    res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const validBody = validate(createCategorySchema, req.body);
    const category = await categoryService.createCategory(validBody);

    res.status(201).json({
      status: "success",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    validate(idParamSchema, req.params);
    const validBody = validate(updateCategorySchema, req.body);
    const category = await categoryService.updateCategory(
      req.params.id,
      validBody,
    );

    res.status(200).json({
      status: "success",
      data: { category },
    });
  } catch (err) {
    next(err);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    validate(idParamSchema, req.params);
    await categoryService.deleteCategory(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
