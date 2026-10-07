const express = require("express");
const router = express.Router();

const { protectAdmin } = require("../auth/auth.middleware");
const { getStats } = require("./dashboard.controller");

// 🔒 every route in this file is admin only
router.use(protectAdmin);
const jwt = require("jsonwebtoken");

router.get("/socket-token", (req, res) => {
  const secret = process.env.SOCKET_JWT_SECRET;
  if (!secret) {
    return res
      .status(500)
      .json({ success: false, message: "Socket auth is not configured" });
  }
  const token = jwt.sign({ role: "admin" }, secret, { expiresIn: "5m" });
  res.set("Cache-Control", "no-store");
  res.json({ success: true, data: { token } });
});

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
