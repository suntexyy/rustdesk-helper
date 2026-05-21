const crypto = require("crypto");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const generateJti = () => crypto.randomUUID(); // unique ID per token

module.exports = { hashToken, generateJti };
