import type { RootState } from "@/shared/redux/store";

export const selectAppStateInfo = (state: RootState) => state.app;
