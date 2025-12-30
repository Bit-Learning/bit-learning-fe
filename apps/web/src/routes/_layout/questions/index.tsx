import QuestionList from '@/feature/matrix/page/QuestionList'
import { ProtectedRoute } from '@/shared/components/ProtectedRoute'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/questions/')({
    component: () => (
        <ProtectedRoute>
            <QuestionList />
        </ProtectedRoute>
    ),
})
