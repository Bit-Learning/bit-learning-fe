import CreateCoursePage from '@/feature/mentor-course/pages/CreateCoursePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/course/create')({
    component: CreateCoursePage,
})
