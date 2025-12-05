export type TAuthState = {
    isAuthenticated: boolean
    isLoading: boolean
    errorMsg: string | null
    userInfo: TUserProfile | null
}

export type TLoginRequest = {
    email: string
    password: string
}

export type TLoginRoleRequest = {
    email: string
    password: string
    role: string
}
export interface TLoginRoleResponse {
    accessToken: string
    refreshToken: string
    tokenType: string
    expiresIn: string
    refreshExpiresIn: string
    user: TUserProfile
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
    email: string
    key: string
    newPassword: string
    confirmNewPassword: string
}

export type TChangePasswordRequest = {
    currentPassword: string
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
    lastLoginAttempt: string | null
    createdAt: string
    updatedAt: string
    wallet: TWalletInfo
    oauthProvider: string | null
    oauthId: string | null
}

export type TWalletInfo = {
    id: number
    balance: number
}
