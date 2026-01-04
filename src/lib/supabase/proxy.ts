import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";
import { ROUTES, canAccessRoute, isPublicRoute, isProtectedRoute } from "@/constants/routes";
import type { UserRole } from "@/types/domain";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;

  // Handle public routes
  if (isPublicRoute(pathname)) {
    // Redirect authenticated users away from auth pages to /entry
    // Exception: /confirm route is allowed for authenticated users
    if (user && pathname !== '/confirm') {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.ENTRY;
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // Protected routes - require authentication
  if (isProtectedRoute(pathname)) {
    // Redirect unauthenticated users to login
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.LOGIN;
      // Check if this might be an expired session (had cookies but no valid user)
      const hasAuthCookies = request.cookies.getAll().some(
        (cookie) => cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
      );
      if (hasAuthCookies) {
        // Session expired - had cookies but they're no longer valid
        url.searchParams.set('expired', 'true');
      } else {
        // No session - just not logged in
        url.searchParams.set('message', 'Please login to continue');
      }
      return NextResponse.redirect(url);
    }

    // Fetch user role and active status from public.users table
    // Note: This query runs on every protected route request.
    // For ~60 users this is acceptable. For larger scale, consider
    // caching role in JWT custom claim or cookie after login.
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role, is_active')
      .eq('id', user.sub)
      .single();

    // Handle query errors gracefully - log but allow access check to proceed
    // with null role (which will deny access to restricted routes)
    if (profileError) {
      console.error('Failed to fetch user role:', profileError.message);
    }

    // Story 7.4: Check if user is deactivated
    // Deactivated users are signed out and redirected to login
    if (profile && profile.is_active === false) {
      // Sign out the deactivated user
      await supabase.auth.signOut();
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.LOGIN;
      url.searchParams.set('error', 'account_deactivated');
      return NextResponse.redirect(url);
    }

    const userRole: UserRole | null = (profile?.role as UserRole) ?? null;

    // Check route permissions based on role
    if (!canAccessRoute(userRole, pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = ROUTES.ENTRY;
      url.searchParams.set('access', 'denied');
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
