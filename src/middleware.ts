import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import PocketBase from 'pocketbase';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090");

  // Load auth store from cookie
  const cookieHeader = request.headers.get('cookie') || '';
  
  if (cookieHeader) {
    try {
        pb.authStore.loadFromCookie(cookieHeader);
        console.log("[Middleware] Cookie parsed. Valid?", pb.authStore.isValid);
        console.log("[Middleware] Token:", pb.authStore.token.substring(0, 10) + "...");
    } catch (e) {
        console.error("[Middleware] Failed to parse cookie", e);
    }
  } else {
      console.log("[Middleware] No cookie header found");
  }

  try {
    // Refresh auth if valid
    if (pb.authStore.isValid) {
      console.log("[Middleware] Attempting authRefresh...");
      await pb.collection('users').authRefresh();
      console.log("[Middleware] authRefresh Success!");
    }
  } catch (err: any) {
    console.error("[Middleware] authRefresh FAILED:", err.message);
    if (err.data) console.error("[Middleware] Err Data:", JSON.stringify(err.data));
    pb.authStore.clear(); // Clear invalid auth
  }

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');
  const isRegisterPage = request.nextUrl.pathname.startsWith('/register');
  const isSeedPage = request.nextUrl.pathname.startsWith('/seed');
  const isDashboard = !isLoginPage && !isRegisterPage && !isSeedPage && !request.nextUrl.pathname.startsWith('/_next') && !request.nextUrl.pathname.startsWith('/api') && !request.nextUrl.pathname.includes('.');

  // If user is not logged in and tries to access dashboard
  if (!pb.authStore.isValid && isDashboard) {
    console.log("[Middleware] Redirecting to /login (Auth invalid)");
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If user IS logged in and tries to access login/register
  if (pb.authStore.isValid && (isLoginPage || isRegisterPage)) {
    console.log("[Middleware] Redirecting to / (Already logged in)");
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
