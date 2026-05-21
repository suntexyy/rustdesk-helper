const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ─────────────────────────────────────────────
// Sub-schema: individual session
// Each login from a device = one session entry
// ─────────────────────────────────────────────
const sessionSchema = new mongoose.Schema(
  {
    refreshTokenHash: {
      type: String,
      required: true,
    },
    refreshTokenExpiresAt: {
      type: Date,
      required: true,
      index: true, // indexed for cleanup queries
    },
    jti: {
      type: String,
      required: true,
      unique: true, // each token ID must be globally unique
    },
    deviceInfo: {
      type: String,
      default: "unknown",
      maxlength: 200,
    },
  },
  {
    _id: true, // keep _id so we can target sessions by ID if needed
    timestamps: true,
  },
);

// ─────────────────────────────────────────────
// Main Admin schema
// ─────────────────────────────────────────────
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        "Please provide a valid email",
      ],
      index: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // NEVER returned in queries by default
    },

    role: {
      type: String,
      enum: {
        values: ["superadmin", "editor"],
        message: "Role must be superadmin or editor",
      },
      default: "editor",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ── Multi-session storage (max 5 devices) ──
    sessions: {
      type: [sessionSchema],
      default: [],
      validate: {
        validator: function (sessions) {
          return sessions.length <= 5;
        },
        message: "Maximum 5 concurrent sessions allowed",
      },
    },

    // ── Audit fields ──
    lastLogin: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
      select: false,
    },

    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lockUntil: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt auto-managed
  },
);

// ─────────────────────────────────────────────
// VIRTUAL: is account locked?
// ─────────────────────────────────────────────
adminSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ─────────────────────────────────────────────
// PRE-SAVE HOOK: hash password only when modified
// ─────────────────────────────────────────────
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date();
});

// ─────────────────────────────────────────────
// INSTANCE METHOD: compare password
// ─────────────────────────────────────────────
adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ─────────────────────────────────────────────
// INSTANCE METHOD: handle failed login attempts
// Locks account after 5 failed attempts for 30 min
// ─────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

adminSchema.methods.incrementLoginAttempts = async function () {
  // If previous lock has expired, reset
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Lock if hitting max attempts
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION_MS) };
  }

  return this.updateOne(updates);
};

// ─────────────────────────────────────────────
// INSTANCE METHOD: reset login attempts on success
// ─────────────────────────────────────────────
adminSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
};

// ─────────────────────────────────────────────
// INSTANCE METHOD: clean expired sessions
// Call this periodically or on login
// ─────────────────────────────────────────────
adminSchema.methods.clearExpiredSessions = function () {
  const now = new Date();
  this.sessions = this.sessions.filter((s) => s.refreshTokenExpiresAt > now);
};

// ─────────────────────────────────────────────
// STATIC METHOD: find active admin by email
// ─────────────────────────────────────────────
adminSchema.statics.findActiveByEmail = function (email) {
  return this.findOne({ email, isActive: true }).select(
    "+password +loginAttempts +lockUntil",
  );
};

// ─────────────────────────────────────────────
// STATIC METHOD: purge all expired sessions across all admins
// Run this as a cron job (e.g., daily)
// ─────────────────────────────────────────────
adminSchema.statics.purgeExpiredSessions = function () {
  return this.updateMany(
    {},
    {
      $pull: {
        sessions: { refreshTokenExpiresAt: { $lt: new Date() } },
      },
    },
  );
};

module.exports = mongoose.model("Admin", adminSchema);
