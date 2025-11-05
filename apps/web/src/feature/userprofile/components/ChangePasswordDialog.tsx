import { changePassword } from '@/feature/auth/store/auth.actions'
import type { TChangePasswordRequest } from '@/feature/auth/type/authState'
import { useAppDispatch } from '@/shared/redux/store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@workspace/ui/components/Button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@workspace/ui/components/Form'
import { Input } from '@workspace/ui/components/Input'
import { toast } from '@workspace/ui/components/Sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogOverlay,
    DialogTitle,
} from '@workspace/ui/components/update/dialog'
import { EyeClosedIcon, EyeIcon } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const formSchema = z
    .object({
        currentPassword: z
            .string()
            .min(6, { message: 'Mật khẩu hiện tại phải có ít nhất 6 ký tự' })
            .max(50, { message: 'Mật khẩu hiện tại không được vượt quá 50 ký tự' }),
        newPassword: z
            .string()
            .min(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
            .max(50, { message: 'Mật khẩu mới không được vượt quá 50 ký tự' }),
        confirmNewPassword: z
            .string()
            .min(6, { message: 'Xác nhận mật khẩu phải có ít nhất 6 ký tự' })
            .max(50, { message: 'Xác nhận mật khẩu không được vượt quá 50 ký tự' }),
    })
    .refine(data => data.newPassword === data.confirmNewPassword, {
        message: 'Mật khẩu mới và xác nhận mật khẩu không khớp',
        path: ['confirmNewPassword'],
    })
    .refine(data => data.currentPassword !== data.newPassword, {
        message: 'Mật khẩu mới phải khác mật khẩu hiện tại',
        path: ['newPassword'],
    })

interface ChangePasswordDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
    const dispatch = useAppDispatch()
    const [isLoading, setIsLoading] = React.useState(false)
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmNewPassword: '',
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        const body: TChangePasswordRequest = {
            currentPassword: values.currentPassword,
            newPassword: values.newPassword,
            confirmNewPassword: values.confirmNewPassword,
        }

        const result: any = await dispatch(changePassword(body))

        if (result?.success) {
            toast.success({
                title: 'Đổi mật khẩu thành công!',
                description: 'Mật khẩu của bạn đã được cập nhật.',
            })
            form.reset()
            onOpenChange(false)
        } else {
            toast.error({
                title: 'Đổi mật khẩu thất bại',
                description: result?.message || 'Có lỗi xảy ra, vui lòng thử lại.',
            })
        }
        setIsLoading(false)
    }

    return (
        <Dialog modal open={open} onOpenChange={onOpenChange}>
            <DialogOverlay />
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Đổi mật khẩu</DialogTitle>
                    <DialogDescription>
                        Nhập mật khẩu hiện tại và mật khẩu mới của bạn. Mật khẩu phải có ít nhất 6 ký tự.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showCurrentPassword ? 'text' : 'password'}
                                                placeholder="Nhập mật khẩu hiện tại"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500 hover:text-gray-700"
                                            >
                                                {showCurrentPassword ? (
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

                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Mật khẩu mới <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showNewPassword ? 'text' : 'password'}
                                                placeholder="Nhập mật khẩu mới"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500 hover:text-gray-700"
                                            >
                                                {showNewPassword ? (
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

                        <FormField
                            control={form.control}
                            name="confirmNewPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Nhập lại mật khẩu mới"
                                                {...field}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-gray-500 hover:text-gray-700"
                                            >
                                                {showConfirmPassword ? (
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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                isDisabled={isLoading}
                            >
                                Hủy
                            </Button>
                            <Button type="submit" isDisabled={isLoading}>
                                {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
