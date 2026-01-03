import type { Action, ThunkAction } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/rootReducer";

export type TAppThunk<ReturnType = void> = ThunkAction<
	ReturnType,
	RootState,
	unknown,
	Action<string>
>;

export type TAppState = {
	isLoading: boolean;
	theme: "light" | "dark";
	language: string;
	sidebarOpen: boolean;
};
