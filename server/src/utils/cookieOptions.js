const normalizeUrl = (value) => {
  if (!value || typeof value !== "string") return "";
  return value.trim().replace(/^['\"]|['\"]$/g, "");
};

const getSharedCookieDomain = () => {
  if (process.env.NODE_ENV !== "production") return undefined;

  const explicitDomain = normalizeUrl(process.env.COOKIE_DOMAIN);
  if (explicitDomain) {
    return explicitDomain.startsWith(".")
      ? explicitDomain
      : `.${explicitDomain}`;
  }

  const candidates = [process.env.ADMIN_URL, process.env.CLIENT_URL]
    .map(normalizeUrl)
    .filter(Boolean);

  for (const candidate of candidates) {
    try {
      const { hostname } = new URL(candidate);

      if (
        !hostname ||
        hostname === "localhost" ||
        /^\d+\.\d+\.\d+\.\d+$/.test(hostname)
      ) {
        continue;
      }

      const parts = hostname.split(".");
      if (parts.length >= 2) {
        return `.${parts.slice(-2).join(".")}`;
      }
    } catch {
      continue;
    }
  }

  return undefined;
};

const sharedCookieDomain = getSharedCookieDomain();

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  path: "/",
  ...(sharedCookieDomain ? { domain: sharedCookieDomain } : {}),
});

/**
 * Access token cookie — short-lived, in-memory sessions
 */
const accessTokenCookieOptions = () => ({
  ...baseCookieOptions(),
  maxAge: 15 * 60 * 1000,
});

/**
 * Refresh token cookie — long-lived
 */
const refreshTokenCookieOptions = () => ({
  ...baseCookieOptions(),
  maxAge: 7 * 24 * 60 * 60 * 1000,
});

const clearCookieOptions = () => ({
  ...baseCookieOptions(),
});

module.exports = {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
};
