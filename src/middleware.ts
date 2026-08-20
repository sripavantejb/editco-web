import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";
import { verifyAdminSessionToken } from "@/lib/os/admin-session-edge";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = token ? await verifyAdminSessionToken(token) : false;

  if (pathname === "/admin/login") {
    if (authed) {
      return NextResponse.redirect(new URL("/admin/os", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    const login = new URL("/admin/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
