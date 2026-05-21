const jwt = require("jsonwebtoken");
const Admin = require("./auth.model");
const AppError = require("../../utils/AppError");
const { hashToken, generateJti } = require("../../utils/tokenUtils");

const MAX_SESSIONS = 5;

// ─────────────────────────────────────────────
// Token generators
// ─────────────────────────────────────────────
const generateAccessToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_ACCESS_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (id, jti) =>
  jwt.sign({ id, jti }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
exports.loginAdmin = async ({ email, password, deviceInfo }) => {
  // 1. Find active admin — static method selects password + lock fields
  const admin = await Admin.findActiveByEmail(email);

  if (!admin) {
    throw new AppError("Invalid credentials.", 401);
  }

  // 2. Check account lock
  if (admin.isLocked) {
    const minutesLeft = Math.ceil((admin.lockUntil - Date.now()) / 60000);
    throw new AppError(
      `Account locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`,
      423,
    );
  }

  // 3. Check password
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    await admin.incrementLoginAttempts();
    throw new AppError("Invalid credentials.", 401);
  }

  // 4. Check isActive (belt + suspenders — findActiveByEmail also checks)
  if (!admin.isActive) {
    throw new AppError("Account has been deactivated. Contact support.", 403);
  }

  // 5. Reset failed attempts on successful login
  await admin.resetLoginAttempts();

  // 6. Clean expired sessions before adding new one
  admin.clearExpiredSessions();

  // 7. Generate tokens with unique jti
  const jti = generateJti();
  const accessToken = generateAccessToken(admin._id, admin.role);
  const refreshToken = generateRefreshToken(admin._id, jti);

  // 8. Build new session
  const newSession = {
    refreshTokenHash: hashToken(refreshToken),
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    jti,
    deviceInfo: deviceInfo || "unknown",
  };

  // 9. Enforce session limit — remove oldest if at cap
  if (admin.sessions.length >= MAX_SESSIONS) {
    admin.sessions.sort((a, b) => a.createdAt - b.createdAt);
    admin.sessions.shift();
  }

  admin.sessions.push(newSession);
  admin.lastLogin = new Date();
  await admin.save();

  return { admin, accessToken, refreshToken };
};

// ─────────────────────────────────────────────
// REFRESH TOKEN
// ─────────────────────────────────────────────
exports.refreshAdminToken = async (incomingRefreshToken) => {
  // 1. Must exist
  if (!incomingRefreshToken) {
    throw new AppError("No refresh token provided.", 401);
  }

  // 2. Verify JWT signature and expiry
  let decoded;
  try {
    decoded = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    const message =
      err.name === "TokenExpiredError"
        ? "Refresh token expired. Please log in again."
        : "Invalid refresh token.";
    throw new AppError(message, 401);
  }

  // 3. Admin must still exist
  const admin = await Admin.findById(decoded.id);
  if (!admin) {
    throw new AppError("Admin no longer exists.", 401);
  }

  // 4. Account must be active
  if (!admin.isActive) {
    throw new AppError("Account has been deactivated.", 403);
  }

  // 5. Find matching session by hash
  const incomingHash = hashToken(incomingRefreshToken);
  const sessionIndex = admin.sessions.findIndex(
    (s) => s.refreshTokenHash === incomingHash,
  );

  if (sessionIndex === -1) {
    // Token not in any session — reuse attack or already logged out
    // Nuclear option: wipe ALL sessions for this admin
    admin.sessions = [];
    await admin.save();
    throw new AppError(
      "Security alert: Token reuse detected. All sessions have been invalidated. Please log in again.",
      401,
    );
  }

  // 6. Check DB-level expiry (belt + suspenders beyond JWT exp)
  const session = admin.sessions[sessionIndex];
  if (session.refreshTokenExpiresAt < new Date()) {
    admin.sessions.splice(sessionIndex, 1);
    await admin.save();
    throw new AppError("Session expired. Please log in again.", 401);
  }

  // 7. Rotate — new jti + new token pair
  const newJti = generateJti();
  const newAccessToken = generateAccessToken(admin._id, admin.role);
  const newRefreshToken = generateRefreshToken(admin._id, newJti);

  // 8. Replace old session entry with rotated one
  admin.sessions[sessionIndex] = {
    refreshTokenHash: hashToken(newRefreshToken),
    refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    jti: newJti,
    deviceInfo: session.deviceInfo, // preserve device
    createdAt: session.createdAt, // preserve original login time
  };

  await admin.save();

  return { admin, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

// ─────────────────────────────────────────────
// CHANGE OWN PASSWORD
// ─────────────────────────────────────────────
exports.changePassword = async (adminId, { currentPassword, newPassword }) => {
  // 1. Fetch with password explicitly — it's select:false by default
  const admin = await Admin.findById(adminId).select("+password");
  if (!admin) throw new AppError("Admin not found.", 404);

  // 2. Verify current password is actually correct
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError("Current password is incorrect.", 401);
  }

  // 3. Assign plain text — pre-save hook hashes it automatically
  admin.password = newPassword;

  // 4. Wipe all sessions — forces re-login on every device
  //    This is the correct security behavior after a password change
  admin.sessions = [];

  await admin.save();

  // 5. Return new hash so you can verify it worked
  const updated = await Admin.findById(adminId).select("+password");
  return {
    email: admin.email,
    newPasswordHash: updated.password,
  };
};

// ─────────────────────────────────────────────
// LOGOUT — current device only
// ─────────────────────────────────────────────
exports.logoutAdmin = async (adminId, incomingRefreshToken) => {
  const admin = await Admin.findById(adminId);
  if (!admin) return;

  if (incomingRefreshToken) {
    const hash = hashToken(incomingRefreshToken);
    admin.sessions = admin.sessions.filter((s) => s.refreshTokenHash !== hash);
  } else {
    // No token provided — wipe all as fallback
    admin.sessions = [];
  }

  await admin.save();
};

// ─────────────────────────────────────────────
// LOGOUT ALL — every device (e.g. "sign out everywhere")
// ─────────────────────────────────────────────
exports.logoutAllSessions = async (adminId) => {
  const admin = await Admin.findById(adminId);
  if (!admin) return;

  admin.sessions = [];
  await admin.save();
};

// ─────────────────────────────────────────────
// GET ME — fresh from DB, no sensitive fields
// ─────────────────────────────────────────────
exports.getAdminById = async (id) => {
  const admin = await Admin.findById(id).select("-password");
  if (!admin) throw new AppError("Admin not found.", 404);
  return admin;
};
