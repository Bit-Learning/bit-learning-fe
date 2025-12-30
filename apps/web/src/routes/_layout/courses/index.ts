import AllCoursesPage from '@/feature/course/page/ListCourse'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/courses/')({
    component: AllCoursesPage,
})
