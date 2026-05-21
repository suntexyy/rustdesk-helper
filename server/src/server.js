// const dotenv = require("dotenv");
// const path = require("path");

// ── MUST be first — before any other require that needs env vars ──
// dotenv.config({ path: path.join(__dirname, "../.env") });
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const groupRoutes = require("./modules/group/group.routes");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");
const http = require("http");
const { Server } = require("socket.io");
const dbConnect = require("./config/dbConnect");
const errorHandler = require("./middlewares/errorHandler");
const AppError = require("./utils/AppError");
const seedAdmin = require("./scripts/seedAdmin");

// ── Route imports ──
const authRoutes = require("./modules/auth/auth.routes");
const contactRoutes = require("./modules/contact/contact.routes");
const categoryRoutes = require("./modules/category/category.routes");

// DNS resolution fix for environments with DNS issues (e.g. some Docker setups)
const { setServers } = require("node:dns/promises");
setServers(["1.1.1.1", "8.8.8.8"]);

const app = express();
const server = http.createServer(app);

const normalizeOrigin = (value) => {
  if (!value || typeof value !== "string") return "";
  return value
    .trim()
    .replace(/^['\"]|['\"]$/g, "")
    .replace(/\/$/, "");
};

const allowedOrigins = new Set(
  [
    process.env.CLIENT_URL,
    process.env.ADMIN_URL,
    "http://localhost:3000",
    "http://localhost:3001",
  ]
    .map(normalizeOrigin)
    .filter(Boolean),
);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no Origin header) and same-origin calls.
    if (!origin) return callback(null, true);

    const normalizedRequestOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedRequestOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ─────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────
app.use(helmet());
app.use(express.json({ limit: "10kb" })); // prevent large payload attacks
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/**
 * @swagger
 * /:
 *   get:
 *     summary: Server health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is up and running
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: API is running
 *                 environment:
 *                   type: string
 *                   example: development
 */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    environment: process.env.NODE_ENV || "development",
  });
});

// ─────────────────────────────────────────────
// Swagger
// ─────────────────────────────────────────────
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "rustdesk-helper API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
  }),
);

app.get("/api/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// socket

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000", // client
      "http://localhost:3001", // admin
    ],
    credentials: true,
  },
});

require("./socket")(io);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/groups", groupRoutes);

// ─────────────────────────────────────────────
// 404 Handler — unmatched routes
// ─────────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use(errorHandler);

// ─────────────────────────────────────────────
// Cron: purge expired sessions daily at midnight
// ─────────────────────────────────────────────
const scheduleCronJobs = () => {
  cron.schedule("0 0 * * *", async () => {
    try {
      const Admin = require("./modules/auth/auth.model");
      await Admin.purgeExpiredSessions();
      console.log("✅ Cron: Expired sessions purged");
    } catch (err) {
      console.error("❌ Cron: Failed to purge sessions", err.message);
    }
  });
};

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await dbConnect();
    await seedAdmin();

    scheduleCronJobs();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
