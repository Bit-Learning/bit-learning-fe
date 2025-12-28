import { configureStore } from '@reduxjs/toolkit'
import * as Sentry from '@sentry/react'
import { useDispatch } from 'react-redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import rootReducer from './rootReducer'

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['app', 'auth', 'course', 'section', 'lecture', 'mlecture'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

const sentryReduxEnhancer = Sentry.createReduxEnhancer({
    // Optionally pass options listed below
})

const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
    enhancers: getDefaultEnhancers => {
        return getDefaultEnhancers().concat(sentryReduxEnhancer)
    },
} as const)

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()
export default store
