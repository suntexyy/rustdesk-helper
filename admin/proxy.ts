import { NextRequest, NextResponse } from "next/server";
import { authGuard } from "./features/auth/middleware/authGuard";

export default async function middleware(request: NextRequest) {
  const { redirect } = await authGuard(request);

  if (redirect) {
    return NextResponse.redirect(redirect);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
