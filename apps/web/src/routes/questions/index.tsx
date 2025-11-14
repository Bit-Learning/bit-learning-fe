import QuestionList from '@/feature/matrix/page/QuestionList'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/questions/')({
    component: () => (
        <ProtectedRoute>
            <QuestionList />
        </ProtectedRoute>
    ),
})
