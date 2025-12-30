import QuizPage from '@/feature/mentor-course/pages/QuizPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/mentor/course/quiz')({
    component: QuizPage,
})
