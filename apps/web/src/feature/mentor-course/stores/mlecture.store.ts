import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/shared/redux/store";

export interface CreateQuizContext {
	sectionId: number;
	courseId: number;
}

export interface EditQuizContext {
	sectionId: number;
	courseId: number;
	lectureId: number;
	orderIndex: number;
}

export interface MLectureState {
	createQuizContext: CreateQuizContext | null;
	editQuizContext: EditQuizContext | null;
}

const initialState: MLectureState = {
	createQuizContext: null,
	editQuizContext: null,
};

const mlectureSlice = createSlice({
	name: "mlecture",
	initialState,
	reducers: {
		setCreateQuizContextAction: (
			state,
			action: PayloadAction<CreateQuizContext>,
		) => {
			state.createQuizContext = action.payload;
			state.editQuizContext = null;
		},
		setEditQuizContextAction: (
			state,
			action: PayloadAction<EditQuizContext>,
		) => {
			state.editQuizContext = action.payload;
			state.createQuizContext = null;
		},
		resetMLectureStateAction: (state) => {
			state.createQuizContext = null;
			state.editQuizContext = null;
		},
	},
});

export const {
	setCreateQuizContextAction,
	setEditQuizContextAction,
	resetMLectureStateAction,
} = mlectureSlice.actions;

export const selectCreateQuizContext = (state: RootState) =>
	state.mlecture.createQuizContext;
export const selectEditQuizContext = (state: RootState) =>
	state.mlecture.editQuizContext;

export default mlectureSlice.reducer;
