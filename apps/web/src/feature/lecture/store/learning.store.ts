import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface VideoPlayerState {
    isPlaying: boolean
    currentTime: number
    duration: number
    volume: number
    isMuted: boolean
    playbackSpeed: number
    quality: string
    isFullscreen: boolean
    showControls: boolean
    buffered: number
}

export interface LearningState {
    videoPlayer: VideoPlayerState
    completedLectures: number[]
    currentLectureId: number | null
}

const initialState: LearningState = {
    videoPlayer: {
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        playbackSpeed: 1,
        quality: 'auto',
        isFullscreen: false,
        showControls: true,
        buffered: 0,
    },
    completedLectures: [],
    currentLectureId: null,
}

export const learning = createSlice({
    name: 'learning',
    initialState,
    reducers: {
        setIsPlaying: (state, action: PayloadAction<boolean>) => {
            state.videoPlayer.isPlaying = action.payload
        },
        setCurrentTime: (state, action: PayloadAction<number>) => {
            state.videoPlayer.currentTime = action.payload
        },
        setDuration: (state, action: PayloadAction<number>) => {
            state.videoPlayer.duration = action.payload
        },
        setVolume: (state, action: PayloadAction<number>) => {
            state.videoPlayer.volume = action.payload
            state.videoPlayer.isMuted = action.payload === 0
        },
        setIsMuted: (state, action: PayloadAction<boolean>) => {
            state.videoPlayer.isMuted = action.payload
        },
        setPlaybackSpeed: (state, action: PayloadAction<number>) => {
            state.videoPlayer.playbackSpeed = action.payload
        },
        setQuality: (state, action: PayloadAction<string>) => {
            state.videoPlayer.quality = action.payload
        },
        setIsFullscreen: (state, action: PayloadAction<boolean>) => {
            state.videoPlayer.isFullscreen = action.payload
        },
        setShowControls: (state, action: PayloadAction<boolean>) => {
            state.videoPlayer.showControls = action.payload
        },
        setBuffered: (state, action: PayloadAction<number>) => {
            state.videoPlayer.buffered = action.payload
        },
        setCurrentLectureId: (state, action: PayloadAction<number | null>) => {
            state.currentLectureId = action.payload
        },
        markLectureCompleted: (state, action: PayloadAction<number>) => {
            if (!state.completedLectures.includes(action.payload)) {
                state.completedLectures.push(action.payload)
            }
        },
        resetVideoPlayer: state => {
            state.videoPlayer = initialState.videoPlayer
        },
    },
})

export const {
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    setPlaybackSpeed,
    setQuality,
    setIsFullscreen,
    setShowControls,
    setBuffered,
    setCurrentLectureId,
    markLectureCompleted,
    resetVideoPlayer,
} = learning.actions

export default learning.reducer
