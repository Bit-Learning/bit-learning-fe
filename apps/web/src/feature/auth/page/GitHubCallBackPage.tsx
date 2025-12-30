import { useGitHubLogin } from '@/feature/auth/queries/useAuth'
import { useNavigate } from '@tanstack/react-router'
import { Loader2, XCircle } from 'lucide-react'
import React from 'react'

interface Props {
    hasError: string | boolean | null
    localError: string | null
    error: unknown
}

function GitHubCallbackPage() {
    const navigate = useNavigate()
    const { mutate: githubLogin, isPending, isError, error } = useGitHubLogin()
    const [localError, setLocalError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const handleCallback = async () => {
            try {
                const urlParams = new URLSearchParams(window.location.search)
                const code = urlParams.get('code')
                const errorParam = urlParams.get('error')

                if (errorParam) {
                    setLocalError('Đăng nhập bị hủy bỏ hoặc không thành công')
                    setTimeout(() => navigate({ to: '/signin' }), 3000)
                    return
                }

                if (!code) {
                    setLocalError('Không tìm thấy mã xác thực từ GitHub')
                    setTimeout(() => navigate({ to: '/signin' }), 3000)
                    return
                }

                githubLogin(code, {
                    onSuccess: () => {
                        navigate({ to: '/' })
                    },
                    onError: (err: any) => {
                        const errorMessage = err?.response?.data?.message || 'Đăng nhập thất bại'
                        setLocalError(errorMessage)
                        setTimeout(() => navigate({ to: '/signin' }), 3000)
                    },
                })
            } catch (err: any) {
                console.error('GitHub OAuth callback error:', err)
                setLocalError('Có lỗi xảy ra trong quá trình đăng nhập')
                setTimeout(() => navigate({ to: '/signin' }), 3000)
            }
        }

        handleCallback()
    }, [githubLogin, navigate])

    const hasError = isError || localError

    return GitHubCallbackPageContent({ hasError, localError, error })
}

function GitHubCallbackPageContent({ hasError, localError, error }: Props) {
    return (
        <div className="flex min-h-screen items-center justify-center from-gray-50 to-gray-100">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-8 text-center shadow-xl">
                {hasError ? (
                    <>
                        <div className="mb-4 flex justify-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                                <XCircle className="h-8 w-8 text-red-600" />
                            </div>
                        </div>
                        <h2 className="mb-2 text-xl font-bold text-gray-900">Đăng nhập thất bại</h2>
                        <p className="text-sm text-gray-600">
                            {localError || (error as any)?.response?.data?.message || 'Đã xảy ra lỗi'}
                        </p>
                        <p className="mt-4 text-xs text-gray-500">Đang chuyển hướng về trang đăng nhập...</p>
                    </>
                ) : (
                    <>
                        <Loader2 className="mx-auto mb-4 h-16 w-16 animate-spin text-gray-900" />
                        <h2 className="mb-2 text-xl font-bold text-gray-900">Đang xử lý đăng nhập</h2>
                        <p className="text-sm text-gray-600">
                            Vui lòng đợi trong khi chúng tôi xác thực thông tin của bạn...
                        </p>
                        <div className="mt-6 flex justify-center gap-2">
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-900 [animation-delay:-0.3s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-900 [animation-delay:-0.15s]"></div>
                            <div className="h-2 w-2 animate-bounce rounded-full bg-gray-900"></div>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default GitHubCallbackPage
