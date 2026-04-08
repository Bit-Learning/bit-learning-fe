import { redirect } from "@tanstack/react-router";
import store from "@/shared/redux/store";
import { clearAuthTokens, getAccessToken } from "./cookies";

/**
 * Check if user is authenticated
 * @returns true if user has valid authentication tokens and data
 */
// export function isLoggedIn(): boolean {
//     const accessToken = api.auth.getAccessToken()
//     const userStr = api.auth.getUser()

//     if (!accessToken || !userStr) {
//         return false
//     }

//     // Verify user data is valid JSON
//     try {
//         JSON.parse(userStr)
//         return true
//     } catch {
//         // Invalid user data, clear auth
//         api.auth.logout()
//         return false
//     }
// }

export function isLoggedIn(): boolean {
  const accessToken = getAccessToken();
  const authState = store.getState().auth;

  // Check both cookie token and Redux state
  return !!(accessToken && authState.isAuthenticated && authState.userInfo);
}

/**
 * Require authentication for a route
 * Use this in beforeLoad to protect routes
 * @param location - Optional location to redirect back to after login
 */
export function requireAuth(location?: { href: string }) {
  if (!isLoggedIn()) {
    throw redirect({
      to: "/signin-role",
      search: location ? { redirect: location.href } : undefined,
    });
  }
}

/**
 * Check if user is authenticated and has specific role
 * @param requiredRole - The role required to access the route
 * @param location - Optional location to redirect back to after login
 */

// export function requireRole(requiredRole: string, location?: { href: string }) {
//     if (!isLoggedIn()) {
//         throw redirect({
//             to: '/sign-in',
//             search: location ? { redirect: location.href } : undefined,
//         })
//     }

//     const userStr = api.auth.getUser()
//     if (userStr) {
//         try {
//             const user = JSON.parse(userStr)
//             if (user.role !== requiredRole) {
//                 throw redirect({ to: '/' }) // Redirect to home if role doesn't match
//             }
//         } catch {
//             api.auth.logout()
//             throw redirect({ to: '/sign-in' })
//         }
//     }
// }

export function requireRole(requiredRole: string, location?: { href: string }) {
  if (!isLoggedIn()) {
    throw redirect({
      to: "/signin-role",
      search: location ? { redirect: location.href } : undefined,
    });
  }

  const authState = store.getState().auth;
  const user = authState.userInfo;

  if (!user || user.role !== requiredRole) {
    if (!user) {
      clearAuthTokens();
      throw redirect({ to: "/signin-role" });
    }
    throw redirect({ to: "/" }); // Redirect to home if role doesn't match
  }
}

/**
 * Redirect authenticated users away from auth pages
 * Use this for login/signup pages
 */
export function redirectIfAuthenticated() {
  const loggedIn = isLoggedIn();
  console.log("redirectIfAuthenticated: isLoggedIn =", loggedIn);
  if (loggedIn) {
    console.log("redirectIfAuthenticated: Throwing redirect to /profile");
    throw redirect({ to: "/profile" });
  }
}
