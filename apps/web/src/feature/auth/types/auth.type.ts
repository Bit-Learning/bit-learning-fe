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
export type TRegisterRequest = {
    email: string
    password: string
    firstName: string
    lastName: string
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

export type TSocialProfile = {
    facebook?: string
    instagram?: string
    threads?: string
    twitter?: string
    linkedin?: string
    github?: string
    website?: string
}

export type TUserProfile = {
    id: number
    username: string
    firstName: string
    lastName: string
    avatar: string
    coverImage?: string
    pronouns?: string
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
    mfaEnabled: boolean
    bio?: string
    phoneNumber?: string
    location?: string
    socialProfile?: TSocialProfile
    jobTitle?: string
}

export type TWalletInfo = {
    id: number
    balance: number
}

// MFA Types
export type TTwoFactorAuthResponse = {
    secret: string
    qrCodeUrl: string
    manualEntryKey: string
}

export type TVerifyTotpRequest = {
    totpCode: string
}

export type TLoginWith2FARequest = {
    email: string
    password: string
    totpCode: string
}

export type TTwoFactorRequiredResponse = {
    requires2FA: boolean
    email: string
    message: string
}

export type TCompleteTwoFactorRequest = {
    email: string
    totpCode: string
}
