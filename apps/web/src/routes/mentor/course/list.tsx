import CoursesListPage from '@/feature/mentor-course/pages/CourseListPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/course/list')({
    component: CoursesListPage,
})
