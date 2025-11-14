import GenerateExamFromQuestions from '@/feature/matrix/page/GenerateExamFromQuestions'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/exams/generate')({
    component: () => (
        <ProtectedRoute>
            <GenerateExamFromQuestions />
        </ProtectedRoute>
    ),
})
