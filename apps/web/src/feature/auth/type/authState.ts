export type TAuthState = {
    isAuthenticated: boolean
    isLoading: boolean
    errorMsg: string | null
    userInfo: TUserProfile | null
}

export type TLoginRequest = {
    email: string
    password: string
    role: string
}
export type TRegisterRequest = {
    email: string
    password: string
    name: string
}
export type TRefreshTokenRequest = {
    refreshToken: string
}
export type TForgotPasswordRequest = {
    email: string
}

export type TResetPasswordRequest = {
    token: string
    email: string
    newPassword: string
    confirmNewPassword: string
}
export type TUserProfile = {
    id: string
    email: string
    name: string
    role: string
    avatar?: string
    createdAt: string
    updatedAt: string
}
