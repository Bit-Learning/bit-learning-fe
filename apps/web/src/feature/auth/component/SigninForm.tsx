import { Roles } from '@/shared/constants/enums'
import { useAppDispatch } from '@/shared/redux/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Checkbox } from '@workspace/ui/components/Checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'
import { Input } from '@workspace/ui/components/Input'
import { Label } from '@workspace/ui/components/label'
import { ChevronLeftIcon, EyeClosedIcon, EyeIcon, Mail } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'
import { setErrorAction } from '../../auth/store'
import { requestLogin } from '../../auth/store/auth.actions'
import { selectAuthStateInfo } from '../../auth/store/auth.selectors'
import type { TLoginRequest } from '../type/authState'

const formSchema = z.object({
    email: z
        .string()
        .max(50, { message: 'Email không được vượt quá 50 ký tự' })
        .email({ message: 'Email không hợp lệ' }),
    password: z
        .string()
        .min(3, { message: 'Mật khẩu phải có ít nhất 3 ký tự' })
        .max(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' }),
})

const SignInForm: React.FC = () => {
    const { isLoading, isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo)
    const [showPassword, setShowPassword] = React.useState(false)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    })

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate({ to: '/' })
        }
    }, [isAuthenticated, navigate])

    React.useEffect(() => {
        if (errorMsg) {
            toast.error(errorMsg)
            dispatch(setErrorAction(null))
        }
    }, [errorMsg, dispatch])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const body: TLoginRequest = {
            email: values.email,
            password: values.password,
            role: Roles.USER,
        }
        await dispatch(requestLogin(body))
    }

    return (
        <div className="flex h-full w-full flex-col lg:w-1/2">
            {isLoading && <div></div>}

            {/* Header */}
            <div className="flex-shrink-0 p-6">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-400"
                >
                    <ChevronLeftIcon className="size-5" />
                    Trang chủ
                </Link>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 items-center justify-center px-6 pb-6">
                <div className="w-full max-w-md">
                    {/* Logo for mobile */}
                    <div className="mb-8 flex items-center justify-center lg:hidden">
                        <div className="flex items-center space-x-2">
                            <img src="./Logo.png" alt="Bithub Logo" className="h-10 w-36 object-contain" />
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
                        <div className="mb-6 text-center">
                            <div className="mb-4 flex justify-center">
                                <div className="flex items-center space-x-2">
                                    <img src="./Logo.png" alt="Bithub Logo" className="h-8 w-24 object-contain" />
                                </div>
                            </div>
                            <h1 className="mb-2 text-xl font-bold text-gray-900">Chào mừng trở lại!</h1>
                            <p className="text-sm text-gray-600">Đăng nhập để truy cập tài khoản của bạn</p>
                        </div>

                        <div className="mb-6 flex items-center justify-center">
                            <button
                                type="button"
                                className="inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-gray-200 bg-white px-7 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
                            >
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M18.7511 10.1944C18.7511 9.47495 18.6915 8.94995 18.5626 8.40552H10.1797V11.6527H15.1003C15.0011 12.4597 14.4654 13.675 13.2749 14.4916L13.2582 14.6003L15.9087 16.6126L16.0924 16.6305C17.7788 15.1041 18.7511 12.8583 18.7511 10.1944Z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M10.1788 18.75C12.5895 18.75 14.6133 17.9722 16.0915 16.6305L13.274 14.4916C12.5201 15.0068 11.5081 15.3666 10.1788 15.3666C7.81773 15.3666 5.81379 13.8402 5.09944 11.7305L4.99473 11.7392L2.23868 13.8295L2.20264 13.9277C3.67087 16.786 6.68674 18.75 10.1788 18.75Z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.10014 11.7305C4.91165 11.186 4.80257 10.6027 4.80257 9.99992C4.80257 9.3971 4.91165 8.81379 5.09022 8.26935L5.08523 8.1534L2.29464 6.02954L2.20333 6.0721C1.5982 7.25823 1.25098 8.5902 1.25098 9.99992C1.25098 11.4096 1.5982 12.7415 2.20333 13.9277L5.10014 11.7305Z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M10.1789 4.63331C11.8554 4.63331 12.9864 5.34303 13.6312 5.93612L16.1511 3.525C14.6035 2.11528 12.5895 1.25 10.1789 1.25C6.68676 1.25 3.67088 3.21387 2.20264 6.07218L5.08953 8.26943C5.81381 6.15972 7.81776 4.63331 10.1789 4.63331Z"
                                        fill="#EB4335"
                                    />
                                </svg>
                                Đăng nhập với Google
                            </button>
                        </div>

                        <div className="relative py-3">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="bg-white px-4 text-gray-500">hoặc đăng nhập với email</span>
                            </div>
                        </div>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-gray-700">
                                                Email <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Mail className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                                                    <Input
                                                        placeholder="Nhập email của bạn"
                                                        {...field}
                                                        className="h-11 rounded-xl border-2 border-gray-200 pl-10 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-semibold text-gray-700">
                                                Mật khẩu <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <div className="absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full bg-gray-400">
                                                        <div className="h-2 w-2 rounded-full bg-white"></div>
                                                    </div>
                                                    <Input
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Nhập mật khẩu của bạn"
                                                        {...field}
                                                        className="h-11 rounded-xl border-2 border-gray-200 pr-12 pl-10 transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400 transition-colors hover:text-gray-600"
                                                    >
                                                        {showPassword ? (
                                                            <EyeIcon className="h-5 w-5" />
                                                        ) : (
                                                            <EyeClosedIcon className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Checkbox id="remember-me" className="cursor-pointer" />
                                        <Label htmlFor="remember-me" className="cursor-pointer text-sm text-gray-600">
                                            Ghi nhớ đăng nhập
                                        </Label>
                                    </div>
                                    <Link
                                        to="/forgot-password"
                                        className="text-sm font-medium text-blue-700 transition-colors hover:text-blue-800"
                                    >
                                        Quên mật khẩu?
                                    </Link>
                                </div>

                                <Button
                                    className="h-11 w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-800 font-semibold text-white shadow-lg transition-all duration-200 hover:from-blue-800 hover:to-blue-900 hover:shadow-xl"
                                    type="submit"
                                    isDisabled={isLoading}
                                >
                                    {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Chưa có tài khoản?{' '}
                                <Link
                                    to="/signup"
                                    className="font-semibold text-blue-700 transition-colors hover:text-blue-800"
                                >
                                    Đăng ký ngay
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignInForm
