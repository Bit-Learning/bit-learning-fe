import { useAppDispatch } from '@/shared/redux/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button } from '@workspace/ui/components/Button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'
import { Input } from '@workspace/ui/components/Input'
import { toast } from '@workspace/ui/components/Sonner'
import { ChevronLeftIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { z } from 'zod'
import { setErrorAction } from '../../auth/store'
import { requestPasswordResetInit } from '../../auth/store/auth.actions'
import { selectAuthStateInfo } from '../../auth/store/auth.selectors'

const formSchema = z.object({
    email: z
        .string()
        .max(50, { message: 'Email không được vượt quá 50 ký tự' })
        .email({ message: 'Email không hợp lệ' }),
})

const ForgotPasswordForm: React.FC = () => {
    const { isLoading, isAuthenticated, errorMsg } = useSelector(selectAuthStateInfo)
    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: '',
        },
    })

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate({ to: '/' })
            toast.success({ title: 'Đăng nhập thành công!' })
        }
    }, [isAuthenticated, navigate])

    React.useEffect(() => {
        if (errorMsg) {
            toast.error({ title: errorMsg })
            dispatch(setErrorAction(null))
        }
    }, [errorMsg, dispatch])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        dispatch(setErrorAction(null))
        const result: any = await dispatch(requestPasswordResetInit(values.email))

        if (result?.success) {
            toast.success({
                title: 'Email đã được gửi!',
                description: 'Vui lòng kiểm tra email của bạn để đặt lại mật khẩu.',
            })
            form.reset()
        } else {
            toast.error({
                title: 'Gửi email thất bại',
                description: result?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
            })
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
                        <h1 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">Quên Mật Khẩu</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Nhập email của bạn để nhận liên kết đặt lại mật khẩu!
                        </p>
                    </div>
                    <div>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="mb-2 font-semibold dark:text-white/90">
                                                Email <span className="text-red-500">*</span>
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="stuwme@gmail.com"
                                                    {...field}
                                                    className="focus-visible:border-primary focus-visible:ring-primary h-11 border focus-visible:ring-1 dark:bg-white/5 dark:text-white/90"
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs" />
                                        </FormItem>
                                    )}
                                />
                                <Button className="w-full" type="submit" size={'lg'}>
                                    Gửi Yêu Cầu
                                </Button>
                            </form>
                        </Form>

                        <div className="mt-5">
                            <p className="text-center text-sm font-normal text-gray-700 sm:text-start dark:text-gray-400">
                                Đã có tài khoản?{' '}
                                <Link
                                    to="/signin"
                                    className="text-primary hover:text-blue-800 dark:text-white/90 dark:hover:text-white/70"
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

export default ForgotPasswordForm
