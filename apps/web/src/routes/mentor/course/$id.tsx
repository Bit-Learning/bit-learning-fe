import CourseDetailPage from '@/feature/mentor-course/pages/CourseDetailPage'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const CourseDetailPageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <CourseDetailPage />
}

export const Route = createFileRoute('/mentor/course/$id')({
    component: CourseDetailPageWrapper,
})
