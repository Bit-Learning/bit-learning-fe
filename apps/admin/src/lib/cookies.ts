import { ACCESS_TOKEN, REFRESH_TOKEN } from '@/shared/constants/keys'
import Cookies from 'js-cookie'

/**
 * Cookie utility functions using manual document.cookie approach
 * Replaces js-cookie dependency for better consistency
 */
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift()
    return cookieValue
  }
  return undefined
}
/**
 * Set a cookie with name, value, and optional max age
 */
export function setCookie(
  name: string,
  value: string,
  maxAge: number = DEFAULT_MAX_AGE
): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}`
}
/**
 * Remove a cookie by setting its max age to 0
 */
export function removeCookie(name: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=; path=/; max-age=0`
}

export const setAuthTokens = (accessToken: string, refreshToken: string) => {
  Cookies.set(ACCESS_TOKEN, accessToken, {
    expires: 7, // 7 days
    secure: true,
    sameSite: 'Strict',
  })

  Cookies.set(REFRESH_TOKEN, refreshToken, {
    expires: 30, // 30 days
    secure: true,
    sameSite: 'Strict',
  })
}

export const getAccessToken = (): string | undefined =>
  Cookies.get(ACCESS_TOKEN)

export const getRefreshToken = (): string | undefined =>
  Cookies.get(REFRESH_TOKEN)

export const clearAuthTokens = () => {
  Cookies.remove(ACCESS_TOKEN)
  Cookies.remove(REFRESH_TOKEN)
}
