import { TAppThunk } from '@/feature/app/type/AppState'
import { TChangePasswordRequest } from '@/feature/user/types/user.type'
import { clearAuthTokens, getAccessToken, setAccessToken } from '@/shared/lib/cookies'
import { toast } from '@workspace/ui/components/Sonner'
import { setErrorAction, setIsAuthenticatedAction, setIsLoadingAction, setUserInfoAction } from '.'
import {
    ChangePassword,
    FinishPasswordReset,
    GetGoogleOAuth2Config,
    GetUserProfile,
    GoogleOAuth2Login,
    Login,
    Logout,
    Register,
    RequestPasswordReset,
    VerifyResetKey,
} from '../api/auth.api'
import { TRegisterRequest, TResetPasswordRequest } from '../types/auth.type'

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
            // Call logout API to clear HttpOnly refresh token cookie
            await Logout()
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
                // Only set access token - refresh token is HttpOnly cookie from backend
                setAccessToken(payload.accessToken)
                dispatch(setIsAuthenticatedAction(true))
                dispatch(setUserInfoAction(payload.user))

                // Show success notification
                toast.success({
                    title: 'Đăng nhập thành công',
                    description: `Chào mừng ${payload.user.username || 'bạn'} trở lại!`,
                })

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
                // Show success notification
                toast.success({
                    title: 'Đăng ký thành công!',
                    description: 'Vui lòng kiểm tra email để kích hoạt tài khoản của bạn.',
                })
                return { success: true }
            }
        } catch (error: any) {
            const errorMessage = error?.response?.data.Message || error?.response?.data.message || error.message
            dispatch(setErrorAction(errorMessage))

            // Show error notification
            toast.error({
                title: 'Đăng ký thất bại',
                description: errorMessage,
            })

            return { success: false, message: errorMessage }
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

export const requestGoogleLogin = (code: string): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await GoogleOAuth2Login(code)
            if (response && response.data && response.data.data) {
                const payload = response.data.data
                // Only set access token - refresh token is HttpOnly cookie from backend
                setAccessToken(payload.accessToken)
                dispatch(setIsAuthenticatedAction(true))
                dispatch(setUserInfoAction(payload.user))

                // Show success notification with different message for new users
                if (payload.isNewUser) {
                    toast.success({
                        title: 'Đăng nhập thành công!',
                        description: `Chào mừng ${payload.user.username || 'bạn'} đến với Bithub! ${payload.message || 'Vui lòng kiểm tra email để lấy mật khẩu tạm thời.'}`,
                    })
                } else {
                    toast.success({
                        title: 'Đăng nhập thành công',
                        description: `Chào mừng ${payload.user.username || 'bạn'} trở lại!`,
                    })
                }

                return { success: true, isNewUser: payload.isNewUser }
            }
        } catch (error: any) {
            console.log('Google OAuth login error:', error)
            const errorMessage = error?.response?.data?.message || 'Đăng nhập với Google không thành công'
            dispatch(setErrorAction(errorMessage))

            toast.error({
                title: 'Đăng nhập thất bại',
                description: errorMessage,
            })

            return { success: false, message: errorMessage }
        } finally {
            dispatch(setIsLoadingAction(false))
        }
    }
}

export const getGoogleOAuth2Config = (): TAppThunk => {
    return async (dispatch: any) => {
        try {
            const response = await GetGoogleOAuth2Config()
            if (response && response.data && response.data.data) {
                return { success: true, data: response.data.data }
            }
            return { success: false }
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || 'Failed to get OAuth2 configuration'
            dispatch(setErrorAction(errorMessage))
            return { success: false, message: errorMessage }
        }
    }
}
