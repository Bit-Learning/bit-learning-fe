import { TAppThunk } from '@/feature/app/type/AppState'
import { clearAuthTokens, getAccessToken, setAuthTokens } from '@/shared/lib/cookies'
import { setErrorAction, setIsAuthenticatedAction, setIsLoadingAction, setUserInfoAction } from '.'
import { ForgotPassword, GetUserProfile, Login, Register, ResetPassword } from '../service/AuthService'
import type { TForgotPasswordRequest, TRegisterRequest, TResetPasswordRequest } from '../type/authState'

export const requestUserProfile = (): TAppThunk => {
    return async (dispatch: any) => {
        try {
            const response = await GetUserProfile()
            if (response && response.data && response.data.data) {
                dispatch(setUserInfoAction(response.data.data))
                dispatch(setIsAuthenticatedAction(true))
                return { success: true, data: response.data.data }
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to fetch user profile'
            dispatch(setErrorAction(errorMessage))

            // Only clear auth state if it's not a 401 (token will be refreshed automatically)
            // or if the refresh token has also failed (no tokens left)
            if (error?.response?.status !== 401) {
                dispatch(setIsAuthenticatedAction(false))
                dispatch(setUserInfoAction(null))
            }
            return { success: false, message: errorMessage }
        }
    }
}

export const initializeAuth = (): TAppThunk => {
    return async (dispatch: any) => {
        const accessToken = getAccessToken()
        if (accessToken) {
            // If we have a token, try to fetch the profile
            await dispatch(requestUserProfile())
        } else {
            // No token, ensure auth state is cleared
            dispatch(setIsAuthenticatedAction(false))
            dispatch(setUserInfoAction(null))
        }
    }
}

export const logout = (): TAppThunk => {
    return async (dispatch: any) => {
        try {
            // Call logout API if available
            // await Logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            // Always clear local auth state
            clearAuthTokens()
            dispatch(setIsAuthenticatedAction(false))
            dispatch(setUserInfoAction(null))
        }
    }
}

export const requestLogin = ({ email, password }: { email: string; password: string }): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await Login({ email, password })
            if (response && response.data && response.data.data) {
                const payload = response.data.data
                setAuthTokens(payload.accessToken, payload.refreshToken)
                dispatch(setIsAuthenticatedAction(true))
                dispatch(setUserInfoAction(payload.user))
                return { success: true }
            }
        } catch (error: any) {
            console.log('Login error:', error)
            console.log('Error response:', error?.response)
            console.log('Error response data:', error?.response?.data)

            // Get the error message from response
            const errorMessage =
                error?.response?.data?.message || error?.response?.data?.error || 'Đăng nhập không thành công'

            // Handle 401 Account Not Activated error
            if (error?.response?.status === 401 && errorMessage.toLowerCase().includes('not activated')) {
                dispatch(setErrorAction(errorMessage))
                return { success: false, needsActivation: true, message: errorMessage }
            }

            dispatch(setErrorAction(errorMessage))
            return { success: false, needsActivation: false, message: errorMessage }
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const requestRegister = (body: TRegisterRequest): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await Register(body)
            if (response.data.success) {
                return true
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data.Message || error?.response?.data.message || error.message
            dispatch(setErrorAction(errorMessage))
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const requestForgotPassword = (body: TForgotPasswordRequest): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await ForgotPassword(body)
            if (response.data.success) {
                return true
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data.message || error.message
            dispatch(setErrorAction(errorMessage))
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const requestResetPassword = (body: TResetPasswordRequest): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await ResetPassword(body)
            if (response.data.success) {
                return true
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data.message || error.message
            dispatch(setErrorAction(errorMessage))
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}
