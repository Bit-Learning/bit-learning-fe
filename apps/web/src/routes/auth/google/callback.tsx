import { useAppDispatch } from '@/shared/redux/store'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import React from 'react'
import { requestGoogleLogin } from '../../../feature/auth/store/auth.actions'

export const Route = createFileRoute('/auth/google/callback')({
    component: GoogleCallbackPage,
})

function GoogleCallbackPage() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const handleCallback = async () => {
            try {
                // Get the authorization code from URL
                const urlParams = new URLSearchParams(window.location.search)
                const code = urlParams.get('code')
                const errorParam = urlParams.get('error')

                if (errorParam) {
                    setError('Đăng nhập bị hủy bỏ hoặc không thành công')
                    setTimeout(() => navigate({ to: '/signin' }), 3000)
                    return
                }

                if (!code) {
                    setError('Không tìm thấy mã xác thực từ Google')
                    setTimeout(() => navigate({ to: '/signin' }), 3000)
                    return
                }

                // Call the Redux action to handle Google login
                const result: any = await dispatch(requestGoogleLogin(code))

                if (result?.success) {
                    // Redirect to home page after successful login
                    navigate({ to: '/' })
                } else {
                    setError(result?.message || 'Đăng nhập thất bại')
                    setTimeout(() => navigate({ to: '/signin' }), 3000)
                }
            } catch (err: any) {
                console.error('Google OAuth callback error:', err)
                setError('Có lỗi xảy ra trong quá trình đăng nhập')
                setTimeout(() => navigate({ to: '/signin' }), 3000)
            }
        }

        handleCallback()
    }, [dispatch, navigate])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
                {error ? (
                    <>
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <svg
                                    className="h-8 w-8 text-red-600"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">Đăng nhập thất bại</h2>
                        <p className="text-sm text-gray-600">{error}</p>
                        <p className="mt-4 text-xs text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
                    </>
                ) : (
                    <>
                        <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-blue-600" />
                        <h2 className="mb-2 text-xl font-bold text-gray-900">Đang xử lý đăng nhập</h2>
                        <p className="text-sm text-gray-600">
                            Vui lòng đợi trong khi chúng tôi xác thực thông tin của bạn...
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
