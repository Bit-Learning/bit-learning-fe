import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@workspace/ui/components/Sonner'
import { mcourseApi } from '../api/mcourse.api'
import { CreateCourseRequest, UpdateCourseRequest } from '../types/mcourse.type'

export const mcourseKeys = {
    all: ['mcourses'] as const,
    detail: (id: number) => ['mcourses', 'detail', id] as const,
}

export const useCreateCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreateCourseRequest) => mcourseApi.createCourse(data),
        onSuccess: response => {
            queryClient.invalidateQueries({ queryKey: mcourseKeys.all })
            toast.success({
                title: 'Tạo khóa học thành công!',
                description: response.data.message || 'Khóa học đã được tạo và sẵn sàng sử dụng.',
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Tạo khóa học thất bại!',
                description: error?.response?.data?.message || 'Đã xảy ra lỗi khi tạo khóa học.',
            })
        },
    })
}

export const useUpdateCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCourseRequest }) => mcourseApi.updateCourse(id, data),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: mcourseKeys.all })
            queryClient.invalidateQueries({
                queryKey: mcourseKeys.detail(variables.id),
            })
            toast.success({
                title: 'Cập nhật khóa học thành công!',
                description: response.data.message || 'Thông tin khóa học đã được cập nhật.',
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Cập nhật khóa học thất bại!',
                description: error?.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật khóa học.',
            })
        },
    })
}

export const useDeleteCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: number) => mcourseApi.deleteCourse(id),
        onSuccess: response => {
            queryClient.invalidateQueries({ queryKey: mcourseKeys.all })
            toast.success({
                title: 'Xóa khóa học thành công!',
                description: response.data.message || 'Khóa học đã được xóa vĩnh viễn khỏi hệ thống.',
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Xóa khóa học thất bại!',
                description: error?.response?.data?.message || 'Đã xảy ra lỗi khi xóa khóa học.',
            })
        },
    })
}

export const useHideOrShowCourse = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, isHidden }: { id: number; isHidden: boolean }) => mcourseApi.hideOrShowCourse(id, isHidden),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: mcourseKeys.all })
            const action = variables.isHidden ? 'ẩn' : 'hiển thị'
            toast.success({
                title: `${action === 'ẩn' ? 'Ẩn' : 'Hiển thị'} khóa học thành công!`,
                description: response.data.message || `Khóa học đã được ${action}.`,
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Cập nhật trạng thái thất bại!',
                description: error?.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật trạng thái khóa học.',
            })
        },
    })
}

export const useUpdateThumbnail = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, thumbnail }: { id: number; thumbnail: File }) =>
            mcourseApi.updateCourseThumbnail(id, thumbnail),
        onSuccess: (response, variables) => {
            queryClient.invalidateQueries({ queryKey: mcourseKeys.all })
            queryClient.invalidateQueries({
                queryKey: mcourseKeys.detail(variables.id),
            })
            toast.success({
                title: 'Cập nhật ảnh bìa thành công!',
                description: response.data.message || 'Ảnh bìa khóa học đã được cập nhật.',
            })
        },
        onError: (error: any) => {
            toast.error({
                title: 'Cập nhật ảnh bìa thất bại!',
                description: error?.response?.data?.message || 'Đã xảy ra lỗi khi tải lên ảnh bìa.',
            })
        },
    })
}
