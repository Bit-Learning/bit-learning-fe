import { useAppDispatch } from '@/shared/redux/store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { courseApi } from '../api/course.api'
import {
    selectCourseState,
    setPageAction,
    setSelectedCourseIdAction,
    setSelectedGradeAction,
} from '../store/course.store'

export const courseKeys = {
    all: ['courses'] as const,
    byGrade: (grade: number, page: number, size: number) => ['courses', 'grade', grade, page, size] as const,
    detail: (id: number) => ['courses', 'detail', id] as const,
}

export const useCoursesByGrade = (grade?: number) => {
    const { selectedGrade, pagination } = useSelector(selectCourseState)
    const targetGrade = grade ?? selectedGrade

    return useQuery({
        queryKey: courseKeys.byGrade(targetGrade ?? 0, pagination.page, pagination.size),
        queryFn: async () => {
            if (!targetGrade) return null
            const response = await courseApi.getCoursesByGrade(targetGrade, pagination.page, pagination.size)
            return response.data.data
        },
        enabled: !!targetGrade,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

export const useCourseDetail = (id?: number) => {
    const { selectedCourseId } = useSelector(selectCourseState)
    const targetId = id ?? selectedCourseId

    return useQuery({
        queryKey: courseKeys.detail(targetId ?? 0),
        queryFn: async () => {
            if (!targetId) return null
            const response = await courseApi.getCourseById(targetId)
            return response.data.data
        },
        enabled: !!targetId,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

export const useCourseActions = () => {
    const dispatch = useAppDispatch()

    const selectCourse = (id: number) => {
        dispatch(setSelectedCourseIdAction(id))
    }

    const selectGrade = (grade: number) => {
        dispatch(setSelectedGradeAction(grade))
    }

    const changePage = (page: number) => {
        dispatch(setPageAction(page))
    }

    return {
        selectCourse,
        selectGrade,
        changePage,
    }
}

export const usePrefetchCourse = () => {
    const queryClient = useQueryClient()

    const prefetchCourseDetail = (id: number) => {
        queryClient.prefetchQuery({
            queryKey: courseKeys.detail(id),
            queryFn: async () => {
                const response = await courseApi.getCourseById(id)
                return response.data.data
            },
            staleTime: 5 * 60 * 1000,
        })
    }

    return { prefetchCourseDetail }
}

export const useCourseState = () => {
    return useSelector(selectCourseState)
}
