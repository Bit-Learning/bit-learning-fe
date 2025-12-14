export type TChangePasswordRequest = {
    email: string
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
    mfaEnabled: boolean
}

export type TWalletInfo = {
    id: number
    balance: number
}
