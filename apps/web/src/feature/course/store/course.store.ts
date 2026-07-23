import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";
import type { CourseLevel } from "../types/course.type";

export type SortType = "default" | "price_asc" | "price_desc";

export type TCourseState = {
	selectedCourseId: number | null;
	selectedGrade: number | null;
	selectedLevel: CourseLevel | null;
	sortBy: SortType;
	pagination: {
		page: number;
		size: number;
	};
};

// ===== INITIAL STATE =====
const courseInitialState: TCourseState = {
	selectedCourseId: null,
	selectedGrade: null,
	selectedLevel: null,
	sortBy: "default",
	pagination: {
		page: 0,
		size: 10,
	},
};

// ===== REDUCERS =====
const setSelectedCourseId = (
	state: TCourseState,
	action: PayloadAction<number | null>,
) => {
	state.selectedCourseId = action.payload;
};

const setSelectedGrade = (
	state: TCourseState,
	action: PayloadAction<number | null>,
) => {
	state.selectedGrade = action.payload;
	state.pagination.page = 0;
};

const setSelectedLevel = (
	state: TCourseState,
	action: PayloadAction<CourseLevel | null>,
) => {
	state.selectedLevel = action.payload;
	state.pagination.page = 0;
};

const setSortBy = (state: TCourseState, action: PayloadAction<SortType>) => {
	state.sortBy = action.payload;
	state.pagination.page = 0;
};

const setPage = (state: TCourseState, action: PayloadAction<number>) => {
	state.pagination.page = action.payload;
};

const setPageSize = (state: TCourseState, action: PayloadAction<number>) => {
	state.pagination.size = action.payload;
	state.pagination.page = 0;
};

const resetCourseFilters = (state: TCourseState) => {
	state.selectedGrade = null;
	state.selectedLevel = null;
	state.sortBy = "default";
	state.pagination.page = 0;
};

const resetCourseState = () => {
	return courseInitialState;
};

// ===== SLICE =====
export const course = createSlice({
	name: "course",
	initialState: courseInitialState,
	reducers: {
		setSelectedCourseIdAction: setSelectedCourseId,
		setSelectedGradeAction: setSelectedGrade,
		setSelectedLevelAction: setSelectedLevel,
		setSortByAction: setSortBy,
		setPageAction: setPage,
		setPageSizeAction: setPageSize,
		resetCourseFiltersAction: resetCourseFilters,
		resetCourseStateAction: resetCourseState,
	},
});

// ===== ACTIONS =====
export const {
	setSelectedCourseIdAction,
	setSelectedGradeAction,
	setSelectedLevelAction,
	setSortByAction,
	setPageAction,
	setPageSizeAction,
	resetCourseFiltersAction,
	resetCourseStateAction,
} = course.actions;

// ===== SELECTORS =====
export const selectCourseState = (state: RootState) => state.course;
export const selectSelectedCourseId = (state: RootState) =>
	state.course.selectedCourseId;
export const selectSelectedGrade = (state: RootState) =>
	state.course.selectedGrade;
export const selectSelectedLevel = (state: RootState) =>
	state.course.selectedLevel;
export const selectSortBy = (state: RootState) => state.course.sortBy;
export const selectPagination = (state: RootState) => state.course.pagination;

// ===== DEFAULT EXPORT =====
export default course.reducer;
