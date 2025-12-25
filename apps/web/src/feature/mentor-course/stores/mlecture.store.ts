import type { RootState } from '@/shared/redux/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

export type TMLectureState = {
    createQuizContext: {
        sectionId: number | null
        courseId: number | null
    } | null
}

const mlectureInitialState: TMLectureState = {
    createQuizContext: null,
}

const setCreateQuizContext = (
    state: TMLectureState,
    action: PayloadAction<{ sectionId: number; courseId: number } | null>,
) => {
    state.createQuizContext = action.payload
}

const resetMLectureState = () => {
    return mlectureInitialState
}

export const mlecture = createSlice({
    name: 'mlecture',
    initialState: mlectureInitialState,
    reducers: {
        setCreateQuizContextAction: setCreateQuizContext,
        resetMLectureStateAction: resetMLectureState,
    },
})

export const { setCreateQuizContextAction, resetMLectureStateAction } = mlecture.actions

export const selectCreateQuizContext = (state: RootState) => state.mlecture.createQuizContext

export default mlecture.reducer
