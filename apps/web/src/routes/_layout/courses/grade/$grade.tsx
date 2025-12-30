import CoursesByGradePage from '@/feature/course/page/CourseByGrade'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/courses/grade/$grade')({
    component: CoursesByGradePage,
})
