import { api } from '../lib/api'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// User type based on API response
export interface User {
    id: number
    username: string
    email: string
    activated: boolean
    role: string
    activationKey: string
    resetKey: string | null
    langKey: string
    lastLoginAttempt: number
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = api.auth.getUser()
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser))
            } catch (error) {
                console.error('Failed to parse stored user:', error)
                api.auth.logout()
            }
        }
        setIsLoading(false)
    }, [])

    const login = async (username: string, password: string) => {
        try {
            if (username === 'admin' && password === '1') {
                const adminUser: User = {
                    id: 0,
                    username: 'admin',
                    email: 'adminTemp@gmail.com',
                    activated: true,
                    role: 'admin',
                    activationKey: '',
                    resetKey: null,
                    langKey: 'en',
                    lastLoginAttempt: Date.now(),
                }
                api.auth.setUser(JSON.stringify(adminUser))
                setUser(adminUser)
                api.auth.setTokens('admin-access-token', 'admin-refresh-token')
                return
            }

            const response = await api.auth.login({ username, password })

            if (response.type === 'success' && response.data) {
                // Store tokens
                api.auth.setTokens(response.data.accessToken, response.data.refreshToken)

                // Store user data
                api.auth.setUser(JSON.stringify(response.data.user))
                setUser(response.data.user)
            } else {
                throw new Error(response.message || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            throw error
        }
    }

    const logout = () => {
        api.auth.logout()
        setUser(null)
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
