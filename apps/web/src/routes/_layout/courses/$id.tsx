import CourseDetailPage from '@/feature/course/page/CourseDetail'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/courses/$id')({
    component: CourseDetailPage,
})
