import { selectAuthStateInfo } from '@/feature/auth/store/auth.selectors'
import { useNavigate } from '@tanstack/react-router'
import React from 'react'
import { useSelector } from 'react-redux'

interface ProtectedRouteProps {
    children: React.ReactNode
    redirectTo?: string
}

/**
 * Protected Route Component
 *
 * Wraps routes that require authentication.
 * Redirects to signin page if user is not authenticated.
 *
 * @example
 * ```tsx
 * <ProtectedRoute>
 *   <MatrixPage />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, redirectTo = '/signin' }) => {
    const { isAuthenticated, isLoading } = useSelector(selectAuthStateInfo)
    const navigate = useNavigate()

    React.useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate({ to: redirectTo })
        }
    }, [isAuthenticated, isLoading, navigate, redirectTo])

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                    <p className="text-gray-600">Đang kiểm tra xác thực...</p>
                </div>
            </div>
        )
    }

    // Don't render children if not authenticated
    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
