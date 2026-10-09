const jwt = require("jsonwebtoken");

// Tells the socket server (on Render) that a group was deleted, so it can send
// the students out. A failure is fine: if the socket server is asleep,
// nobody is connected to it anyway.
const notifyGroupClosed = async (code) => {
  const base = (process.env.SOCKET_SERVER_URL || "").replace(/\/$/, "");
  const secret = process.env.SOCKET_JWT_SECRET;
  if (!base || !secret || !code) return;

  try {
    const token = jwt.sign({ role: "server" }, secret, { expiresIn: "1m" });
    await fetch(`${base}/internal/group-closed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ code }),
      signal: AbortSignal.timeout(3000),
    });
  } catch (err) {
    console.warn("Could not notify the socket server:", err.message);
  }
};

module.exports = { notifyGroupClosed };
