import LectureDetailPage from '@/feature/lecture/page/LectureDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/lectures/$id')({
    component: LectureDetailPage,
})
