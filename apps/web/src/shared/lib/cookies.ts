import Cookies from 'js-cookie'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './keys'

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
    // Only use secure cookies in production (HTTPS)
    const isProduction = window.location.protocol === 'https:'

    Cookies.set(ACCESS_TOKEN, accessToken, {
        expires: 7, // 7 days
        secure: isProduction,
        sameSite: 'Strict',
    })

    Cookies.set(REFRESH_TOKEN, refreshToken, {
        expires: 180, // 6 months (30 * 6 = 180 days)
        secure: isProduction,
        sameSite: 'Strict',
    })

    // Debug log to verify cookies are set
    console.log('[Cookies] Tokens stored:', {
        hasAccessToken: !!Cookies.get(ACCESS_TOKEN),
        hasRefreshToken: !!Cookies.get(REFRESH_TOKEN),
        isProduction,
    })
}

export const getAccessToken = (): string | undefined => Cookies.get(ACCESS_TOKEN)

export const getRefreshToken = (): string | undefined => Cookies.get(REFRESH_TOKEN)

export const clearAuthTokens = () => {
    Cookies.remove(ACCESS_TOKEN)
    Cookies.remove(REFRESH_TOKEN)
}
