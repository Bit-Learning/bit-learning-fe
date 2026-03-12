import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type { ContestStatus } from "../types/contest.type";

export type TContestState = {
  selectedContestId: string | null;
  selectedStatus: ContestStatus | null;
  searchQuery: string | null;
  pagination: {
    page: number;
    size: number;
  };
};

const contestInitialState: TContestState = {
  selectedContestId: null,
  selectedStatus: null,
  searchQuery: null,
  pagination: {
    page: 0,
    size: 10,
  },
};

const setSelectedContestId = (state: TContestState, action: PayloadAction<string | null>) => {
  state.selectedContestId = action.payload;
};

const setSelectedStatus = (state: TContestState, action: PayloadAction<ContestStatus | null>) => {
  state.selectedStatus = action.payload;
  state.pagination.page = 0;
};

const setSearchQuery = (state: TContestState, action: PayloadAction<string | null>) => {
  state.searchQuery = action.payload;
  state.pagination.page = 0;
};

const setPage = (state: TContestState, action: PayloadAction<number>) => {
  state.pagination.page = action.payload;
};

const setPageSize = (state: TContestState, action: PayloadAction<number>) => {
  state.pagination.size = action.payload;
  state.pagination.page = 0;
};

const resetContestState = () => contestInitialState;

export const contest = createSlice({
  name: "contest",
  initialState: contestInitialState,
  reducers: {
    setSelectedContestIdAction: setSelectedContestId,
    setSelectedStatusAction: setSelectedStatus,
    setSearchQueryAction: setSearchQuery,
    setPageAction: setPage,
    setPageSizeAction: setPageSize,
    resetContestStateAction: resetContestState,
  },
});

export const {
  setSelectedContestIdAction,
  setSelectedStatusAction,
  setSearchQueryAction,
  setPageAction,
  setPageSizeAction,
  resetContestStateAction,
} = contest.actions;

export const selectContestState = (state: RootState) => state.contest;
export const selectSelectedContestId = (state: RootState) => state.contest.selectedContestId;
export const selectSelectedStatus = (state: RootState) => state.contest.selectedStatus;
export const selectSearchQuery = (state: RootState) => state.contest.searchQuery;
export const selectPagination = (state: RootState) => state.contest.pagination;

export default contest.reducer;
