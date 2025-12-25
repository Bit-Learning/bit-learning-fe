import QuizPage from '@/feature/mentor-course/pages/QuizPage'
import { useLayout } from '@/shared/context/layout-context'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

const QuizPageWrapper = () => {
    const { setLayoutConfig } = useLayout()

    useEffect(() => {
        setLayoutConfig({ showHeader: false, showFooter: false })

        return () => {
            setLayoutConfig({ showHeader: true, showFooter: true })
        }
    }, [setLayoutConfig])

    return <QuizPage />
}

export const Route = createFileRoute('/mentor/course/quiz')({
    component: QuizPageWrapper,
})
