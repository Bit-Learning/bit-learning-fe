import { useQuery } from '@tanstack/react-query'
import { lectureApi } from '../api/lecture.api'

export const lectureKeys = {
    all: ['lectures'] as const,
    quizzes: () => [...lectureKeys.all, 'quizzes'] as const,
    quiz: (id: number) => [...lectureKeys.quizzes(), id] as const,
}

export const useLectureQuiz = (id: number) => {
    return useQuery({
        queryKey: lectureKeys.quiz(id),
        queryFn: async () => {
            const response = await lectureApi.getLectureQuizById(id)
            return response.data.data
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
    })
}

export const useVideoUrls = (lectureId: number) => {
    const m3u8Url = lectureApi.getVideoM3u8Url(lectureId)

    const getSegmentUrl = (segment: string) => {
        return lectureApi.getVideoSegmentUrl(lectureId, segment)
    }

    return {
        m3u8Url,
        getSegmentUrl,
    }
}
