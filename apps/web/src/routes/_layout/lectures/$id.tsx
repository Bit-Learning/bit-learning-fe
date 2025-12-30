import LectureDetailPage from '@/feature/lecture/page/LectureDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/lectures/$id')({
    component: LectureDetailPage,
})
