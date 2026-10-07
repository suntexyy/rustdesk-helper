const crypto = require("crypto");

const hashKey = (key) =>
  crypto.createHash("sha256").update(String(key)).digest("hex");

const safeEqualHex = (a, b) => {
  const x = Buffer.from(String(a), "hex");
  const y = Buffer.from(String(b), "hex");
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

const newOwnerKey = () => crypto.randomBytes(32).toString("hex");

// 6 digits, like your existing codes (e.g. "444444")
const newGroupCode = () =>
  String(crypto.randomInt(0, 1000000)).padStart(6, "0");

module.exports = { hashKey, safeEqualHex, newOwnerKey, newGroupCode };
