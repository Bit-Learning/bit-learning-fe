import QuestionDetail from '@/feature/matrix/page/QuestionDetail'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/questions/$id')({
    component: () => (
        <ProtectedRoute>
            <QuestionDetail />
        </ProtectedRoute>
    ),
})
