const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const { protectAdmin } = require("./auth.middleware");
const { validateLogin, validateChangePassword } = require("./auth.validation");

// ─────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@rustdesk-helper.ge
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: Admin1234!
 *     responses:
 *       200:
 *         description: Login successful — sets accessToken and refreshToken cookies
 *         headers:
 *           Set-Cookie:
 *             description: accessToken (15min) and refreshToken (7d) HTTP-only cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminProfile'
 *       400:
 *         description: Validation error — missing or invalid fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       423:
 *         description: Account locked — too many failed attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/login", validateLogin, authController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Silently rotate access token using refresh token cookie
 *     tags: [Auth]
 *     description: No request body needed. Reads refreshToken from HTTP-only cookie automatically.
 *     responses:
 *       200:
 *         description: New accessToken and refreshToken cookies issued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Invalid, expired, or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh", authController.refresh);

// ─────────────────────────────────────────────
// PROTECTED ROUTES
// ─────────────────────────────────────────────
router.use(protectAdmin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in admin profile
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current admin data — always fresh from DB
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AdminProfile'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authController.getMe);

/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     summary: Change own password
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: Admin1234!
 *               newPassword:
 *                 type: string
 *                 example: NewPassword456!
 *               confirmPassword:
 *                 type: string
 *                 example: NewPassword456!
 *     responses:
 *       200:
 *         description: Password changed — all sessions cleared, must log in again
 *       400:
 *         description: Validation error or passwords do not match
 *       401:
 *         description: Current password is incorrect
 */
router.patch(
  "/change-password",
  validateChangePassword,
  authController.changePassword,
);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from current device
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     description: Removes only this device session. Other active sessions remain.
 *     responses:
 *       200:
 *         description: Logged out — both cookies cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     description: Wipes all sessions for this admin. Every device is signed out immediately.
 *     responses:
 *       200:
 *         description: All sessions terminated — both cookies cleared
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout-all", authController.logoutAll);

// ─────────────────────────────────────────────
// SUPERADMIN only routes
// ─────────────────────────────────────────────

/**
 * Example: GET /api/auth/sessions
 * View active sessions of any admin (superadmin only)
 * Uncomment when you build admin management features
 */
// router.get(
//   "/sessions/:adminId",
//   authorizeRoles("superadmin"),
//   authController.getAdminSessions
// );

/**
 * Example: DELETE /api/auth/sessions/:adminId
 * Force logout any admin (superadmin only)
 */
// router.delete(
//   "/sessions/:adminId",
//   authorizeRoles("superadmin"),
//   authController.forceLogout
// );

module.exports = router;
