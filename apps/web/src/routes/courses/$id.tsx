import CourseDetailPage from '@/feature/course/page/CourseDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/courses/$id')({
    component: CourseDetailPage,
})
