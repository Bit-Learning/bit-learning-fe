import type { PayloadAction } from "@reduxjs/toolkit";
import type { TAuthState } from "../types/auth.type";

export const setIsAuthenticated = (
	state: TAuthState,
	action: PayloadAction<boolean>,
) => {
	state.isAuthenticated = action.payload;
};

export const setIsLoading = (
	state: TAuthState,
	action: PayloadAction<boolean>,
) => {
	state.isLoading = action.payload;
};

export const setErrorMsg = (
	state: TAuthState,
	action: PayloadAction<string | null>,
) => {
	state.errorMsg = action.payload;
};

export const setUserInfo = (state: TAuthState, action: PayloadAction<any>) => {
	state.userInfo = action.payload;
};
