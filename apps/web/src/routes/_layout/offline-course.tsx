import OfflineCoursePage from '@/feature/course/page/OfflineCourse'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/offline-course')({
    component: OfflineCoursePage,
})
