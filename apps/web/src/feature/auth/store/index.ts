import { createSlice } from '@reduxjs/toolkit'
import { authInitialState } from './auth.initialState'
import { setErrorMsg, setIsAuthenticated, setIsLoading, setUserInfo } from './auth.reducers'

const auth = createSlice({
    name: 'auth',
    initialState: authInitialState,
    reducers: {
        setIsLoadingAction: setIsLoading,
        setErrorAction: setErrorMsg,
        setUserInfoAction: setUserInfo,
        setIsAuthenticatedAction: setIsAuthenticated,
    },
})

export const { setIsLoadingAction, setErrorAction, setUserInfoAction, setIsAuthenticatedAction } = auth.actions
export default auth.reducer
