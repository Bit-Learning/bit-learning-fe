import type { TAuthState } from "../types/auth.type";

export const authInitialState: TAuthState = {
	isAuthenticated: false,
	isLoading: false,
	errorMsg: null,
	userInfo: null,
};
