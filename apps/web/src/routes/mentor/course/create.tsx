import CreateCoursePage from '@/feature/mentor-course/pages/CreateCoursePage'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const CreateCoursePageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <CreateCoursePage />
}

export const Route = createFileRoute('/mentor/course/create')({
    component: CreateCoursePageWrapper,
})
