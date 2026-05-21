const authService = require("./auth.service");
const {
  accessTokenCookieOptions,
  clearCookieOptions,
  refreshTokenCookieOptions,
} = require("../../utils/cookieOptions");

// ─────────────────────────────────────────────
// HELPER: extract device info from request
// ─────────────────────────────────────────────
const getDeviceInfo = (req) => {
  const ua = req.headers["user-agent"] || "unknown";
  const ip =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    "unknown";
  return `${ua} | IP: ${ip}`;
};

// ─────────────────────────────────────────────
// HELPER: safe admin response — strip sensitive fields
// ─────────────────────────────────────────────
const sanitizeAdmin = (admin) => ({
  id: admin._id,
  name: admin.name,
  email: admin.email,
  role: admin.role,
  isActive: admin.isActive,
  lastLogin: admin.lastLogin,
  createdAt: admin.createdAt,
});

// ─────────────────────────────────────────────
// @desc    Login Admin
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const deviceInfo = getDeviceInfo(req);

    const { admin, accessToken, refreshToken } = await authService.loginAdmin({
      email,
      password,
      deviceInfo,
    });

    // Set both tokens as httpOnly cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: sanitizeAdmin(admin),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Silent token refresh
// @route   POST /api/auth/refresh
// @access  Public (cookie-authenticated)
// ─────────────────────────────────────────────
const refresh = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies?.refreshToken;

    // Guard early — no token, no service call
    if (!incomingRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh token provided.",
      });
    }

    const { accessToken, refreshToken } =
      await authService.refreshAdminToken(incomingRefreshToken);

    // Rotate both cookies
    res.cookie("accessToken", accessToken, accessTokenCookieOptions());
    res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
    });
  } catch (error) {
    // On any refresh failure — clear cookies so frontend redirects to login
    res.clearCookie("accessToken", clearCookieOptions());
    res.clearCookie("refreshToken", clearCookieOptions());
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Get current logged in admin
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    // Always fetch fresh from DB — never trust stale middleware-attached data
    const admin = await authService.getAdminById(req.admin._id);

    return res.status(200).json({
      success: true,
      data: sanitizeAdmin(admin),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Change own password
// @route   PATCH /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const result = await authService.changePassword(req.admin._id, {
      currentPassword,
      newPassword,
    });

    // Clear cookies — admin must log in again with new password
    res.clearCookie("accessToken", clearCookieOptions());
    res.clearCookie("refreshToken", clearCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Password changed successfully. Please log in again.",
      data: {
        email: result.email,
        newPasswordHash: result.newPasswordHash, // ← remove this in production
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Logout current device
// @route   POST /api/auth/logout
// @access  Private
// ─────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    // Remove only this device's session from DB
    await authService.logoutAdmin(req.admin._id, refreshToken);

    res.clearCookie("accessToken", clearCookieOptions());
    res.clearCookie("refreshToken", clearCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// @desc    Logout from ALL devices
// @route   POST /api/auth/logout-all
// @access  Private
// ─────────────────────────────────────────────
const logoutAll = async (req, res, next) => {
  try {
    // Wipe every session from DB
    await authService.logoutAllSessions(req.admin._id);

    res.clearCookie("accessToken", clearCookieOptions());
    res.clearCookie("refreshToken", clearCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Logged out from all devices successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  refresh,
  getMe,
  changePassword,
  logout,
  logoutAll,
};
