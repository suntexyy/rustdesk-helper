import { NextRequest } from "next/server";
import {
  AUTH_PATHS,
  DEFAULT_AUTH_PATH,
  DEFAULT_PROTECTED_PATH,
  PUBLIC_PATHS,
} from "./paths";

import { matchPath } from "./matchPath";

const hasCookieToken = (token: string | undefined) =>
  typeof token === "string" && token.trim().length > 0;

export async function authGuard(
  request: NextRequest,
): Promise<{ redirect: URL | null }> {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  const hasAccessToken = hasCookieToken(accessToken);
  const hasRefreshToken = hasCookieToken(refreshToken);
  const hasAnyAuthCookie = hasAccessToken || hasRefreshToken;

  // 1️⃣ Public routes
  if (matchPath(pathname, PUBLIC_PATHS)) {
    return { redirect: null };
  }

  // 2️⃣ Auth routes (/login etc.)
  if (matchPath(pathname, AUTH_PATHS)) {
    return hasAnyAuthCookie
      ? {
          redirect: new URL(DEFAULT_PROTECTED_PATH, request.url),
        }
      : { redirect: null };
  }

  // 3️⃣ Protected routes
  // Do not hard-block here: in hosted environments auth cookies can be scoped
  // to the API subdomain, so route middleware may not see them even when the
  // session is valid. The dashboard page/API layer performs real auth checks.
  if (!hasAnyAuthCookie) {
    return { redirect: null };
  }

  return { redirect: null };
}
