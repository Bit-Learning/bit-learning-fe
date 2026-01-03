import { createSlice } from "@reduxjs/toolkit";
import { appInitialState } from "./app.initialState";
import {
	setIsLoading,
	setLanguage,
	setSidebarOpen,
	setTheme,
} from "./app.reducers";

const app = createSlice({
	name: "app",
	initialState: appInitialState,
	reducers: {
		setIsLoadingAction: setIsLoading,
		setThemeAction: setTheme,
		setLanguageAction: setLanguage,
		setSidebarAction: setSidebarOpen,
	},
});

export const {
	setIsLoadingAction,
	setThemeAction,
	setLanguageAction,
	setSidebarAction,
} = app.actions;
export default app.reducer;
