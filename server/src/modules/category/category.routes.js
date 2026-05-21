const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../auth/auth.middleware");

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("./category.controller");

/**
 * @swagger
 * tags:
 *   name: Category
 *   description: Category management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       required:
 *         - title
 *         - example
 *         - color
 *       properties:
 *         title:
 *           type: string
 *           example: example title
 *         example:
 *           type: string
 *           maxLength: 500
 *           example: Example text here
 *         color:
 *           type: string
 *           pattern: '^#([0-9A-Fa-f]{6})$'
 *           example: "#FF5733"
 *
 *     Category:
 *       allOf:
 *         - $ref: '#/components/schemas/CategoryInput'
 *         - type: object
 *           properties:
 *             _id:
 *               type: string
 *               example: 64f1a2b3c4d5e6f7a8b9c0d1
 *             createdAt:
 *               type: string
 *               format: date-time
 *             updatedAt:
 *               type: string
 *               format: date-time
 */

/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get all categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: List of categories
 */
router.get("/", getAllCategories);
router.get("/:id", getCategoryById);

//
// 🔒 ADMIN ROUTES
//
router.use(protectAdmin);

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create category (admin only)
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category created
 */
router.post("/", createCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   put:
 *     summary: Update category (admin only)
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.put("/:id", updateCategory);

/**
 * @swagger
 * /api/category/{id}:
 *   delete:
 *     summary: Delete category (admin only)
 *     tags: [Category]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 */
router.delete("/:id", deleteCategory);

module.exports = router;
