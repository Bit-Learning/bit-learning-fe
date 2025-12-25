import CreateQuizPage from '@/feature/mentor-course/pages/CreateQuizPage'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const CreateQuizPageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <CreateQuizPage />
}

export const Route = createFileRoute('/mentor/course/quiz')({
    component: CreateQuizPageWrapper,
})
