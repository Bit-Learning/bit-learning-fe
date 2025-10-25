import { setUserInfoAction, setErrorAction, setIsAuthenticatedAction, setIsLoadingAction } from '.'
import { ForgotPassword, GetAccountProfile, Login, Register, ResetPassword } from '../service/AuthService'
import type { TForgotPasswordRequest, TRegisterRequest, TResetPasswordRequest } from '../type/authState'
import { TAppThunk } from '@/app/type/AppState'
import { Roles } from '@/shared/constants/enums'
import { setAuthTokens } from '@/shared/lib/cookies'

export const requestLogin = ({ email, password }: { email: string; password: string }): TAppThunk => {
    return async (dispatch: any) => {
        dispatch(setIsLoadingAction(true))
        try {
            const response = await Login({ email, password, role: Roles.USER })
            if (response) {
                const payload = response.data.data
                setAuthTokens(payload.accessToken, payload.refreshToken)
                dispatch(setIsAuthenticatedAction(true))
                const profileResp = await GetAccountProfile()
                if (profileResp) {
                    const profileData = profileResp.data.data
                    dispatch(setUserInfoAction(profileData))
                }
            }
        } catch (error: any) {
            const errorMessage =
                error?.response?.data.message || error?.response?.data.error || 'Đăng nhập không thành công'
            dispatch(setErrorAction(errorMessage))
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
