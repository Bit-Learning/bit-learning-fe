import type { TAppState } from '../type/AppState'
import type { PayloadAction } from '@reduxjs/toolkit'

export const setTheme = (state: TAppState, action: PayloadAction<'light' | 'dark'>) => {
    state.theme = action.payload
}

export const setIsLoading = (state: TAppState, action: PayloadAction<boolean>) => {
    state.isLoading = action.payload
}

export const setLanguage = (state: TAppState, action: PayloadAction<string>) => {
    state.language = action.payload
    localStorage.setItem('i18nextLng', action.payload)
}

export const setSidebarOpen = (state: TAppState, action: PayloadAction<boolean>) => {
    state.sidebarOpen = action.payload
}
