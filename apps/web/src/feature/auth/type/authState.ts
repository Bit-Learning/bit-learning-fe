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
    firstName: string
    lastName: string
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
    id: number
    username: string
    firstName: string
    lastName: string
    avatar: string
    email: string
    activated: boolean
    role: string
    activationKey: string | null
    resetKey: string | null
    langKey: string
    lastLoginAttempt: number | null
    createdAt: string
    updatedAt: string
}
