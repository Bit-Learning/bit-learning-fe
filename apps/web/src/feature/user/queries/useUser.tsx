import { setIsLoadingAction } from '@/feature/app/store'
import { setErrorAction, setIsAuthenticatedAction, setUserInfoAction } from '@/feature/auth/store'
import { getAccessToken } from '@/shared/lib/cookies'
import { useAppDispatch } from '@/shared/redux/store'
import { useMutation, useQuery } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { useEffect } from 'react'
import { ChangePassword, GetUserProfile } from '../api/user.api'
import { TChangePasswordRequest } from '../types/user.type'

export const userQueryKeys = {
    all: ['profile'] as const,
}

export function useUserProfile() {
    const dispatch = useAppDispatch()

    const query = useQuery({
        queryKey: userQueryKeys.all,
        queryFn: async () => {
            const response = await GetUserProfile()
            return response.data.data
        },
        enabled: !!getAccessToken(),
    })

    useEffect(() => {
        if (query.isSuccess && query.data) {
            dispatch(setUserInfoAction(query.data))
            dispatch(setIsAuthenticatedAction(true))
        }
    }, [query.isSuccess, query.data, dispatch])

    useEffect(() => {
        if (query.isError && query.error) {
            const error = query.error as any
            const errorMessage = error?.response?.data?.message || 'Không thể tải thông tin người dùng'
            dispatch(setErrorAction(errorMessage))

            if (error?.response?.status !== 401) {
                dispatch(setIsAuthenticatedAction(false))
                dispatch(setUserInfoAction(null))
            }
        }
    }, [query.isError, query.error, dispatch])

    return query
}

export function useInitializeAuth() {
    const { refetch } = useUserProfile()

    return () => {
        const accessToken = getAccessToken()
        if (accessToken) {
            refetch()
        }
    }
}

export function useChangePassword() {
    const dispatch = useAppDispatch()

    return useMutation({
        mutationFn: async (data: TChangePasswordRequest) => {
            const response = await ChangePassword(data)
            return response.data
        },
        onMutate: () => {
            dispatch(setIsLoadingAction(true))
        },
        onSuccess: data => {
            toast.success({
                title: 'Đổi mật khẩu thành công',
                description: data.message || 'Mật khẩu của bạn đã được cập nhật.',
            })
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || 'Đổi mật khẩu thất bại'

            dispatch(setErrorAction(errorMessage))

            toast.error({
                title: 'Đổi mật khẩu thất bại',
                description: errorMessage,
            })
        },
        onSettled: () => {
            dispatch(setIsLoadingAction(false))
        },
    })
}
