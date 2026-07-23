import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type { ContestStatus } from "../types/contest.type";

export type TContestState = {
	selectedContestId: string | null;
	selectedStatus: ContestStatus | null;
	searchQuery: string | null;
};

const contestInitialState: TContestState = {
	selectedContestId: null,
	selectedStatus: null,
	searchQuery: null,
};

const setSelectedContestId = (
	state: TContestState,
	action: PayloadAction<string | null>,
) => {
	state.selectedContestId = action.payload;
};

const setSelectedStatus = (
	state: TContestState,
	action: PayloadAction<ContestStatus | null>,
) => {
	state.selectedStatus = action.payload;
};

const setSearchQuery = (
	state: TContestState,
	action: PayloadAction<string | null>,
) => {
	state.searchQuery = action.payload;
};

const resetContestState = () => contestInitialState;

export const contest = createSlice({
	name: "contest",
	initialState: contestInitialState,
	reducers: {
		setSelectedContestIdAction: setSelectedContestId,
		setSelectedStatusAction: setSelectedStatus,
		setSearchQueryAction: setSearchQuery,
		resetContestStateAction: resetContestState,
	},
});

export const {
	setSelectedContestIdAction,
	setSelectedStatusAction,
	setSearchQueryAction,
	resetContestStateAction,
} = contest.actions;

export const selectContestState = (state: RootState) => state.contest;
export const selectSelectedContestId = (state: RootState) =>
	state.contest.selectedContestId;
export const selectSelectedStatus = (state: RootState) =>
	state.contest.selectedStatus;
export const selectSearchQuery = (state: RootState) =>
	state.contest.searchQuery;

export default contest.reducer;
