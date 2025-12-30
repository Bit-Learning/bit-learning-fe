import CourseDetailPage from '@/feature/mentor-course/pages/CourseDetailPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/course/$id')({
    component: CourseDetailPage,
})
