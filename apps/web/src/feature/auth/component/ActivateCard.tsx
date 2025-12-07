import { useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useActivateAccount } from '../queries/useAuth'

const ActivateCard: React.FC = () => {
    const search = useSearch({ from: '/api/auth/activate' })
    const navigate = useNavigate()
    const { mutate: activateAccount, isSuccess, isError, error } = useActivateAccount()
    const [activationStatus, setActivationStatus] = useState<'pending' | 'success' | 'error'>('pending')

    useEffect(() => {
        const key = (search as any)?.key

        if (!key) {
            setActivationStatus('error')
            return
        }
        activateAccount(key)
    }, [search, activateAccount])

    useEffect(() => {
        if (isSuccess) {
            setActivationStatus('success')
            setTimeout(() => {
                navigate({ to: '/signin' })
            }, 3000)
        }

        if (isError) {
            setActivationStatus('error')
        }
    }, [isSuccess, isError, navigate])

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="rounded-lg bg-white p-8 shadow-md">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">Kích hoạt tài khoản</h2>
                    </div>

                    <div className="mt-8">
                        {activationStatus === 'pending' && (
                            <div className="text-center">
                                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                                <p className="text-gray-600">Đang kích hoạt tài khoản của bạn...</p>
                            </div>
                        )}

                        {activationStatus === 'success' && (
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                    <svg
                                        className="h-6 w-6 text-green-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Kích hoạt thành công!</h3>
                                <p className="mb-4 text-gray-600">Tài khoản của bạn đã được kích hoạt thành công.</p>
                                <p className="text-sm text-gray-500">Đang chuyển hướng đến trang đăng nhập...</p>
                                <button
                                    onClick={() => navigate({ to: '/signin' })}
                                    className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                >
                                    Đăng nhập ngay
                                </button>
                            </div>
                        )}

                        {activationStatus === 'error' && (
                            <div className="text-center">
                                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                    <svg
                                        className="h-6 w-6 text-red-600"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-lg font-semibold text-gray-900">Kích hoạt thất bại</h3>
                                <p className="mb-4 text-gray-600">
                                    {error?.response?.data?.message ||
                                        'Liên kết kích hoạt không hợp lệ hoặc đã hết hạn.'}
                                </p>
                                <div className="space-y-2">
                                    <button
                                        onClick={() => navigate({ to: '/signup' })}
                                        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                    >
                                        Đăng ký lại
                                    </button>
                                    <button
                                        onClick={() => navigate({ to: '/signin' })}
                                        className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                    >
                                        Quay lại đăng nhập
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ActivateCard
