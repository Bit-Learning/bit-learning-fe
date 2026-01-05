import Cookies from "js-cookie";
import { ACCESS_TOKEN } from "./keys";

/**
 * Sets the access token in a client-side cookie.
 * Note: Refresh token is now stored in an HttpOnly cookie by the backend,
 * so we only manage the access token on the client side.
 */
export const setAccessToken = (accessToken: string) => {
	// Only use secure cookies in production (HTTPS)
	const isProduction = window.location.protocol === "https:";

	Cookies.set(ACCESS_TOKEN, accessToken, {
		expires: 7, // 7 days
		secure: isProduction,
		sameSite: "Strict",
	});

	// Debug log to verify cookie is set
	console.log("[Cookies] Access token stored:", {
		hasAccessToken: !!Cookies.get(ACCESS_TOKEN),
		isProduction,
	});
};

/**
 * Legacy function for backward compatibility. Now only sets access token.
 * Refresh token is managed by backend as HttpOnly cookie.
 * @deprecated Use setAccessToken instead
 */
export const setAuthTokens = (accessToken: string, refreshToken?: string) => {
	setAccessToken(accessToken);

	// Log warning if refreshToken is provided (to help identify outdated usage)
	if (refreshToken) {
		console.warn(
			"[Cookies] Refresh token parameter ignored - now managed by backend as HttpOnly cookie",
		);
	}
};

export const getAccessToken = (): string | undefined =>
	Cookies.get(ACCESS_TOKEN);

/**
 * Cannot read refresh token from client side as it's HttpOnly.
 * This function is kept for backward compatibility but will always return undefined.
 * @deprecated Refresh token is now HttpOnly and managed by backend
 */
export const getRefreshToken = (): string | undefined => {
	console.warn(
		"[Cookies] getRefreshToken called but refresh token is HttpOnly - returning undefined",
	);
	return undefined;
};

export const clearAuthTokens = () => {
	Cookies.remove(ACCESS_TOKEN);
	// Refresh token will be cleared by backend when logout endpoint is called
	console.log(
		"[Cookies] Access token cleared. Refresh token will be cleared by backend.",
	);
};
