import { setErrorAction } from '../../auth/store'
import { requestLogin, requestRegister, requestResetPassword } from '../../auth/store/auth.actions'
import { selectAuthStateInfo } from '../../auth/store/auth.selectors'
import type { TResetPasswordRequest } from '../type/authState'
import { useAppDispatch } from '@/shared/redux/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'
import { Input } from '@workspace/ui/components/Input'
import { ChevronLeftIcon, EyeIcon, EyeClosedIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z
    .object({
        password: z
            .string()
            .min(3, { message: 'Mật khẩu phải có ít nhất 3 ký tự' })
            .max(50, { message: 'Mật khẩu không được vượt quá 50 ký tự' }),
        confirmPassword: z
            .string()
            .min(3, { message: 'Xác nhận mật khẩu phải có ít nhất 3 ký tự' })
            .max(50, { message: 'Xác nhận mật khẩu không được vượt quá 50 ký tự' }),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Mật khẩu và xác nhận mật khẩu không khớp',
    })

const ResetPasswordForm: React.FC = () => {
    const { isLoading, isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo)
    const [showPassword, setShowPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
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
        const token = new URLSearchParams(window.location.search).get('token') || ''
        const email = new URLSearchParams(window.location.search).get('email') || ''
        if (!token || !email) {
            toast.error('Yêu cầu không hợp lệ. Vui lòng thử lại.')
            return
        }
        const body: TResetPasswordRequest = {
            token,
            email,
            newPassword: values.password,
            confirmNewPassword: values.confirmPassword,
        }
        const result = await dispatch(requestResetPassword(body))
        if (result !== undefined) {
            navigate({ to: '/signin' })
            toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.')
        }
    }

    return (
        <div className="flex flex-1 flex-col">
            {isLoading && <div></div>}
            <div className="mx-auto w-full max-w-md pt-10">
                <Link
                    to="/"
                    className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                    <ChevronLeftIcon className="size-5" />
                    Trang chủ
                </Link>
            </div>
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
                <div>
                    <div className="mb-5 sm:mb-8">
                        <h1 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
                            Đặt lại mật khẩu
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nhập mật khẩu mới của bạn để đặt lại mật khẩu!
                        </p>
                    </div>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex flex-col gap-4">
                                    <FormField
                                        control={form.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="mb-2 font-semibold dark:text-white/90">
                                                    Mật khẩu mới <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="Mật khẩu"
                                                            {...field}
                                                            className="focus-visible:border-primary focus-visible:ring-primary h-11 w-full border focus-visible:ring-1 dark:bg-white/5 dark:text-white/90"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showPassword ? (
                                                                <EyeIcon className="size-5" />
                                                            ) : (
                                                                <EyeClosedIcon className="size-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="mb-2 font-semibold dark:text-white/90">
                                                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Input
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            placeholder="Xác nhận mật khẩu"
                                                            {...field}
                                                            className="focus-visible:border-primary focus-visible:ring-primary h-11 w-full border focus-visible:ring-1 dark:bg-white/5 dark:text-white/90"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500 hover:text-gray-700"
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeIcon className="size-5" />
                                                            ) : (
                                                                <EyeClosedIcon className="size-5" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage className="text-xs" />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <Button className="w-full" type="submit" size={'lg'}>
                                    Đặt lại mật khẩu
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-5">
                            <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/signin"
                                    className="text-primary hover:text-secondary dark:text-white/90 dark:hover:text-white/70"
                                >
                                    Đăng nhập{' '}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResetPasswordForm
