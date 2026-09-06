import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";
import { verifyAdminSessionToken } from "@/lib/os/admin-session-edge";

const PUBLIC_LOGINS = new Set([
  "/admin/login",
  "/sales/login",
  "/sales/login/admin",
  "/sales/login/employee",
]);

function loginUrlForPath(pathname: string, requestUrl: string) {
  if (pathname.startsWith("/sales/employee")) {
    return new URL("/sales/login/employee", requestUrl);
  }
  if (pathname.startsWith("/sales/admin") || pathname.startsWith("/sales")) {
    return new URL("/sales/login/admin", requestUrl);
  }
  return new URL("/admin/login", requestUrl);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const authed = token ? await verifyAdminSessionToken(token) : false;

  if (PUBLIC_LOGINS.has(pathname)) {
    return NextResponse.next();
  }

  if (!authed) {
    const login = loginUrlForPath(pathname, request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sales/:path*"],
};
