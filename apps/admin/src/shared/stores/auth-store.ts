import { create } from "zustand";
import {
	clearAuthTokens,
	getAccessToken as getCookieAccessToken,
	getRefreshToken as getCookieRefreshToken,
} from "@/shared/lib/cookies";

interface AuthUser {
	accountNo: string;
	email: string;
	role: string[];
	exp: number;
	firstName?: string;
	lastName?: string;
	avatar?: string;
}

interface AuthState {
	auth: {
		user: AuthUser | null;
		setUser: (user: AuthUser | null) => void;
		accessToken: string;
		setAccessToken: (accessToken: string) => void;
		refreshToken: string;
		setRefreshToken: (refreshToken: string) => void;
		resetAccessToken: () => void;
		reset: () => void;
	};
}

export const useAuthStore = create<AuthState>()((set) => {
	const initAccessToken = getCookieAccessToken() || "";
	const initRefreshToken = getCookieRefreshToken() || "";

	return {
		auth: {
			user: null,
			setUser: (user) =>
				set((state) => ({ ...state, auth: { ...state.auth, user } })),
			accessToken: initAccessToken,
			setAccessToken: (accessToken) =>
				set((state) => {
					// Store only the access token in state, use setAuthTokens when both are available
					return { ...state, auth: { ...state.auth, accessToken } };
				}),
			refreshToken: initRefreshToken,
			setRefreshToken: (refreshToken) =>
				set((state) => {
					// Store only the refresh token in state, use setAuthTokens when both are available
					return { ...state, auth: { ...state.auth, refreshToken } };
				}),
			resetAccessToken: () =>
				set((state) => {
					clearAuthTokens();
					return {
						...state,
						auth: { ...state.auth, accessToken: "", refreshToken: "" },
					};
				}),
			reset: () =>
				set((state) => {
					clearAuthTokens();
					return {
						...state,
						auth: {
							...state.auth,
							user: null,
							accessToken: "",
							refreshToken: "",
						},
					};
				}),
		},
	};
});
