const jwt = require("jsonwebtoken");
const Admin = require("./auth.model");
const AppError = require("../../utils/AppError");
const { hashToken } = require("../../utils/tokenUtils");
const {
  accessTokenCookieOptions,
  clearCookieOptions,
  refreshTokenCookieOptions,
} = require("../../utils/cookieOptions");

// ─────────────────────────────────────────────
// HELPER: verify JWT silently (no throw)
// Returns payload or null
// ─────────────────────────────────────────────
const verifyToken = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
};

// ─────────────────────────────────────────────
// HELPER: clear both auth cookies
// ─────────────────────────────────────────────
const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", clearCookieOptions());
  res.clearCookie("refreshToken", clearCookieOptions());
};

// ─────────────────────────────────────────────
// MIDDLEWARE 1: protectAdmin
//
// Flow:
//   1. Check accessToken cookie
//   2. If valid → attach admin to req, continue
//   3. If expired → try silent refresh via refreshToken
//   4. If refresh valid → issue new cookies, continue
//   5. Anything else → 401, clear cookies
// ─────────────────────────────────────────────
exports.protectAdmin = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    // ── No tokens at all ──
    if (!accessToken && !refreshToken) {
      return next(new AppError("Not authenticated. Please log in.", 401));
    }

    // ── Try access token first ──
    if (accessToken) {
      const decoded = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);

      if (decoded) {
        // Valid access token — fetch fresh admin
        const admin = await Admin.findById(decoded.id).select(
          "-password -sessions",
        );

        if (!admin) {
          clearAuthCookies(res);
          return next(new AppError("Admin account no longer exists.", 401));
        }

        if (!admin.isActive) {
          clearAuthCookies(res);
          return next(new AppError("Account has been deactivated.", 403));
        }

        // ✅ Access token valid — attach and continue
        req.admin = admin;
        return next();
      }

      // Access token invalid/expired — fall through to refresh
    }

    // ── No refresh token to fall back on ──
    if (!refreshToken) {
      clearAuthCookies(res);
      return next(new AppError("Session expired. Please log in again.", 401));
    }

    // ── Try silent refresh ──
    const decodedRefresh = verifyToken(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    );

    if (!decodedRefresh) {
      clearAuthCookies(res);
      return next(new AppError("Invalid session. Please log in again.", 401));
    }

    // Fetch admin WITH sessions to validate refresh token hash
    const admin = await Admin.findById(decodedRefresh.id);

    if (!admin) {
      clearAuthCookies(res);
      return next(new AppError("Admin account no longer exists.", 401));
    }

    if (!admin.isActive) {
      clearAuthCookies(res);
      return next(new AppError("Account has been deactivated.", 403));
    }

    // Match incoming refresh token hash against stored sessions
    const incomingHash = hashToken(refreshToken);
    const sessionIndex = admin.sessions.findIndex(
      (s) => s.refreshTokenHash === incomingHash,
    );

    if (sessionIndex === -1) {
      // Not found in any session — possible reuse attack
      // Wipe ALL sessions as nuclear option
      admin.sessions = [];
      await admin.save();
      clearAuthCookies(res);
      return next(
        new AppError(
          "Security alert: Token reuse detected. All sessions invalidated. Please log in again.",
          401,
        ),
      );
    }

    // Check DB-level session expiry
    const session = admin.sessions[sessionIndex];
    if (session.refreshTokenExpiresAt < new Date()) {
      admin.sessions.splice(sessionIndex, 1);
      await admin.save();
      clearAuthCookies(res);
      return next(new AppError("Session expired. Please log in again.", 401));
    }

    // ── Issue new token pair (silent rotation) ──
    const { generateJti } = require("../../utils/tokenUtils");

    const newJti = generateJti();
    const newAccessToken = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );
    const newRefreshToken = jwt.sign(
      { id: admin._id, jti: newJti },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    // Rotate session in DB
    admin.sessions[sessionIndex] = {
      refreshTokenHash: hashToken(newRefreshToken),
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      jti: newJti,
      deviceInfo: session.deviceInfo,
      createdAt: session.createdAt,
    };
    await admin.save();

    // Set new cookies transparently
    res.cookie("accessToken", newAccessToken, accessTokenCookieOptions());
    res.cookie("refreshToken", newRefreshToken, refreshTokenCookieOptions());

    // Attach clean admin object (no sessions/password)
    req.admin = {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      isActive: admin.isActive,
      lastLogin: admin.lastLogin,
      createdAt: admin.createdAt,
    };

    return next();
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// MIDDLEWARE 2: authorizeRoles
//
// Usage: authorizeRoles("superadmin")
//        authorizeRoles("superadmin", "editor")
//
// Always use AFTER protectAdmin
// ─────────────────────────────────────────────
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new AppError("Not authenticated. Please log in.", 401));
    }

    if (!roles.includes(req.admin.role)) {
      return next(
        new AppError(
          `Access denied. Required role: [${roles.join(", ")}]. Your role: [${req.admin.role}].`,
          403,
        ),
      );
    }

    next();
  };
};

// ─────────────────────────────────────────────
// MIDDLEWARE 3: optionalAuth
//
// Use on routes that work for both guests and admins
// Does NOT throw if unauthenticated — just attaches
// req.admin if valid, otherwise leaves it undefined
//
// Usage: router.get("/stats", optionalAuth, controller)
// ─────────────────────────────────────────────
exports.optionalAuth = async (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    if (!accessToken) {
      return next(); // unauthenticated — continue anyway
    }

    const decoded = verifyToken(accessToken, process.env.JWT_ACCESS_SECRET);

    if (!decoded) {
      return next(); // invalid token — continue as guest
    }

    const admin = await Admin.findById(decoded.id).select(
      "-password -sessions",
    );

    if (admin && admin.isActive) {
      req.admin = admin; // attach if valid
    }

    next();
  } catch {
    next(); // never block the request
  }
};
