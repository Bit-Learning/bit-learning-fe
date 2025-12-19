import type { RootState } from '@/shared/redux/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// ===== TYPES =====
export type TSectionState = {
    expandedSections: number[]
}

// ===== INITIAL STATE =====
const sectionInitialState: TSectionState = {
    expandedSections: [],
}

// ===== REDUCERS =====
const toggleSection = (state: TSectionState, action: PayloadAction<number>) => {
    const sectionId = action.payload
    const index = state.expandedSections.indexOf(sectionId)

    if (index > -1) {
        state.expandedSections.splice(index, 1)
    } else {
        state.expandedSections.push(sectionId)
    }
}

const expandAllSections = (state: TSectionState, action: PayloadAction<number[]>) => {
    state.expandedSections = action.payload
}

const collapseAllSections = (state: TSectionState) => {
    state.expandedSections = []
}

const resetSectionState = () => {
    return sectionInitialState
}

// ===== SLICE =====
export const section = createSlice({
    name: 'section',
    initialState: sectionInitialState,
    reducers: {
        toggleSectionAction: toggleSection,
        expandAllSectionsAction: expandAllSections,
        collapseAllSectionsAction: collapseAllSections,
        resetSectionStateAction: resetSectionState,
    },
})

// ===== ACTIONS =====
export const { toggleSectionAction, expandAllSectionsAction, collapseAllSectionsAction, resetSectionStateAction } =
    section.actions

// ===== SELECTORS =====
export const selectSectionState = (state: RootState) => state.section
export const selectExpandedSections = (state: RootState) => state.section.expandedSections

export default section.reducer
