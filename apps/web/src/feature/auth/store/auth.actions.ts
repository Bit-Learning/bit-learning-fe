import { TAppThunk } from '@/feature/app/type/AppState'
import { Roles } from '@/shared/constants/enums'
import { clearAuthTokens, getAccessToken, setAuthTokens } from '@/shared/lib/cookies'
import { setErrorAction, setIsAuthenticatedAction, setIsLoadingAction, setUserInfoAction } from '.'
import {
    ChangePassword,
    FinishPasswordReset,
    GetUserProfile,
    Login,
    Register,
    RequestPasswordReset,
    VerifyResetKey,
} from '../service/AuthService'
import type { TChangePasswordRequest, TRegisterRequest, TResetPasswordRequest } from '../type/authState'

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
            const response = await Login({ email, password, role: Roles.USER })
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

export const requestPasswordResetInit = (email: string): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await RequestPasswordReset(email)
            // Backend returns status 200 with message "Success"
            if (response.status === 200 && response.data) {
                return { success: true, message: response.data.message || 'Password reset link sent to your email' }
            }
            return { success: false, message: 'Failed to send reset email' }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message
            dispatch(setErrorAction(errorMessage))
            return { success: false, message: errorMessage }
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const verifyPasswordResetKey = (key: string): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await VerifyResetKey(key)
            // Backend returns status 200 with message "Success"
            if (response.status === 200 && response.data) {
                return { success: true, message: response.data.message || 'Reset key is valid' }
            }
            return { success: false, message: 'Invalid reset key' }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message
            dispatch(setErrorAction(errorMessage))
            return { success: false, message: errorMessage }
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const finishPasswordReset = (body: TResetPasswordRequest): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await FinishPasswordReset(body)
            // Backend returns status 200 with message "Success"
            if (response.status === 200 && response.data) {
                return { success: true, message: response.data.message || 'Password has been reset successfully' }
            }
            return { success: false, message: 'Failed to reset password' }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message
            dispatch(setErrorAction(errorMessage))
            return { success: false, message: errorMessage }
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const changePassword = (body: TChangePasswordRequest): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await ChangePassword(body)
            // Backend returns status 200 with message "Success"
            if (response.status === 200 && response.data) {
                return { success: true, message: response.data.message || 'Password changed successfully' }
            }
            return { success: false, message: 'Failed to change password' }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error.message
            dispatch(setErrorAction(errorMessage))
            return { success: false, message: errorMessage }
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}
