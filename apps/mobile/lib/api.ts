import { clearSession, getSession, saveSession } from "./session";
import type { ApiEnvelope, Session } from "./types";

const baseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "").replace(/\/$/, "");
export class ApiError extends Error {
	constructor(
		message: string,
		public status = 0,
	) {
		super(message);
	}
}
const unwrap = <T>(payload: ApiEnvelope<T> | T): T => {
	if (payload && typeof payload === "object" && "status" in payload) {
		const envelope = payload as ApiEnvelope<T>;
		if (envelope.status >= 400)
			throw new ApiError(
				envelope.message ?? envelope.error ?? "Request failed",
				envelope.status,
			);
		return envelope.data as T;
	}
	return payload as T;
};
async function request<T>(
	path: string,
	init: RequestInit = {},
	retried = false,
): Promise<T> {
	if (!baseUrl)
		throw new ApiError("EXPO_PUBLIC_API_BASE_URL is not configured");
	const session = await getSession();
	const headers = new Headers(init.headers);
	headers.set("Accept", "application/json");
	if (init.body) headers.set("Content-Type", "application/json");
	if (session?.accessToken)
		headers.set("Authorization", `Bearer ${session.accessToken}`);
	const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
	if (
		response.status === 401 &&
		session?.refreshToken &&
		!retried &&
		path !== "/auth/refresh-token"
	) {
		const refresh = await fetch(`${baseUrl}/auth/refresh-token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refreshToken: session.refreshToken }),
		});
		if (refresh.ok) {
			const next = unwrap<Partial<Session>>(await refresh.json());
			if (!next.accessToken) {
				await clearSession();
				throw new ApiError(
					"Session refresh did not return an access token",
					401,
				);
			}
			await saveSession({
				...session,
				...next,
				accessToken: next.accessToken,
			});
			return request(path, init, true);
		}
		await clearSession();
	}
	if (!response.ok) {
		const body = await response.json().catch(() => ({}));
		throw new ApiError(body.message ?? "Request failed", response.status);
	}
	if (response.status === 204) return undefined as T;
	return unwrap<T>(await response.json());
}
export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) =>
		request<T>(path, {
			method: "POST",
			body: body === undefined ? undefined : JSON.stringify(body),
		}),
	put: <T>(path: string, body: unknown) =>
		request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
};
export const apiUrl = (path: string) => `${baseUrl}${path}`;
