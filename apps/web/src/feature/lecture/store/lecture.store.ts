import type { RootState } from '@/shared/redux/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

// ===== TYPES =====
export type TLectureState = {
    selectedLectureId: number | null
    isPlaying: boolean
    currentTime: number
    duration: number
    playbackRate: number
    volume: number
    isMuted: boolean
}

// ===== INITIAL STATE =====
const lectureInitialState: TLectureState = {
    selectedLectureId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    volume: 1,
    isMuted: false,
}

// ===== REDUCERS =====
const setSelectedLectureId = (state: TLectureState, action: PayloadAction<number | null>) => {
    state.selectedLectureId = action.payload
    state.currentTime = 0
}

const setIsPlaying = (state: TLectureState, action: PayloadAction<boolean>) => {
    state.isPlaying = action.payload
}

const setCurrentTime = (state: TLectureState, action: PayloadAction<number>) => {
    state.currentTime = action.payload
}

const setDuration = (state: TLectureState, action: PayloadAction<number>) => {
    state.duration = action.payload
}

const setPlaybackRate = (state: TLectureState, action: PayloadAction<number>) => {
    state.playbackRate = action.payload
}

const setVolume = (state: TLectureState, action: PayloadAction<number>) => {
    state.volume = action.payload
}

const setIsMuted = (state: TLectureState, action: PayloadAction<boolean>) => {
    state.isMuted = action.payload
}

const resetLectureState = () => {
    return lectureInitialState
}

// ===== SLICE =====
export const lecture = createSlice({
    name: 'lecture',
    initialState: lectureInitialState,
    reducers: {
        setSelectedLectureIdAction: setSelectedLectureId,
        setIsPlayingAction: setIsPlaying,
        setCurrentTimeAction: setCurrentTime,
        setDurationAction: setDuration,
        setPlaybackRateAction: setPlaybackRate,
        setVolumeAction: setVolume,
        setIsMutedAction: setIsMuted,
        resetLectureStateAction: resetLectureState,
    },
})

// ===== ACTIONS =====
export const {
    setSelectedLectureIdAction,
    setIsPlayingAction,
    setCurrentTimeAction,
    setDurationAction,
    setPlaybackRateAction,
    setVolumeAction,
    setIsMutedAction,
    resetLectureStateAction,
} = lecture.actions

// ===== SELECTORS =====
export const selectLectureState = (state: RootState) => state.lecture
export const selectSelectedLectureId = (state: RootState) => state.lecture.selectedLectureId
export const selectIsPlaying = (state: RootState) => state.lecture.isPlaying
export const selectCurrentTime = (state: RootState) => state.lecture.currentTime
export const selectDuration = (state: RootState) => state.lecture.duration
export const selectPlaybackRate = (state: RootState) => state.lecture.playbackRate

// ===== DEFAULT EXPORT =====
export default lecture.reducer
