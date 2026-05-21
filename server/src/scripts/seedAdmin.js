const mongoose = require("mongoose");
const Admin = require("../modules/auth/auth.model");

/**
 * Seeds the superadmin if one does not already exist.
 * Expects the DB to already be connected when called from the server.
 * When run as a standalone script it connects itself.
 */
const seedAdmin = async () => {
  const SEED_ADMIN = {
    name: process.env.SEED_ADMIN_NAME,
    email: process.env.SEED_ADMIN_EMAIL,
    password: process.env.SEED_ADMIN_PASSWORD,
    role: process.env.SEED_ADMIN_ROLE || "superadmin",
    isActive: true,
  };

  if (!SEED_ADMIN.email || !SEED_ADMIN.password) {
    console.warn(
      "⚠️  Seed skipped: SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD missing",
    );
    return;
  }

  const existing = await Admin.findOne({ email: SEED_ADMIN.email });

  if (existing) {
    console.log("⚠️  Admin already exists — skipping seed");
    return;
  }

  const admin = await Admin.create(SEED_ADMIN);

  console.log("✅ Superadmin created successfully");
  console.log("─────────────────────────────────");
  console.log(`   Name:  ${admin.name}`);
  console.log(`   Email: ${admin.email}`);
  console.log(`   Role:  ${admin.role}`);
  console.log(`   ID:    ${admin._id}`);
  console.log("─────────────────────────────────");
  console.log("⚠️  Change the password after first login!");
};

module.exports = seedAdmin;

// Allow running directly: node src/scripts/seedAdmin.js
if (require.main === module) {
  (async () => {
    try {
      require("dotenv").config();

      if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");

      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log("✅ MongoDB Connected");

      await seedAdmin();
      process.exit(0);
    } catch (error) {
      console.error("❌ Seed failed:", error.message);
      process.exit(1);
    }
  })();
}
