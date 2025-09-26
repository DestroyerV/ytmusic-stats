import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Add any paths that should be protected
const protectedPaths = ["/dashboard", "/upload", "/stats"];

// Add any paths that should redirect authenticated users (like auth pages)
const authPaths = ["/auth/signin", "/auth/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some((path) =>
    pathname.startsWith(path),
  );
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Get the session cookie
  const sessionCookie = request.cookies.get("__Secure-better-auth.session_token");

  // If it's a protected path and no session, redirect to signin
  if (isProtectedPath && !sessionCookie) {
    const signInUrl = new URL("/auth/signin", request.url);
    signInUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If it's an auth path and user is already signed in, redirect to dashboard
  if (isAuthPath && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
