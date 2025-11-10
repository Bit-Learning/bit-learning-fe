import Cookies from 'js-cookie'
import { ACCESS_TOKEN, REFRESH_TOKEN } from './keys'

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
    Cookies.set(ACCESS_TOKEN, accessToken, {
        expires: 7, // 7 days
        secure: window.location.protocol === 'https:',
        sameSite: 'Strict',
    })

    Cookies.set(REFRESH_TOKEN, refreshToken, {
        expires: 30, // 30 days
        secure: window.location.protocol === 'https:',
        sameSite: 'Strict',
    })
}

export const getAccessToken = (): string | undefined => Cookies.get(ACCESS_TOKEN)

export const getRefreshToken = (): string | undefined => Cookies.get(REFRESH_TOKEN)

export const clearAuthTokens = () => {
    Cookies.remove(ACCESS_TOKEN)
    Cookies.remove(REFRESH_TOKEN)
}
