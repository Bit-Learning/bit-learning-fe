import axios, {
	type AxiosError,
	type AxiosInstance,
	type AxiosRequestConfig,
	type AxiosResponse,
	type InternalAxiosRequestConfig,
} from "axios";
import {
	clearAuthTokens,
	getAccessToken,
	setAccessToken,
} from "@/shared/lib/cookies";

const api: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api/",
	headers: {
		"Content-Type": "application/json",
		"Accept-Language": localStorage.getItem("i18nextLng") || "vi",
	},
	// Enable sending cookies (including HttpOnly refresh token) with all requests
	withCredentials: true,
});

let isRefreshing = false;
let failedRequestQueue: Array<{
	resolve: (value: any) => void;
	reject: (reason?: any) => void;
}> = [];

function setAuthorizationHeader(params: {
	request: AxiosRequestConfig;
	token: string;
}) {
	const { request, token } = params;
	if (request.headers) {
		request.headers.Authorization = `Bearer ${token}`;
	}
}

function handleRefreshToken(): Promise<string> {
	console.log("[Token Refresh] Starting token refresh process");
	isRefreshing = true;

	return api
		.post("/auth/refresh-token", {}, {
			headers: {
				"Content-Type": "application/json",
			},
			// Skip auth interceptor for refresh token request
			_retry: true,
			// Ensure cookies are sent (refresh token is HttpOnly cookie)
			withCredentials: true,
		} as any)
		.then((response: AxiosResponse) => {
			console.log("[Token Refresh] Refresh successful");
			const { accessToken } = response.data.data;
			if (!accessToken) {
				throw new Error("Invalid refresh token response");
			}
			// Only update access token - refresh token is managed by backend as HttpOnly cookie
			setAccessToken(accessToken);
			// Update default headers directly
			if (api.defaults.headers) {
				api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
			}

			console.log(
				`[Token Refresh] Processing ${failedRequestQueue.length} queued requests`,
			);
			failedRequestQueue.forEach(({ resolve }) => void resolve(accessToken));
			failedRequestQueue = [];
			return accessToken;
		})
		.catch((error: AxiosError) => {
			console.error(
				"[Token Refresh] Refresh failed:",
				error.response?.status,
				error.response?.data,
			);
			failedRequestQueue.forEach(({ reject }) => void reject(error));
			failedRequestQueue = [];
			clearAuthTokens();
			console.log("[Token Refresh] Redirecting to sign-in");
			window.location.href = "/sign-in";
			throw error;
		})
		.finally(() => {
			isRefreshing = false;
		});
}

function onRequest(
	config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig {
	const token = getAccessToken();
	if (token) {
		setAuthorizationHeader({ request: config, token });
	}
	return config;
}

function onRequestError(error: AxiosError): Promise<never> {
	return Promise.reject(error);
}

function onResponse(response: AxiosResponse): AxiosResponse {
	return response;
}

async function onResponseError(error: AxiosError): Promise<any> {
	const originalRequest = error.config as InternalAxiosRequestConfig & {
		_retry?: boolean;
	};

	// Don't try to refresh token for auth endpoints
	const authEndpoints = [
		"/auth/login",
		"/auth/login-user",
		"/auth/register",
		"/auth/refresh-token",
		"/auth/forgot-password",
		"/auth/reset-password",
		"/auth/activate",
	];
	const isAuthEndpoint = authEndpoints.some((endpoint) =>
		originalRequest.url?.includes(endpoint),
	);

	if (
		error.response?.status === 401 &&
		!originalRequest._retry &&
		!isAuthEndpoint
	) {
		console.log("[Auth] 401 error detected for:", originalRequest.url);

		originalRequest._retry = true;

		if (isRefreshing) {
			console.log(
				"[Auth] Token refresh in progress, queueing request:",
				originalRequest.url,
			);
			// Queue the request until the refresh is complete
			return new Promise((resolve, reject) => {
				failedRequestQueue.push({
					resolve: (token: string) => {
						console.log("[Auth] Retrying queued request:", originalRequest.url);
						setAuthorizationHeader({
							request: originalRequest,
							token,
						});
						resolve(api.request(originalRequest));
					},
					reject,
				});
			});
		}

		try {
			console.log("[Auth] Attempting to refresh token");
			// Refresh token is sent automatically via HttpOnly cookie
			const newAccessToken = await handleRefreshToken();
			if (newAccessToken) {
				console.log(
					"[Auth] Token refreshed, retrying original request:",
					originalRequest.url,
				);
				setAuthorizationHeader({
					request: originalRequest,
					token: newAccessToken,
				});
				return api.request(originalRequest);
			}
			throw new Error("No new access token available after refresh");
		} catch (refreshError) {
			console.error("[Auth] Token refresh failed:", refreshError);
			return Promise.reject(refreshError);
		}
	}

	return Promise.reject(error);
}

export function setupInterceptors(axiosInstance: AxiosInstance): AxiosInstance {
	axiosInstance.interceptors.request.use(onRequest, onRequestError);
	axiosInstance.interceptors.response.use(onResponse, onResponseError);
	return axiosInstance;
}

export default setupInterceptors(api);
