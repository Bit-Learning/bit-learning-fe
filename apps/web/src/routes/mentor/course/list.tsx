import CoursesListPage from '@/feature/mentor-course/pages/CourseListPage'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const CoursesListPageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <CoursesListPage />
}

export const Route = createFileRoute('/mentor/course/list')({
    component: CoursesListPageWrapper,
})
