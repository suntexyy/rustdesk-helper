const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../auth/auth.middleware");
const { getStats } = require("./dashboard.controller");

// 🔒 every route in this file is admin only
router.use(protectAdmin);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Dashboard statistics (admin only)
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Totals, requests per day and recent help requests
 */
router.get("/stats", getStats);

module.exports = router;
